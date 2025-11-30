# Azure Infrastructure Setup Guide

## Overview

CareerLog is deployed on Azure using the following services:

- **Azure App Service (Linux)** - Hosts both frontend and backend
- **Azure SQL Database** - Stores application data
- **Azure Storage Account** - File storage for attachments
- **Azure Key Vault** - Secrets management
- **Azure Application Gateway** - Load balancing and WAF
- **Microsoft Entra ID (Azure AD)** - Authentication
- **Application Insights** - Monitoring and telemetry

## Resource Group

```bash
az group create \
  --name rg-careerlog-dev \
  --location eastus2 \
  --tags "project=careerlog environment=dev"
```

## Azure SQL Database

```bash
# Create SQL Server
az sql server create \
  --name careerlog-sql-server \
  --resource-group rg-careerlog-dev \
  --location eastus2 \
  --admin-user careerlog_admin \
  --admin-password YourStrongPassword123!

# Create SQL Database
az sql db create \
  --resource-group rg-careerlog-dev \
  --server careerlog-sql-server \
  --name careerlog-db \
  --edition Basic \
  --max-size 2GB

# Configure firewall rules
az sql server firewall-rule create \
  --resource-group rg-careerlog-dev \
  --server careerlog-sql-server \
  --name AllowAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Azure Storage Account

```bash
# Create Storage Account
az storage account create \
  --name careerlogstorage \
  --resource-group rg-careerlog-dev \
  --location eastus2 \
  --sku Standard_LRS \
  --kind StorageV2

# Create container for attachments
az storage container create \
  --name attachments \
  --account-name careerlogstorage \
  --public-access blob
```

## Azure Key Vault

```bash
# Create Key Vault
az keyvault create \
  --name careerlog-kv \
  --resource-group rg-careerlog-dev \
  --location eastus2 \
  --enable-rbac-authorization false

# Add secrets
az keyvault secret set \
  --vault-name careerlog-kv \
  --name database-connection-string \
  --value "jdbc:sqlserver://careerlog-sql-server.database.windows.net:1433;database=careerlog-db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;"

az keyvault secret set \
  --vault-name careerlog-kv \
  --name database-username \
  --value "careerlog_admin"

az keyvault secret set \
  --vault-name careerlog-kv \
  --name database-password \
  --value "YourStrongPassword123!"

az keyvault secret set \
  --vault-name careerlog-kv \
  --name storage-account-key \
  --value $(az storage account keys list --resource-group rg-careerlog-dev --account-name careerlogstorage --query "[0].value" --output tsv)
```

## Application Gateway

```bash
# Create Public IP
az network public-ip create \
  --name careerlog-pip \
  --resource-group rg-careerlog-dev \
  --sku Standard

# Create Application Gateway
az network application-gateway create \
  --name careerlog-agw \
  --resource-group rg-careerlog-dev \
  --location eastus2 \
  --capacity 2 \
  --sku WAF_v2 \
  --public-ip-address careerlog-pip \
  --priority 100
```

## Microsoft Entra ID (Azure AD)

### Backend API Registration

```bash
# Create API app registration
az ad app create \
  --display-name "CareerLog Backend API" \
  --identifier-uris "api://careerlog-backend" \
  --sign-in-audience AzureADMyOrg \
  --required-resource-accesses @backend-api-manifest.json
```

### Frontend SPA Registration

```bash
# Create SPA app registration
az ad app create \
  --display-name "CareerLog Frontend SPA" \
  --identifier-uris "api://careerlog-frontend" \
  --reply-urls "http://localhost:5173" "https://your-domain.com" \
  --implicit-flow true \
  --required-resource-accesses @frontend-spa-manifest.json
```

### API Permissions

- **Microsoft Graph**: User.Read
- **CareerLog Backend API**: access_as_user

## Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app careerlog-ai \
  --location eastus2 \
  --resource-group rg-careerlog-dev \
  --application-type web
```

## App Service Plans

```bash
# Create App Service Plan for Backend
az appservice plan create \
  --name careerlog-backend-plan \
  --resource-group rg-careerlog-dev \
  --location eastus2 \
  --sku B1 \
  --is-linux

# Create App Service Plan for Frontend
az appservice plan create \
  --name careerlog-frontend-plan \
  --resource-group rg-careerlog-dev \
  --location eastus2 \
  --sku B1 \
  --is-linux
```

## App Services

### Backend App Service

```bash
# Create Backend App Service
az webapp create \
  --name careerlog-backend-app \
  --resource-group rg-careerlog-dev \
  --plan careerlog-backend-plan \
  --runtime "JAVA:17-java17" \
  --deployment-local-git

# Configure App Settings
az webapp config appsettings set \
  --name careerlog-backend-app \
  --resource-group rg-careerlog-dev \
  --settings \
    SPRING_PROFILES_ACTIVE=azure \
    AZURE_KEYVAULT_URI=https://careerlog-kv.vault.azure.net/ \
    APPLICATIONINSIGHTS_CONNECTION_STRING=YOUR_APP_INSIGHTS_CONNECTION_STRING \
    WEBSITE_RUN_FROM_PACKAGE=1
```

### Frontend App Service

```bash
# Create Frontend App Service
az webapp create \
  --name careerlog-frontend-app \
  --resource-group rg-careerlog-dev \
  --plan careerlog-frontend-plan \
  --runtime "NODE|18-lts"

# Configure App Settings
az webapp config appsettings set \
  --name careerlog-frontend-app \
  --resource-group rg-careerlog-dev \
  --settings \
    WEBSITE_RUN_FROM_PACKAGE=1
```

## Managed Identity Configuration

```bash
# Enable System-Assigned Managed Identity
az webapp identity assign \
  --name careerlog-backend-app \
  --resource-group rg-careerlog-dev

az webapp identity assign \
  --name careerlog-frontend-app \
  --resource-group rg-careerlog-dev

# Grant Key Vault access
az keyvault set-policy \
  --name careerlog-kv \
  --object-id $(az webapp identity show --name careerlog-backend-app --resource-group rg-careerlog-dev --query principalId --output tsv) \
  --secret-permissions get list

# Grant Storage access
az role assignment create \
  --assignee $(az webapp identity show --name careerlog-backend-app --resource-group rg-careerlog-dev --query principalId --output tsv) \
  --role "Storage Blob Data Contributor" \
  --scope $(az storage account show --name careerlogstorage --query id --output tsv)
```

## Environment Variables

### Backend (.env.azure)
```bash
# Azure Configuration
AZURE_DATABASE_URL=jdbc:sqlserver://careerlog-sql-server.database.windows.net:1433;database=careerlog-db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
AZURE_DATABASE_USERNAME=careerlog_admin
AZURE_DATABASE_PASSWORD=YourStrongPassword123!

AZURE_STORAGE_ACCOUNT_NAME=careerlogstorage
AZURE_STORAGE_CONTAINER_NAME=attachments

AZURE_KEYVAULT_URI=https://careerlog-kv.vault.azure.net/

# Azure AD Configuration
AZURE_AD_CLIENT_ID=your-backend-client-id
AZURE_AD_ISSUER_URI=https://sts.windows.net/your-tenant-id/

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key;IngestionEndpoint=your-endpoint

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### Frontend (.env.azure.production)
```bash
# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-frontend-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_AZURE_REDIRECT_URI=https://your-domain.com

# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Cost Optimization

- Use **Azure App Service B1 tier** ($13/month) for development
- Use **Azure SQL Basic tier** (~$5/month) for development
- Use **Azure Storage LRS** for cost-effective storage
- Configure **Auto-scale** for production
- Enable **Reserved instances** for production workloads

## Security Considerations

1. **Application Gateway WAF** - Enable OWASP 3.2 rules
2. **Private Endpoints** - Use for Azure SQL and Key Vault in production
3. **Managed Identity** - Never store credentials in App Settings
4. **Network Security Groups** - Restrict access to resources
5. **SSL/TLS** - Enforce TLS 1.2 minimum
6. **CORS** - Configure proper CORS policies
7. **Key Vault Access** - Use principle of least privilege

## Monitoring and Alerting

1. **Application Insights** - Monitor application performance
2. **Azure Monitor** - Set up alerts for:
   - CPU usage > 80%
   - Memory usage > 80%
   - HTTP 5xx errors
   - Database connection failures
3. **Log Analytics** - Centralize logging
4. **Azure Advisor** - Review recommendations regularly

## Backup Strategy

- **Azure SQL**: Enable automatic backups (7 days retention)
- **Azure Storage**: Enable soft delete and versioning
- **App Service**: Use deployment slots for safe deployments
- **Key Vault**: Backup critical secrets periodically
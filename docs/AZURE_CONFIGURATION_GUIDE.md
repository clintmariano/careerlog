# Azure Configuration Guide for CareerLog

This document captures the Azure configuration for a Spring Boot (backend) + React (frontend) application with Azure AD authentication, PostgreSQL database, and GitHub Actions CI/CD.

---

## Table of Contents

1. [Resource Group Overview](#1-resource-group-overview)
2. [App Services (Frontend & Backend)](#2-app-services-frontend--backend)
3. [Azure Database for PostgreSQL](#3-azure-database-for-postgresql)
4. [Azure Entra ID (Authentication)](#4-azure-entra-id-authentication)
5. [Storage Account](#5-storage-account)
6. [Application Insights (Monitoring)](#6-application-insights-monitoring)
7. [GitHub Actions CI/CD](#7-github-actions-cicd)
8. [Additional Features to Explore](#8-additional-features-to-explore)

---

## 1. Resource Group Overview

**Purpose**: Logical container for all related Azure resources

### Screenshots to Capture:
- [ ] Resource Group overview page (showing all resources) ✅ Already captured
- [ ] Resource Group Tags (if configured)
- [ ] Resource Group Activity Log (useful for auditing)
- [ ] Resource Group Cost Analysis

### Key Information to Document:
| Setting | Value |
|---------|-------|
| Resource Group Name | `rg-careerlog-dev` |
| Subscription | (Your subscription name) |
| Region | Canada East / Canada Central |

---

## 2. App Services (Frontend & Backend)

You have two App Services:
- `careerlog-backend-clint` - Spring Boot API (Canada East)
- `careerlog-frontend-app` - React SPA (Canada Central)

### 2.1 Backend App Service (`careerlog-backend-clint`)

#### Screenshots to Capture:

**Overview & Basics:**
- [ ] Overview page (URL, status, App Service Plan)
- [ ] Properties (Resource ID, outbound IPs)

**Configuration:**
- [ ] Configuration > Application Settings (environment variables)
  - `FRONTEND_URL`
  - `SPRING_PROFILES_ACTIVE`
  - `AZURE_DATABASE_URL`
  - `AZURE_DATABASE_USERNAME`
  - `AZURE_DATABASE_PASSWORD`
  - `AZURE_AD_TENANT_ID`
  - `AZURE_AD_CLIENT_ID`
- [ ] Configuration > General Settings (Java version, platform)
- [ ] Configuration > Connection Strings (if used)

**Deployment:**
- [ ] Deployment Center > Settings (GitHub Actions config)
- [ ] Deployment Center > Logs (deployment history)
- [ ] Deployment Slots (if configured)

**Networking:**
- [ ] Networking > Inbound/Outbound traffic rules
- [ ] CORS settings (Settings > API > CORS)

**Security:**
- [ ] TLS/SSL settings
- [ ] Authentication settings (if using built-in auth)

**Monitoring:**
- [ ] Log Stream (live logs)
- [ ] Application Insights connection
- [ ] Metrics (CPU, Memory, HTTP requests)

**Scaling:**
- [ ] Scale Up (App Service Plan tier)
- [ ] Scale Out (instance count, auto-scaling rules)

#### Key Configuration Values:
```properties
# Application Settings (Environment Variables)
FRONTEND_URL=https://careerlog-frontend-app.azurewebsites.net
SPRING_PROFILES_ACTIVE=azure
AZURE_AD_TENANT_ID=f6455f6e-2d5a-4bbc-9970-244a8ddcd72e
AZURE_AD_CLIENT_ID=330452df-580a-4f7c-aa27-f1b4ea73717f
AZURE_DATABASE_URL=jdbc:postgresql://careerlog-db.postgres.database.azure.com:5432/careerlog?sslmode=require
AZURE_DATABASE_USERNAME=(your username)
AZURE_DATABASE_PASSWORD=(stored securely)
```

---

### 2.2 Frontend App Service (`careerlog-frontend-app`)

#### Screenshots to Capture:

**Overview & Basics:**
- [ ] Overview page
- [ ] Default domain and custom domain (if configured)

**Configuration:**
- [ ] Configuration > Application Settings
- [ ] Configuration > General Settings (Node version, startup command)

**Deployment:**
- [ ] Deployment Center settings

**Static Content Config (for SPA routing):**
- [ ] Check if `staticwebapp.config.json` or web.config is needed
- [ ] Or verify nginx.conf is properly deployed (from Docker)

#### Key Information:
| Setting | Value |
|---------|-------|
| URL | `https://careerlog-frontend-app.azurewebsites.net` |
| Runtime | Node 18 / Static files |
| App Service Plan | `ASP-rgcareerlogdev-be15` |

---

### 2.3 App Service Plans

#### Screenshots to Capture:
- [ ] `asp-careerlog-dev` overview (pricing tier, instance count)
- [ ] `ASP-rgcareerlogdev-be15` overview
- [ ] Scale Up options showing available tiers (F1, B1, S1, P1v2, etc.)

#### Key Information:
| Plan | Tier | Region | Apps |
|------|------|--------|------|
| asp-careerlog-dev | (F1/B1/S1?) | Canada East | Backend |
| ASP-rgcareerlogdev-be15 | (F1/B1/S1?) | Canada Central | Frontend |

---

## 3. Azure Database for PostgreSQL

**Resource**: `careerlog-db` (Flexible Server)

### Screenshots to Capture:

**Overview:**
- [ ] Overview page (server name, version, compute tier)
- [ ] Connection strings

**Settings:**
- [ ] Compute + Storage (vCores, storage size, backup retention)
- [ ] Server Parameters (important PostgreSQL settings)
- [ ] Networking (firewall rules, public/private access)
- [ ] High Availability settings

**Security:**
- [ ] Authentication (PostgreSQL auth vs Azure AD auth)
- [ ] SSL enforcement settings
- [ ] Firewall rules (allowed IPs)

**Monitoring:**
- [ ] Metrics (connections, CPU, storage)
- [ ] Query Performance Insight (if enabled)
- [ ] Alerts

**Backup:**
- [ ] Backup settings (retention period, geo-redundancy)

#### Key Configuration:
```properties
# Connection Details
Server name: careerlog-db.postgres.database.azure.com
Port: 5432
Database: careerlog
SSL Mode: require
PostgreSQL Version: (14/15/16?)

# Compute Tier
Tier: (Burstable B1ms / General Purpose D2s_v3?)
vCores: (1/2?)
Storage: (32GB/64GB?)
```

---

## 4. Azure Entra ID (Authentication)

This is critical for your JWT-based authentication flow.

### 4.1 App Registrations

You need TWO app registrations:
1. **Backend API** - Resource server that validates tokens
2. **Frontend SPA** - Client that requests tokens

#### Screenshots to Capture:

**Navigate to: Azure Portal > Microsoft Entra ID > App registrations**

##### Backend API Registration:
- [ ] Overview (Application ID, Directory ID)
- [ ] Authentication > Platform configurations
- [ ] Expose an API
  - [ ] Application ID URI (`api://330452df-580a-4f7c-aa27-f1b4ea73717f`)
  - [ ] Scopes defined (`access_as_user`)
- [ ] App Roles (if defined)
- [ ] API Permissions
- [ ] Certificates & Secrets (if using client credentials)
- [ ] Token Configuration (optional claims)
- [ ] Manifest (JSON configuration)

##### Frontend SPA Registration:
- [ ] Overview (Application ID - `e34d9bc6-cc97-4222-983c-9bf51d8ce6f6`)
- [ ] Authentication
  - [ ] Redirect URIs (localhost:5173, production URL)
  - [ ] Implicit grant settings (ID tokens, Access tokens)
  - [ ] Supported account types (single tenant/multi-tenant)
- [ ] API Permissions
  - [ ] Microsoft Graph > User.Read
  - [ ] Your API > access_as_user
- [ ] Grant admin consent status

#### Key Configuration Values:
```typescript
// Frontend MSAL Config
VITE_AZURE_CLIENT_ID=e34d9bc6-cc97-4222-983c-9bf51d8ce6f6  // Frontend app
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/f6455f6e-2d5a-4bbc-9970-244a8ddcd72e
VITE_AZURE_REDIRECT_URI=https://careerlog-frontend-app.azurewebsites.net
VITE_API_SCOPE=api://330452df-580a-4f7c-aa27-f1b4ea73717f/access_as_user

// Backend JWT Validation
AZURE_AD_CLIENT_ID=330452df-580a-4f7c-aa27-f1b4ea73717f  // Backend app
AZURE_AD_TENANT_ID=f6455f6e-2d5a-4bbc-9970-244a8ddcd72e
```

### 4.2 Enterprise Applications

- [ ] Enterprise Applications list (shows apps in your tenant)
- [ ] Users and Groups assigned to each app (access control)

### 4.3 Authentication Flow Diagram

```
┌─────────────┐     1. Login Request      ┌──────────────────┐
│   React     │ ───────────────────────>  │  Azure Entra ID  │
│   Frontend  │                           │  (login.microsoft│
│   (SPA)     │ <─────────────────────── │   online.com)    │
└─────────────┘     2. ID + Access Token  └──────────────────┘
       │
       │ 3. API Request with Bearer Token
       ▼
┌─────────────┐     4. Validate JWT       ┌──────────────────┐
│ Spring Boot │ ───────────────────────>  │  Azure Entra ID  │
│   Backend   │                           │  (JWKS endpoint) │
│   (API)     │ <─────────────────────── │                  │
└─────────────┘     5. Token Valid        └──────────────────┘
```

---

## 5. Storage Account

**Resource**: `careerlogdevsa`

### Screenshots to Capture:

- [ ] Overview (account type, replication, performance tier)
- [ ] Access Keys (for connection strings)
- [ ] Containers (blob containers created)
- [ ] Networking (public/private access)
- [ ] Shared Access Signatures (SAS) settings
- [ ] Lifecycle Management (for auto-cleanup)
- [ ] Data Protection (soft delete, versioning)

#### Key Configuration:
```properties
Account Name: careerlogdevsa
Account Type: (StorageV2?)
Replication: (LRS/GRS?)
Blob Endpoint: https://careerlogdevsa.blob.core.windows.net

# Containers
- (attachments?) - for resume/document uploads
```

---

## 6. Application Insights (Monitoring)

**Resource**: `careerlog-frontend-app` (Application Insights)

### Screenshots to Capture:

**Overview:**
- [ ] Overview dashboard (requests, failures, availability)
- [ ] Application Map (shows dependencies)
- [ ] Connection string / Instrumentation Key

**Investigate:**
- [ ] Failures (error analysis)
- [ ] Performance (slow requests)
- [ ] Live Metrics (real-time monitoring)

**Monitoring:**
- [ ] Alerts (configured alert rules)
- [ ] Metrics explorer
- [ ] Logs (KQL queries)

**Usage:**
- [ ] Users (user analytics)
- [ ] Sessions
- [ ] Events

**Configure:**
- [ ] Properties (Instrumentation Key, Connection String)
- [ ] Usage and estimated costs

#### Key Integration Points:
```properties
# Backend (Spring Boot)
# Add Application Insights SDK for detailed tracing

# Frontend (React)
# Add @microsoft/applicationinsights-web for client-side tracking
```

---

## 7. GitHub Actions CI/CD

### Screenshots to Capture (from GitHub):

**Repository Settings:**
- [ ] Settings > Secrets and variables > Actions
  - List all secrets configured:
    - `AZURE_WEBAPP_PUBLISH_PROFILE` (backend)
    - `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND`
    - `API_BASE_URL`
    - `AZURE_CLIENT_ID`
    - `AZURE_AUTHORITY`
    - `AZURE_REDIRECT_URI`
    - `API_SCOPE`
    - `AZURE_POST_LOGOUT_REDIRECT_URI`

**Workflow Files:**
- [ ] `.github/workflows/backend-ci.yml`
- [ ] `.github/workflows/frontend-ci.yml`

**Deployment History:**
- [ ] Actions tab > successful/failed runs
- [ ] Deployment logs

### Workflow Architecture:
```
┌─────────────────┐     Push to main     ┌──────────────────┐
│  GitHub Repo    │ ─────────────────>   │  GitHub Actions  │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
                    ▼                             ▼                             ▼
           ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
           │ Test & Build  │             │ Test & Build  │             │   Deploy      │
           │   Backend     │             │   Frontend    │             │   to Azure    │
           └───────────────┘             └───────────────┘             └───────────────┘
```

---

## 8. Additional Features to Explore

These are commonly used features in production Spring Boot + React applications that you might want to add:

### 8.1 Azure Key Vault (Recommended)
**Purpose**: Securely store secrets, keys, and certificates

**Why you need it:**
- Store database passwords, API keys securely
- Reference secrets in App Service without exposing values
- Automatic secret rotation

**Screenshots to capture when configured:**
- [ ] Key Vault overview
- [ ] Secrets list
- [ ] Access Policies (which apps can read secrets)
- [ ] Integration with App Service (Key Vault References)

### 8.2 Azure Redis Cache
**Purpose**: In-memory caching for improved performance

**Use cases:**
- Session storage
- API response caching
- Rate limiting

**Screenshots to capture when configured:**
- [ ] Redis Cache overview
- [ ] Connection strings
- [ ] Metrics (cache hits/misses)

### 8.3 Azure CDN or Front Door
**Purpose**: Global content delivery and edge caching

**Use cases:**
- Serve static frontend assets globally
- DDoS protection
- Custom domain with SSL

**Screenshots to capture when configured:**
- [ ] CDN Profile and Endpoint
- [ ] Caching rules
- [ ] Custom domain configuration

### 8.4 Virtual Network (VNet) Integration
**Purpose**: Secure network isolation

**Use cases:**
- Private connectivity between App Service and Database
- Prevent public internet access to database

**Screenshots to capture when configured:**
- [ ] VNet overview
- [ ] Subnets
- [ ] Private Endpoints for PostgreSQL
- [ ] App Service VNet Integration

### 8.5 Azure Container Registry (ACR)
**Purpose**: Store Docker images privately

**Use cases:**
- If you switch to containerized deployments
- Store backend/frontend Docker images

**Screenshots to capture when configured:**
- [ ] Registry overview
- [ ] Repositories
- [ ] Webhooks for CI/CD

### 8.6 Azure Log Analytics Workspace
**Purpose**: Centralized logging and querying

**Use cases:**
- Query logs across all resources
- Create dashboards
- Long-term log retention

**Screenshots to capture when configured:**
- [ ] Workspace overview
- [ ] Sample KQL queries
- [ ] Diagnostic settings on resources

### 8.7 Azure Backup
**Purpose**: Automated backup for databases and app data

**Screenshots to capture when configured:**
- [ ] Backup vault
- [ ] Backup policies
- [ ] Recovery points

### 8.8 Cost Management
**Purpose**: Track and optimize Azure spending

**Screenshots to capture:**
- [ ] Cost Analysis > By Resource
- [ ] Cost Analysis > By Service
- [ ] Budgets (set spending alerts)
- [ ] Advisor recommendations

---

## 9. Quick Reference: Common Azure CLI Commands

```bash
# Login to Azure
az login

# List resources in resource group
az resource list --resource-group rg-careerlog-dev --output table

# View App Service logs
az webapp log tail --name careerlog-backend-clint --resource-group rg-careerlog-dev

# Restart App Service
az webapp restart --name careerlog-backend-clint --resource-group rg-careerlog-dev

# Set App Service configuration
az webapp config appsettings set --name careerlog-backend-clint \
  --resource-group rg-careerlog-dev \
  --settings FRONTEND_URL=https://careerlog-frontend-app.azurewebsites.net

# View PostgreSQL server info
az postgres flexible-server show --name careerlog-db --resource-group rg-careerlog-dev

# Create database backup (point-in-time restore capability)
# Flexible server has automatic backups, check retention settings
```

---

## 10. Security Checklist

Before going to production, verify:

- [ ] All secrets stored in Key Vault (not App Settings)
- [ ] Database not publicly accessible (use Private Endpoint)
- [ ] HTTPS enforced on all App Services
- [ ] Minimum TLS 1.2 required
- [ ] CORS properly configured (specific origins, not *)
- [ ] Azure AD app registrations have minimal permissions
- [ ] Resource locks on critical resources (prevent accidental deletion)
- [ ] Backup configured and tested
- [ ] Alerts configured for failures/high resource usage
- [ ] No sensitive data in application logs

---

## 11. Estimated Monthly Costs (Free Tier / Dev)

| Resource | Tier | Estimated Cost |
|----------|------|----------------|
| App Service (Backend) | F1 Free | $0 |
| App Service (Frontend) | F1 Free | $0 |
| PostgreSQL Flexible | Burstable B1ms | ~$12-15/month |
| Storage Account | LRS | ~$1-2/month |
| Application Insights | Free tier | $0 (up to 5GB/month) |
| **Total** | | **~$15-20/month** |

*Note: Costs increase significantly with production tiers (S1, P1v2, etc.)*

---

## Document Version

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-06 | Initial documentation |


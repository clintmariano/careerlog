# CareerLog - Troubleshooting Guide

## 🐛 Common Issues and Solutions

### **Database Connection Issues**

#### ❌ Error: `Connection to localhost:5432 refused`

**Cause**: PostgreSQL is not running or not accessible

**Solutions**:
1. **Use Docker (Recommended)**:
   ```bash
   # Start all services
   docker-compose up --build

   # Check if PostgreSQL is running
   docker-compose ps postgres
   ```

2. **Install PostgreSQL Locally**:
   ```bash
   # Windows
   choco install postgresql

   # Start service
   net start postgresql-x64-15

   # Create database
   createdb careerlog
   ```

3. **Check Docker Desktop**:
   - Ensure Docker Desktop is running
   - Restart Docker Desktop
   - Check available ports: `netstat -an | findstr 5432`

#### ❌ Error: `FATAL: database "careerlog" does not exist`

**Solution**:
```sql
-- Connect to PostgreSQL as postgres user
psql -U postgres

-- Create database
CREATE DATABASE careerlog;
CREATE USER careerlog_user WITH PASSWORD 'careerlog_pass';
GRANT ALL PRIVILEGES ON DATABASE careerlog TO careerlog_user;
```

### **Frontend Issues**

#### ❌ Error: `VITE_AZURE_CLIENT_ID is not defined`

**Cause**: Missing environment variables

**Solution**:
```bash
# Copy example environment file
cp frontend/.env.example frontend/.env

# Edit with your Azure AD app registration details
# VITE_AZURE_CLIENT_ID=your-client-id
# VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
# VITE_API_BASE_URL=http://localhost:8080/api
```

#### ❌ Error: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Cause**: Frontend trying to access different backend URL

**Solution**:
```bash
# In frontend/.env, ensure correct API URL
VITE_API_BASE_URL=http://localhost:8080/api
```

### **Authentication Issues**

#### ❌ Error: `AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application`

**Cause**: Azure AD app registration has wrong redirect URI

**Solution**:
1. Go to Azure Portal → Azure AD → App Registrations
2. Find your "CareerLog Frontend" app
3. Under "Authentication", add:
   - `http://localhost:5173`
   - `https://your-production-domain.com`
4. Click "Save" and wait for replication

#### ❌ Error: `AADSTS65001: The user or administrator has not consented to use the application`

**Cause**: Application permissions not granted

**Solution**:
1. Have user sign in to application once to consent
2. Or pre-consent via Azure Portal → Enterprise Applications → your app → Permissions
3. Click "Grant admin consent for [tenant]"

### **Application Startup Issues**

#### ❌ Backend starts but shows "HikariPool-1 - Exception during pool initialization"

**Cause**: Database connection failing

**Debug Steps**:
1. **Check database container**:
   ```bash
   docker-compose logs postgres
   ```

2. **Check network connectivity**:
   ```bash
   # Test connection from backend container
   docker-compose exec backend ping postgres
   ```

3. **Check environment variables**:
   ```bash
   docker-compose exec backend env | grep DB_
   ```

#### ❌ Frontend shows "Application not found"

**Cause**: API not accessible or wrong URL

**Debug Steps**:
1. **Test API directly**:
   ```bash
   curl http://localhost:8080/api/actuator/health
   ```

2. **Check API documentation**:
   - Visit: http://localhost:8080/swagger-ui.html
   - Test endpoints directly

3. **Verify CORS configuration**:
   ```bash
   curl -H "Origin: http://localhost:5173" http://localhost:8080/api/applications
   ```

### **Development Workflow Issues**

#### ❌ Changes not reflected in running application

**Cause**: Docker needs rebuild or restart

**Solution**:
```bash
# Rebuild specific service
docker-compose up --build backend

# Or restart all services
docker-compose restart

# View logs to debug
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### ❌ Port conflicts

**Cause**: Another application using ports 5432, 8080, or 5173

**Solution**:
```bash
# Check what's using ports
netstat -an | findstr :5432
netstat -an | findstr :8080
netstat -an | findstr :5173

# Change ports in docker-compose.yml if needed
ports:
  - "5433:5432"  # PostgreSQL on 5433 instead
  - "8081:8080"   # Backend on 8081 instead
  - "5174:5173"   # Frontend on 5174 instead
```

## 🔧 Development Tips

### **Using Docker Compose**

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build backend

# Execute commands in container
docker-compose exec backend bash
docker-compose exec postgres psql -U careerlog_user -d careerlog
```

### **Local Development without Docker**

#### **Backend**:
```bash
cd backend
# Ensure PostgreSQL is running locally
mvn spring-boot:run
```

#### **Frontend**:
```bash
cd frontend
npm run dev
```

### **Database Access**

#### **Via Docker**:
```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U careerlog_user -d careerlog

# View tables
\dt

# View data
SELECT * FROM applications;
SELECT * FROM activities;
SELECT * FROM attachments;
```

#### **Via pgAdmin**:
- URL: http://localhost:5050 (if running pgAdmin container)
- Server: `postgres` (service name in docker-compose)
- Username: `careerlog_user`
- Password: `careerlog_pass`
- Database: `careerlog`

## 📋 Performance Issues

### **Slow Database Queries**

#### **Check logs**:
```bash
docker-compose logs backend | grep "Hibernate"
```

#### **Add indexes**:
```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_activities_application_id ON activities(application_id);
CREATE INDEX IF NOT EXISTS idx_attachments_application_id ON attachments(application_id);
```

### **Memory Issues**

#### **Increase Java heap size**:
```bash
# In docker-compose.yml, add environment variable:
environment:
  - JAVA_OPTS=-Xmx512m -Xms256m
```

## 🚨 Emergency Recovery

### **Reset Everything**:
```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker system prune -a

# Start fresh
docker-compose up --build
```

### **Database Reset**:
```bash
# Connect to database
docker-compose exec postgres psql -U careerlog_user -d careerlog

# Drop and recreate everything
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Or use backup
-- docker-compose exec postgres pg_restore -U careerlog_user -d careerlog /path/to/backup.sql
```

## 📞 Getting Help

### **Where to check first**:
1. **Application logs**: `docker-compose logs -f`
2. **API documentation**: http://localhost:8080/swagger-ui.html
3. **Health endpoints**:
   - Backend: http://localhost:8080/api/actuator/health
   - Frontend: http://localhost:5173/health
4. **README.md**: General setup instructions
5. **Azure setup**: `infra/azure-setup-notes.md`

### **Useful Commands**:
```bash
# Quick status check
docker-compose ps

# Full restart
docker-compose down && docker-compose up --build

# Debug mode (more logs)
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up --build

# Check resource usage
docker stats
```

### **When all else fails**:
1. **Restart Docker Desktop**
2. **Clear browser cache and cookies**
3. **Check for Windows防火墙/antivirus blocking**
4. **Try different ports** by editing docker-compose.yml
5. **Create fresh environment**:
   ```bash
   # Move to new directory and start over
   cd ..
   git clone https://github.com/your-username/careerlog.git careerlog-fresh
   cd careerlog-fresh
   cp ../careerlog/.env* ./
   docker-compose up --build
   ```
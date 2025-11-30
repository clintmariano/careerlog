#!/bin/bash

# CareerLog Development Startup Script
echo "🚀 Starting CareerLog Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo ""
    echo "🐳 Docker Installation Help:"
    echo "   Windows: Download Docker Desktop from https://docker.com/products/docker-desktop/"
    echo "   Mac: Download Docker Desktop from https://docker.com/products/docker-desktop/"
    echo "   Linux: Install via package manager (apt, yum, etc.)"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose."
    echo ""
    echo "📦 Installation Help:"
    echo "   pip install docker-compose"
    echo "   Or download from: https://github.com/docker/compose/releases"
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Backend .env created with PostgreSQL credentials."
    echo "   Default: DB_HOST=postgres, DB_USER=careerlog_user, DB_PASSWORD=careerlog_pass"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo "✅ Frontend .env created with Azure AD placeholder values."
    echo "   You'll need to update VITE_AZURE_CLIENT_ID and related values"
fi

# Stop any existing containers to avoid conflicts
echo "🔄 Stopping any existing CareerLog containers..."
docker-compose down 2>/dev/null

# Start services with Docker Compose
echo "🐳 Building and starting services with Docker Compose..."
echo "   This will build and start PostgreSQL, Backend, and Frontend..."
docker-compose up --build

# Wait a moment for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ CareerLog started successfully!"
    echo ""
    echo "📍 Access your application:"
    echo "   🎨 Frontend: http://localhost:5173"
    echo "   🔧 Backend API: http://localhost:8080/api"
    echo "   ❤️  Backend Health: http://localhost:8080/api/actuator/health"
    echo "   📚 API Documentation: http://localhost:8080/swagger-ui.html"
    echo ""
    echo "🔧 Development commands:"
    echo "   📋 View logs: docker-compose logs -f"
    echo "   🛑 Stop services: docker-compose down"
    echo "   🔄 Restart services: docker-compose restart"
    echo "   🔍 Check PostgreSQL: docker-compose exec postgres psql -U careerlog_user -d careerlog"
    echo ""
    echo "📚 Next steps:"
    echo "   1. 🎯 Set up Azure AD app registrations (see README.md for detailed steps)"
    echo "   2. ✏️  Update frontend/.env with your Azure AD credentials"
    echo "   3. 🧪 Test the application by visiting http://localhost:5173"
    echo ""
    echo "💡 Pro tips:"
    echo "   • Run 'docker-compose logs -f backend' to see backend startup logs"
    echo "   • Run 'docker-compose logs -f frontend' to see frontend logs"
    echo "   • Access PostgreSQL directly: docker-compose exec postgres psql -U careerlog_user -d careerlog"
    echo "   • If you change .env files, restart with: docker-compose up --build"
else
    echo ""
    echo "❌ Some services may not have started properly."
    echo ""
    echo "🐛 Debug commands:"
    echo "   📋 View all logs: docker-compose logs"
    echo "   🔍 Check container status: docker-compose ps"
    echo "   🔄 Restart everything: docker-compose down && docker-compose up --build"
fi
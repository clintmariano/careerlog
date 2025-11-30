#!/bin/bash

echo "🔍 Checking CareerLog Database Configuration..."

# Check Docker environment
echo "Docker Environment Variables:"
docker-compose exec postgres env | grep POSTGRES

# Check what Spring Boot will see
echo ""
echo "Spring Boot Configuration (based on .env):"
if [ -f backend/.env ]; then
    echo "DB_USERNAME=$(grep DB_USERNAME backend/.env | cut -d= -f2)"
    echo "DB_PASSWORD=$(grep DB_PASSWORD backend/.env | cut -d= -f2)"
    echo "DB_NAME=$(grep DB_NAME backend/.env | cut -d= -f2)"
else
    echo "❌ backend/.env not found"
fi

echo ""
echo "🐳 Testing Database Connection..."
if [ -f backend/.env ]; then
    # Use variables from .env for the test
    source backend/.env

    # Test connection using docker exec
    echo "Testing with: DB_USERNAME=$DB_USERNAME, DB_NAME=$DB_NAME"

    # Use psql to test the connection
    docker-compose exec postgres psql -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1 as test_connection;" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "✅ Database connection successful!"
        echo ""
        echo "🎉 CareerLog should start successfully now!"
        echo ""
        echo "💡 Quick start: ./start-dev.sh"
    else
        echo "❌ Database connection failed!"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "   • Check if PostgreSQL container is running: docker-compose ps"
        echo "   • Check credentials in backend/.env"
        echo "   • Verify database exists: docker-compose exec postgres psql -U $DB_USERNAME -d $DB_NAME -c '\\l'"
    else
        echo "❌ backend/.env file not found"
        echo "📝 Please create it from: cp backend/.env.example backend/.env"
fi
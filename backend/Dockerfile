# Build stage
FROM maven:3.9.4-eclipse-temurin AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:21-jdk-slim
WORKDIR /app

# Create non-root user for security
RUN groupadd -r careerlog && useradd -r -g careerlog careerlog

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R careerlog:careerlog /app

# Switch to non-root user
USER careerlog

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
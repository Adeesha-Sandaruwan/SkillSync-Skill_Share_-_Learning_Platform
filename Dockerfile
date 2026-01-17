# 1. Build Stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the JAR, skipping tests to save time/errors during build
RUN mvn clean package -DskipTests

# 2. Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# --- CRITICAL: MEMORY OPTIMIZATION FOR FREE TIER (512MB RAM) ---
ENV JAVA_OPTS="-Xms300m -Xmx350m -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
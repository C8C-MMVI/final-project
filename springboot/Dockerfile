# ── Build stage ──
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

# Explicitly verify the properties file is there
RUN cat src/main/resources/application.properties

RUN mvn clean package -DskipTests

# Verify it made it into the JAR
RUN jar tf target/*.jar | grep application

# ── Run stage ──
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
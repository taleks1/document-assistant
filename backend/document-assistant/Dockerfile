# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p uploads

COPY --from=builder /app/target/document-assistant-0.0.1-SNAPSHOT.jar app.jar

ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata
ENV PDF_FONT_REGULAR_PATH=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
ENV PDF_FONT_BOLD_PATH=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

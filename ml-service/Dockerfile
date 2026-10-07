FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install curl and ca-certificates for downloading model from AWS S3
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create models directory
RUN mkdir -p models

COPY . .

# Build argument for S3 model URL
ARG MODEL_S3_URL=""

# Download model from S3 if not already present in context
RUN if [ ! -f models/model1.keras ]; then \
      if [ -n "$MODEL_S3_URL" ]; then \
        echo "Downloading model1.keras from S3..." && \
        curl -SL "$MODEL_S3_URL" -o models/model1.keras || echo "Warning: S3 model download encountered an issue (HTTP response code). Ensure S3 object is public or URL is valid."; \
      else \
        echo "Notice: MODEL_S3_URL not provided, skipping build-time download."; \
      fi; \
    else \
      echo "model1.keras already present in build context."; \
    fi

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

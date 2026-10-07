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

# Build argument for S3 model URL (passed from GitHub Actions secrets / build-args)
ARG MODEL_S3_URL=""

# Download model from S3 during image build if URL is provided
RUN if [ -n "$MODEL_S3_URL" ]; then \
      echo "Downloading model1.keras from S3..." && \
      curl -fSL "$MODEL_S3_URL" -o models/model1.keras && \
      echo "Model download complete."; \
    else \
      echo "Warning: MODEL_S3_URL not provided during build."; \
    fi

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

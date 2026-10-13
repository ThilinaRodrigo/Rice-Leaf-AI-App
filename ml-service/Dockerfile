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

# Build arguments for S3 model URLs
ARG MODEL_S3_URL=""
ARG VALIDATOR_MODEL_S3_URL=""

# Download disease model from S3 if specified and not present in build context
RUN if [ ! -f models/model1.keras ] && [ -n "$MODEL_S3_URL" ]; then \
      echo "Downloading model1.keras from S3..." && \
      curl -fSL --retry 3 "$MODEL_S3_URL" -o models/model1.keras; \
    fi

# Download validation model from S3 if specified and not present in build context
RUN if [ ! -f models/rice_leaf_validator.keras ] && [ -n "$VALIDATOR_MODEL_S3_URL" ]; then \
      echo "Downloading rice_leaf_validator.keras from S3..." && \
      curl -fSL --retry 3 "$VALIDATOR_MODEL_S3_URL" -o models/rice_leaf_validator.keras; \
    fi

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

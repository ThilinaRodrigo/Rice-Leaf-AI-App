# Rice Leaf AI — ML Inference Service 🌾🧠

FastAPI microservice for TensorFlow / Keras deep learning model inference in the Rice Leaf AI ecosystem.

---

## 🏗️ Architecture

The ML Service runs two separate TensorFlow/Keras models:

1. **Validation Model (`models/rice_leaf_validator.keras`)**:
   - MobileNetV2 architecture.
   - Input shape: `(224, 224, 3)` RGB.
   - Rescaling: Built into the model (expects raw `[0, 255]` float range).
   - Output: Sigmoid probability score representing class `1` (`rice_leaf`).
   - Threshold: `RICE_VALIDATOR_THRESHOLD` (default: `0.50`).

2. **Disease Classification Model (`models/model1.keras`)**:
   - VGG19 / MobileNet transfer learning model.
   - Input shape: `(224, 224, 3)` RGB.
   - Output: Softmax array across 5 disease/health categories.

---

## 🚀 Endpoints

### 1. `POST /validate`
Validates whether the uploaded image is a rice leaf.

**Response**:
```json
{
  "is_rice_leaf": true,
  "rice_leaf_probability": 0.97
}
```

### 2. `POST /predict`
Classifies the rice leaf disease.

**Response**:
```json
{
  "class_id": 1,
  "label": "brown_spot",
  "confidence": 0.9452
}
```

---

## 🛠️ Local Setup Instructions

### 1. Requirements
- Python 3.10 – 3.12
- Virtual environment (`venv`)

### 2. Environment Configuration (`.env`)

Create `.env`:
```env
PORT=8000
MODEL_PATH=models/model1.keras
VALIDATOR_MODEL_PATH=models/rice_leaf_validator.keras
RICE_VALIDATOR_THRESHOLD=0.50

# S3 Deployment Configuration (Optional)
MODEL_S3_URL=https://your-s3-bucket.s3.amazonaws.com/models/model1.keras
VALIDATOR_MODEL_S3_URL=https://your-s3-bucket.s3.amazonaws.com/models/rice_leaf_validator.keras
```

---

## ☁️ AWS S3 Model Deployment

If models are hosted in an S3 bucket instead of being committed directly:
1. Provide public or signed HTTPS URLs using `MODEL_S3_URL` and `VALIDATOR_MODEL_S3_URL`.
2. Or specify `s3://bucket-name/path/to/model.keras` and configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`.
3. On application startup or Docker build, the service automatically downloads missing models into `models/` directory.

---

## 🚀 Local Execution

```powershell
# Activate Virtual Environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Start Uvicorn Server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation available at `http://localhost:8000/docs`.

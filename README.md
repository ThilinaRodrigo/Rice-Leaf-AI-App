# Rice Leaf AI 🌾🤖

Rice Leaf AI is an end-to-end intelligent agricultural management, disease detection, and social marketplace ecosystem. The system features a **React Native (Expo) mobile client**, a **Vite + React System Admin Dashboard**, a high-performance **Go Modular Monolith REST API backend**, and a **Python (FastAPI + TensorFlow) AI machine learning inference service** with a **two-stage validation and disease classification pipeline**.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│       React Native (Expo App)        │       │    Sys Admin Web Dashboard (Vite)   │
│     (iOS, Android & Mobile Web)      │       │          (Management Client)         │
└──────────────────┬───────────────────┘       └──────────────────┬───────────────────┘
                   │                                              │
                   │ REST API / HTTP JSON                         │ REST API / HTTP JSON
                   └───────────────────────┬──────────────────────┘
                                           │
                                           ▼
                       ┌──────────────────────────────────────┐
                       │     Go Backend Service (Gin API)     │
                       │         [Modular Monolith]           │
                       │                                      │
                       │  ├── auth        ├── community       │
                       │  ├── scan        ├── shop            │
                       │  ├── disease     ├── chat            │
                       │  └── admin       └── shared          │
                       └───────────┬──────────────────┬───────┘
                                   │                  │
                PostgreSQL SQL /   │                  │ HTTP Proxy / Multipart
                Data Persistence   ▼                  ▼
                       ┌───────────────┐      ┌─────────────────────────┐
                       │  PostgreSQL   │      │   ML Service (FastAPI)  │
                       │   Database    │      │  ├── 1. Validation Model│
                       │               │      │  └── 2. Disease Model   │
                       └───────────────┘      └─────────────────────────┘
```

---

## 💡 Two-Stage Image Diagnosis Pipeline

1. **Stage 1 — Rice Leaf Validation (`rice_leaf_validator.keras`)**:
   - MobileNetV2 binary classification model.
   - Verifies whether the uploaded image is genuinely a **rice leaf** (`1`) or **not a rice leaf** (`0`).
   - If rejected (probability below configurable threshold, e.g., `0.50`), processing halts and returns **HTTP 422 Unprocessable Entity** with clear guidance (*"Please upload a clear image of a rice leaf."*).
2. **Stage 2 — Disease Diagnosis (`model1.keras`)**:
   - Executes only when validation succeeds.
   - Classifies the rice leaf into 5 disease/health categories and returns treatment recommendations.

---

## 📂 Repository Layout

```text
Rice-Leaf-AI-App/
├── rice-leaf-app/        # React Native / Expo cross-platform mobile & web client app
├── sysadmin-web/         # Vite + React + Tailwind System Administration Portal
├── backend-go/           # Go (Gin) Modular Monolith REST API backend & PostgreSQL persistence
│   ├── cmd/api/          # Application entry point
│   ├── internal/
│   │   ├── modules/      # Domain-isolated modules (auth, community, shop, scan, disease, chat, admin)
│   │   └── shared/       # Cross-cutting infrastructure (database, middleware, router)
│   └── pkg/              # Standard utility packages (hasher, storage, token, mlclient)
├── ml-service/           # FastAPI service with TensorFlow models (validator & disease classifier)
│   ├── models/
│   │   ├── model1.keras               # Rice disease classification model
│   │   └── rice_leaf_validator.keras  # Binary rice leaf validation model
│   └── app.py            # FastAPI inference server (/validate & /predict)
└── README.md             # Ecosystem documentation
```

---

## 🚀 Ecosystem Components Overview

### 1. 📱 Mobile Application (`rice-leaf-app`)
- **Tech Stack**: Expo SDK 54, TypeScript, Expo Router, NativeWind / React Native CSS.
- **Key Features**:
  - 📸 Camera & photo picker with automatic rice leaf validation feedback.
  - 💬 Interactive AI Agronomy Assistant chatbot for crop disease advice.
  - 🛒 Agricultural Marketplace (seeds, fertilizers, sprayers, tools, and verified shop ads).
  - 👥 Farmer Community Forum (ask questions, post field photos, vote, comment).
  - 📖 Multilingual Disease Knowledge Base with symptom guides and remedies.

### 2. ⚙️ Go Modular Monolith Backend (`backend-go`)
- **Tech Stack**: Go 1.22+, Gin Web Framework, PostgreSQL (`lib/pq`), JWT Authentication.
- **Key Features**:
  - Validates image file format & enforces maximum file size (`MAX_IMAGE_SIZE_MB`).
  - Calls internal ML validation service before executing disease diagnosis or saving scans.
  - Returns structured `HTTP 422` validation rejection responses for invalid photos.

### 3. 🧠 ML Inference Service (`ml-service`)
- **Tech Stack**: Python 3.10+, FastAPI, Uvicorn, TensorFlow 2.x / Keras.
- **Endpoints**:
  - `/validate`: Binary classification score (`is_rice_leaf`, `rice_leaf_probability`).
  - `/predict`: Multi-class disease classifier (`0: bacterial_leaf_blight`, `1: brown_spot`, `2: healthy`, `3: leaf_scald`, `4: narrow_brown_spot`).

---

## 📋 System Requirements & Prerequisites

- **Node.js**: v20 or later
- **Go**: v1.22 or later
- **Python**: 3.10 – 3.12
- **PostgreSQL**: Local PostgreSQL server or Docker container

---

## 🛠️ Local Testing & Development Guide (IPv4: `192.168.8.100`)

For testing on physical mobile devices (Android / iOS Expo Go) connected over the same local Wi-Fi network, configure your machine's IPv4 address (`192.168.8.100`).

### Step 1: Start Python ML Service

Open Terminal 1:
```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
*Service will start at `http://localhost:8000` (and `http://192.168.8.100:8000`).*

---

### Step 2: Start Go Backend Service

Open Terminal 2:
```powershell
cd backend-go

# Verify .env configuration:
# BASE_URL=http://192.168.8.100:8080
# ML_SERVICE_URL=http://localhost:8000
# RICE_VALIDATOR_THRESHOLD=0.50
# MAX_IMAGE_SIZE_MB=10

go run ./cmd/api
```
*Go REST API will start at `http://0.0.0.0:8080` (accessible at `http://192.168.8.100:8080`).*

---

### Step 3: Start Mobile App (`rice-leaf-app`)

Open Terminal 3:
```powershell
cd rice-leaf-app

# Update .env to use local Wi-Fi IP:
# EXPO_PUBLIC_API_BASE_URL=http://192.168.8.100:8080/api/v1
# EXPO_PUBLIC_SERVER_BASE_URL=http://192.168.8.100:8080

npx expo start --clear
```
- Press **`w`** for Web Browser testing.
- Scan the **QR Code** using **Expo Go** on your physical phone (connected to `192.168.8.x` Wi-Fi).

---

### Step 4: Start Sys Admin Web Portal (`sysadmin-web`)

Open Terminal 4:
```powershell
cd sysadmin-web
npm install
npm run dev
```
*Access dashboard at `http://localhost:5173`.*

---

## 📡 API Endpoints Matrix

| Domain Module | Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register new user (`farmer` / `shop_owner`) |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | User authentication & JWT issuance |
| **Auth** | `GET` | `/api/v1/auth/me` | Bearer Token | Get current user profile |
| **Scan** | `POST` | `/api/v1/scans/analyze` | Optional Token | Validate & analyze leaf image |
| **Scan** | `GET` | `/api/v1/scans/history` | Bearer Token | User scan diagnostic history |
| **Community** | `GET` | `/api/v1/posts` | Public | Browse community posts & questions |
| **Community** | `POST` | `/api/v1/posts` | Bearer Token | Create new community post |
| **Shop** | `GET` | `/api/v1/products` | Public | Browse marketplace products |
| **Shop** | `GET` | `/api/v1/marketplace/ads` | Public | View approved shop advertisements |
| **Chat** | `POST` | `/api/v1/chat/message` | Optional Token | Send message to AI Agronomist |
| **Disease** | `GET` | `/api/v1/diseases` | Public | List disease database & remedies |
| **Admin** | `GET` | `/api/v1/admin/stats` | Sys Admin | Platform telemetry & statistics |

---

## 📄 License

This repository is developed for AI & Smart Agriculture Research. All rights reserved.

# Rice Leaf AI 🌾🤖

Rice Leaf AI is an end-to-end intelligent agricultural management and disease detection system. The platform consists of a **React Native (Expo) frontend**, a high-performance **Go (Gin) REST API backend**, and a **Python (FastAPI + TensorFlow) AI machine learning inference service**.

---

## 🏗️ System Architecture

```text
                               ┌──────────────────────────────────┐
                               │     React Native (Expo App)      │
                               │   (iOS, Android & Web Client)    │
                               └────────────────┬─────────────────┘
                                                │
                                    HTTP / JSON │ REST API
                                                ▼
┌─────────────────────────┐    REST / Proxy     ┌──────────────────────────────────┐
│   ML Service (FastAPI)  │ ◄───────────────────┤      Go Backend Service (Gin)    │
│ (TensorFlow Inference)  │                     │   (Auth, Market, Scans & Chat)   │
└─────────────────────────┘                     └────────────────┬─────────────────┘
                                                                 │
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │    PostgreSQL    │
                                                        │     Database     │
                                                        └──────────────────┘
```

---

## 📂 Project Structure

```text
Rice-Leaf-AI-App/
├── rice-leaf-app/        # React Native / Expo cross-platform mobile & web app
├── backend-go/           # Go (Gin framework) REST API backend service & database layer
├── ml-service/           # FastAPI service with TensorFlow Keras model for disease detection
└── README.md             # Project documentation
```

---

## 🚀 Services Overview

### 1. 📱 Frontend (`rice-leaf-app`)
- Built with **Expo SDK 54**, **TypeScript**, **Expo Router** (file-based navigation), and **Lucide Icons**.
- **Features**:
  - Image capture & gallery picker for leaf disease analysis.
  - Interactive AI Agronomy Chatbot for treatment and prevention guidance.
  - Marketplace for agricultural supplies (seeds, fertilizers, sprayers, tools).
  - Disease knowledge base with diagnostic details and remedies.

### 2. ⚙️ Go Backend (`backend-go`)
- Built with **Golang (Gin framework)**, **GORM / PostgreSQL**, and **JWT Authentication**.
- **Features**:
  - User registration & JWT authentication handler.
  - Product catalog management for the agricultural marketplace.
  - Scan history and diagnostic log persistence.
  - Proxy integration to the Python ML Inference engine and AI chat service.

### 3. 🧠 ML Service (`ml-service`)
- Built with **Python 3.10-3.12**, **FastAPI**, **Uvicorn**, and **TensorFlow 2.x**.
- Classifies rice-leaf images into 5 categories:
  - `0`: Bacterial Leaf Blight
  - `1`: Brown Spot
  - `2`: Healthy
  - `3`: Leaf Scald
  - `4`: Narrow Brown Spot

---

## 📋 Prerequisites

Make sure the following dependencies are installed on your machine:
- **Node.js**: v20 or later
- **Go**: v1.22 or later
- **Python**: 3.10 – 3.12
- **PostgreSQL**: Local instance or Docker (`docker-compose`)

---

## 🛠️ Getting Started (Step-by-Step)

### Step 1: Start PostgreSQL & Go Backend

1. Navigate to the `backend-go` folder:
   ```bash
   cd backend-go
   ```

2. *(Optional)* Start PostgreSQL using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Configure environment variables (copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```

4. Run the Go backend server:
   ```bash
   go run ./cmd/api
   ```
   The backend starts at `http://localhost:8080`.

---

### Step 2: Start the Python ML Inference Service

1. Open a second terminal and navigate to `ml-service`:
   ```bash
   cd ml-service
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies and start Uvicorn:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 8001 --reload
   ```
   Interactive Swagger API docs will be available at: `http://127.0.0.1:8001/docs`.

---

### Step 3: Start the Expo Mobile Frontend

1. Open a third terminal and navigate to `rice-leaf-app`:
   ```bash
   cd rice-leaf-app
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Configure host IP in `rice-leaf-app/constant/api.ts`:
   - For **Web / Local Testing**: `http://localhost:8080/api/v1`
   - For **Physical Devices (Expo Go)**: Use your local Wi-Fi IPv4 address (e.g. `http://192.168.x.x:8080/api/v1`). Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

4. Start the Expo development server:
   ```bash
   npx expo start --clear
   ```
   - Press **`w`** to open in Web Browser.
   - Press **`a`** to launch in Android Emulator.
   - Scan the **QR Code** using Expo Go on your mobile phone.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Service |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user | Backend Go |
| `POST` | `/api/v1/auth/login` | Login user & get JWT token | Backend Go |
| `GET`  | `/api/v1/products` | Fetch marketplace products | Backend Go |
| `POST` | `/api/v1/scans/analyze` | Analyze rice leaf image for disease | Backend Go → ML Service |
| `POST` | `/api/v1/chat/message` | Send message to AI Agronomist | Backend Go |
| `GET`  | `/api/v1/diseases` | List disease remedies knowledge base | Backend Go |
| `POST` | `/predict` | Image classification endpoint | ML Service (FastAPI) |

---

## ❓ Troubleshooting

### 1. `Cannot find module '@/...'` in TypeScript
Ensure all `import` statements are placed at the **top level** of `.ts` / `.tsx` files (outside of function components or loop bodies). Expo uses path alias mapping defined in `tsconfig.json` (`@/* -> ./*`).

### 2. Physical Device (Expo Go) cannot reach Backend API
- Ensure your phone and development computer are connected to the **same Wi-Fi network**.
- Replace `localhost` or `127.0.0.1` in `rice-leaf-app/constant/api.ts` with your computer's local network IP address (e.g., `192.168.1.100`).
- Ensure Windows Firewall permits incoming traffic on ports `8080` and `8001`.

---

## 📄 License
This project is developed for AI & Smart Agriculture Research. All rights reserved.

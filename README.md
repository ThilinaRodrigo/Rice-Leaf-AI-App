# Rice Leaf AI 🌾🤖

Rice Leaf AI is an end-to-end intelligent agricultural management, disease detection, and social marketplace ecosystem. The system features a **React Native (Expo) mobile client**, a **Vite + React System Admin Dashboard**, a high-performance **Go Modular Monolith REST API backend**, and a **Python (FastAPI + TensorFlow) AI machine learning inference service**.

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
                       │   Database    │      │ (TensorFlow Inference)  │
                       └───────────────┘      └─────────────────────────┘
```

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
├── ml-service/           # FastAPI service with TensorFlow model for rice disease classification
└── README.md             # Ecosystem documentation
```

---

## 🚀 Ecosystem Components Overview

### 1. 📱 Mobile Application (`rice-leaf-app`)
- **Tech Stack**: Expo SDK 54, TypeScript, Expo Router (file-based navigation), NativeWind / React Native CSS.
- **Key Features**:
  - 📸 Camera & photo picker for instant rice leaf disease analysis.
  - 💬 Interactive AI Agronomy Assistant chatbot for crop disease advice.
  - 🛒 Agricultural Marketplace (seeds, fertilizers, sprayers, tools, and verified shop ads).
  - 👥 Farmer Community Forum (ask questions, post field photos, vote, comment).
  - 📖 Disease Knowledge Base with symptom guides and remedies (multilingual support).

### 2. ⚙️ Go Modular Monolith Backend (`backend-go`)
- **Tech Stack**: Go 1.22+, Gin Web Framework, PostgreSQL (`lib/pq`), JWT Authentication, Bcrypt.
- **Architecture**: **Modular Monolith** organized by domain boundaries:
  - `auth`: User registration, login, profile, role management (`farmer`, `shop_owner`, `sys_admin`).
  - `community`: Forum posts, image uploads, voting (likes/dislikes), comments.
  - `shop`: Marketplace products catalog and shop owner advertisement approval flow.
  - `scan`: Rice leaf disease image upload, ML service integration, diagnostic history.
  - `disease`: Disease database with treatment actions, environmental factors, and translations.
  - `chat`: AI chatbot history and contextual agronomy response builder.
  - `admin`: System stats, moderation, user management, and shop ad approvals.

### 3. 🖥️ System Admin Portal (`sysadmin-web`)
- **Tech Stack**: Vite, React, TypeScript, TailwindCSS, Lucide Icons.
- **Key Features**:
  - Real-time platform analytics (users breakdown, total scans, disease distribution).
  - User management (view farmers/shop owners, create sys admins, ban users).
  - Shop Advertisement approval workflow (approve/reject shop ads with reasons).
  - Disease knowledge base editor and scan history auditor.

### 4. 🧠 ML Disease Classifier (`ml-service`)
- **Tech Stack**: Python 3.10+, FastAPI, Uvicorn, TensorFlow 2.x Keras.
- **Classifies rice leaves into 5 classes**:
  - `0`: Bacterial Leaf Blight
  - `1`: Brown Spot
  - `2`: Healthy Leaf
  - `3`: Leaf Scald
  - `4`: Narrow Brown Spot

---

## 📋 System Requirements & Prerequisites

- **Node.js**: v20 or later
- **Go**: v1.22 or later
- **Python**: 3.10 – 3.12
- **PostgreSQL**: Local PostgreSQL server or Docker container

---

## 🛠️ Installation & Setup Guide

### Step 1: Initialize Database & Go Backend

1. Navigate to `backend-go`:
   ```bash
   cd backend-go
   ```

2. Configure environment variables (copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```

3. Build and run the Go Modular Monolith API server:
   ```bash
   go run ./cmd/api
   ```
   *The Go backend runs on `http://localhost:8080`.*

---

### Step 2: Start Python ML Inference Service

1. Open a new terminal and navigate to `ml-service`:
   ```bash
   cd ml-service
   ```

2. Setup virtual environment & dependencies:
   ```powershell
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Start FastAPI server:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8001 --reload
   ```
   *Interactive API docs available at `http://localhost:8001/docs`.*

---

### Step 3: Start Mobile App (`rice-leaf-app`)

1. Open a terminal and navigate to `rice-leaf-app`:
   ```bash
   cd rice-leaf-app
   ```

2. Install dependencies & start Expo:
   ```bash
   npm install
   npx expo start --clear
   ```
   *Press `w` for Web or scan the QR Code using Expo Go on your mobile phone.*

---

### Step 4: Start Sys Admin Web Portal (`sysadmin-web`)

1. Open a terminal and navigate to `sysadmin-web`:
   ```bash
   cd sysadmin-web
   ```

2. Install dependencies & start Vite dev server:
   ```bash
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
| **Scan** | `POST` | `/api/v1/scans/analyze` | Optional Token | Analyze leaf image & store result |
| **Scan** | `GET` | `/api/v1/scans/history` | Bearer Token | User scan diagnostic history |
| **Community** | `GET` | `/api/v1/posts` | Public | Browse community posts & questions |
| **Community** | `POST` | `/api/v1/posts` | Bearer Token | Create new community post |
| **Community** | `POST` | `/api/v1/posts/:id/vote` | Bearer Token | Like / Dislike post |
| **Shop** | `GET` | `/api/v1/products` | Public | Browse marketplace products |
| **Shop** | `GET` | `/api/v1/marketplace/ads` | Public | View approved shop advertisements |
| **Shop** | `POST` | `/api/v1/shop/ads` | Shop Owner | Post shop advertisement |
| **Chat** | `POST` | `/api/v1/chat/message` | Optional Token | Send message to AI Agronomist |
| **Disease** | `GET` | `/api/v1/diseases` | Public | List disease database & remedies |
| **Admin** | `GET` | `/api/v1/admin/stats` | Sys Admin | Platform telemetry & statistics |
| **Admin** | `PUT` | `/api/v1/admin/ads/:id/status`| Sys Admin | Approve/Reject shop owner ad |

---

## 📄 License

This repository is developed for AI & Smart Agriculture Research. All rights reserved.

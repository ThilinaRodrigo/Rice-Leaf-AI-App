# Rice Leaf AI — Go Backend Service 🌾⚙️

High-performance, domain-driven REST API backend built for the Rice Leaf AI ecosystem using **Go (Gin framework)** and **PostgreSQL**.

---

## 🏗️ Architecture: Modular Monolith

This backend follows the **Modular Monolith** pattern. Code is organized into self-contained domain feature modules inside `internal/modules/`, while cross-cutting infrastructure concerns reside in `internal/shared/`.

### Directory Structure

```text
backend-go/
├── cmd/
│   └── api/
│       └── main.go                         # Thin entry point & dependency wiring
├── config/
│   └── config.go                           # Environment configuration loader
├── uploads/                                # Static uploaded images (scans, ads, posts)
├── pkg/                                    # Universal utility packages
│   ├── hasher/                             # Password hashing (Bcrypt)
│   ├── mlclient/                           # FastAPI Python ML client (Validate & Predict)
│   ├── storage/                            # Disk storage & URL generator
│   └── token/                              # JWT generation & validation
└── internal/
    ├── shared/                             # Cross-cutting shared kernel
    │   ├── database/                       # PostgreSQL pool connection & schema migrations
    │   ├── middleware/                     # JWT authentication & admin authorization guards
    │   └── router/                         # Central Chi/Gin router aggregator
    └── modules/                            # Self-contained Domain Modules
        ├── admin/                          # System admin stats, moderation & approvals
        ├── auth/                           # Authentication, users, profiles & roles
        ├── chat/                           # AI Agronomist chatbot history & advice engine
        ├── community/                      # Farmer community forum, posts, votes & comments
        ├── disease/                        # Disease database, symptoms, actions & translations
        ├── scan/                           # Rice leaf validation, AI scans & user history
        └── shop/                           # Marketplace products & shop owner ads
```

---

## 📦 Scan Module Validation & Analysis Flow

1. **File Validation**:
   - Enforces maximum file size limit (`MAX_IMAGE_SIZE_MB`, default `10` MB).
   - Validates supported image formats (`.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.heic`).
2. **Rice Leaf Model Validation (`mlclient.ValidateImage`)**:
   - Sends image to internal Python ML service (`/validate`).
   - If `is_rice_leaf` is `false`, halts processing and returns **HTTP 422 Unprocessable Entity**:
     ```json
     {
       "success": false,
       "error": "NOT_RICE_LEAF",
       "message": "Please upload a clear image of a rice leaf.",
       "validation": {
         "is_rice_leaf": false,
         "rice_leaf_probability": 0.12
       }
     }
     ```
3. **Disease Classification (`mlclient.PredictImage`)**:
   - Executed only if validation passes. Saves scan record and returns full diagnosis.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Go 1.22+
- PostgreSQL database

### 2. Environment Setup (`.env`)

Copy `.env.example` to `.env`:

```env
PORT=8080
GIN_MODE=debug
DATABASE_URL=postgres://postgres:root@localhost:5432/riceleafdb?sslmode=disable
JWT_SECRET=super-secret-rice-leaf-key-2026

# Internal ML Inference Service
ML_SERVICE_URL=http://localhost:8000
RICE_VALIDATOR_THRESHOLD=0.50
MAX_IMAGE_SIZE_MB=10

# Local Wi-Fi Development Network configuration (IP: 192.168.8.100)
BASE_URL=http://192.168.8.100:8080
UPLOADS_DIR=./uploads

# Optional AI Agronomist Integration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Build & Run locally

Run with Go CLI:
```bash
go run ./cmd/api
```

Compile binary:
```bash
go build -o api.exe ./cmd/api
./api.exe
```

---

## 🗄️ Database Tables (Auto-Migrated)
- `users`: User profiles with roles (`farmer`, `shop_owner`, `sys_admin`).
- `diseases`: Classification lookup table with JSON factors & recommendations.
- `scans`: Diagnostic history logs with confidence score & image URLs.
- `products`: Agricultural inputs catalog (seeds, fertilizers, sprayers).
- `shop_ads`: Shop owner advertisements pending/approved/rejected by admin.
- `community_posts`: Forum posts by farmers & agronomists.
- `post_votes`: Post likes/dislikes tracking per user.
- `post_comments`: Discussion comments under community posts.
- `chat_messages`: AI Agronomist conversation history logs.

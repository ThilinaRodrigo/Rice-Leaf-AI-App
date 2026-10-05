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
│   └── config.go                       # Environment configuration loader
├── uploads/                                # Static uploaded images (scans, ads, posts)
├── pkg/                                    # Universal utility packages
│   ├── hasher/                             # Password hashing (Bcrypt)
│   ├── mlclient/                           # FastAPI Python ML client
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
        ├── scan/                           # Rice leaf AI scans, diagnosis & user history
        └── shop/                           # Marketplace products & shop owner ads
```

---

## 📦 Module Structure Standard

Inside each domain module under `internal/modules/<module_name>/`, files follow a uniform 5-part layout:

```text
internal/modules/<module_name>/
├── model.go        # Domain entity structs & enum constants
├── dto.go          # Data Transfer Objects (Request/Response JSON structs)
├── repository.go   # Data access layer (PostgreSQL SQL queries & fallbacks)
├── service.go      # Core domain business logic
└── handler.go      # HTTP router handlers & JSON bindings
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Go 1.22+
- PostgreSQL database

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your configuration:
```env
PORT=8080
GIN_MODE=debug
DATABASE_URL=postgres://postgres:postgres@localhost:5432/riceleaf?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key
ML_SERVICE_URL=http://localhost:8001
BASE_URL=http://localhost:8080
UPLOADS_DIR=./uploads
```

### 3. Build & Run
Run locally:
```bash
go run ./cmd/api
```

Build binary:
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

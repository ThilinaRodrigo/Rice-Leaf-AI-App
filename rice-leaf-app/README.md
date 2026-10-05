# Rice Leaf AI - Mobile & Web App 🌾📱

This is the cross-platform React Native mobile and web application for **Rice Leaf AI**, built with **Expo SDK 54**, **Expo Router**, **TypeScript**, and **Lucide Icons**.

---

## 🚀 Key Features

- **📷 Disease Scanner**: Capture or pick rice-leaf images to analyze for 5 common rice diseases.
- **💬 AI Agronomist Chat**: Get instant advice, treatment recommendations, application schedules, and prevention guidance.
- **🛒 Agri Marketplace**: Browse agricultural products including seeds, fertilizers, sprayers, and farming tools.
- **📚 Remedies Knowledge Base**: Learn about diseases, contributing environmental factors, and curative actions.

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

Edit `constant/api.ts` to point to your Go backend service:

```ts
// For web / local emulator:
export const API_BASE_URL = "http://localhost:8080/api/v1";

// For physical phone testing on same Wi-Fi:
export const API_BASE_URL = "http://192.168.x.x:8080/api/v1";
```

### 3. Run the Development Server

```bash
npx expo start --clear
```

- Press **`w`** for Web Browser
- Press **`a`** for Android Emulator
- Scan the **QR code** in Expo Go app (Android/iOS)

---

## 📂 Project Structure

```text
rice-leaf-app/
├── app/                  # Expo Router file-based pages
│   ├── (tabs)/          # Main tab screens (Scan/Home, Chat, Market, Result, Profile)
│   └── _layout.tsx      # Root app layout
├── components/           # Reusable UI components (Action, Factor, HelpModal, etc.)
├── constant/             # App constants, API URLs, disease metadata
├── hooks/                # Custom hooks (camera picker, image picker)
├── service/              # API Client (Backend communication & ML service calls)
├── tsconfig.json         # TypeScript configuration with @/* alias
└── package.json          # Project dependencies
```

---

## 🧪 Code Quality & Verification

Run TypeScript compilation check:

```bash
npx tsc --noEmit
```

# Rice Leaf AI - Mobile & Web App 🌾📱

This is the cross-platform React Native mobile and web application for **Rice Leaf AI**, built with **Expo SDK 54**, **Expo Router**, **TypeScript**, and **Lucide Icons**.

---

## 🚀 Key Features

- **📷 Smart Leaf Scanner & Validator**: Capture or select rice-leaf images with real-time model validation. Non-rice leaf photos are rejected automatically with clear user guidance (*"Please upload a clear image of a rice leaf."*).
- **💬 AI Agronomist Chat**: Get instant advice, treatment recommendations, application schedules, and prevention guidance.
- **🛒 Agri Marketplace**: Browse agricultural products including seeds, fertilizers, sprayers, and farming tools.
- **👥 Farmer Community Forum**: Share diagnostic photos, exchange field experiences, and vote on community solutions.
- **📚 Multilingual Remedies Knowledge Base**: Learn about diseases in English & Sinhala with environmental risk factors and curative steps.

---

## 🛠️ Local Setup & Physical Device Testing (`192.168.8.101`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Local Network Endpoint (`.env`)

For physical phone testing using Expo Go over your local Wi-Fi network (IPv4: `192.168.8.101`), update `.env`:

```env
# Local Wi-Fi Development Network
EXPO_PUBLIC_API_BASE_URL=http://192.168.8.101:8080/api/v1
EXPO_PUBLIC_SERVER_BASE_URL=http://192.168.8.101:8080

# Production Environment Example
# EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
# EXPO_PUBLIC_SERVER_BASE_URL=https://api.yourdomain.com
```

### 3. Run Development Server

```bash
npx expo start --clear
```

- Press **`w`** for Web Browser testing.
- Press **`a`** for Android Emulator.
- Scan the **QR Code** using **Expo Go** on your physical Android/iOS device connected to `192.168.8.x`.

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
├── service/              # API Client (Backend communication & validation error handling)
├── tsconfig.json         # TypeScript configuration with @/* alias
└── package.json          # Project dependencies
```

---

## 🧪 Code Quality & Verification

Run TypeScript compilation check:

```bash
npx tsc --noEmit
```

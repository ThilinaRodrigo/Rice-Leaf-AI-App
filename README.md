# Rice Leaf AI

Rice Leaf AI is a mobile and web application for identifying common rice-leaf diseases from an uploaded or captured image. The Expo frontend sends the image to a FastAPI service, which runs the included TensorFlow model and returns a predicted class and confidence score.

## Features

- Capture or choose a rice-leaf image.
- Detect bacterial leaf blight, brown spot, healthy leaves, leaf scald, and narrow brown spot.
- Display the predicted disease, confidence score, contributing factors, and recommended actions.
- Run the frontend in Expo for web, Android, or iOS.

## Project structure

```text
Rice-Leaf-AI-App/
|- rice-leaf-app/        # Expo, React Native, and TypeScript frontend
|- ml-service/           # FastAPI and TensorFlow prediction API
|  `- models/model1.keras
`- README.md
```

## Prerequisites

Install the following before starting:

- Node.js 20 or later
- Python 3.10-3.12
- npm (included with Node.js)

For testing on a physical phone, the phone and computer must use the same Wi-Fi network.

## 1. Start the ML prediction service

Open a PowerShell terminal from the project root and run:

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

The first startup can take a little longer because TensorFlow loads and warms up `models/model1.keras`.

When the API is ready, it prints:

```text
Application startup complete.
```

Open the interactive API documentation at <http://127.0.0.1:8001/docs>.

## 2. Configure the frontend API URL

Edit `rice-leaf-app/constant/api.ts` before running the frontend.

For the web application running on the same computer:

```ts
export const API_BASE_URL = "http://127.0.0.1:8001";
```

For Expo Go or a development build on a phone, use the computer's Wi-Fi IPv4 address instead:

```ts
export const API_BASE_URL = "http://192.168.x.x:8001";
```

Find that address with:

```powershell
ipconfig
```

Use the `IPv4 Address` listed under `Wireless LAN adapter Wi-Fi`. Keep port `8001` unchanged unless you also start the API on a different port.

## 3. Start the Expo frontend

Open a second PowerShell terminal from the project root:

```powershell
cd rice-leaf-app
npm.cmd install
npx.cmd expo start --clear
```

Choose one of the displayed options:

```text
w  Open in a web browser
a  Open on an Android emulator
QR Scan with Expo Go on a supported Android or iOS device
```

To run only the web version:

```powershell
npm.cmd run web
```

## Test the prediction API with Postman

Create a request with the following settings:

```text
Method: POST
URL:    http://127.0.0.1:8001/predict
Body:   form-data
Key:    file
Type:   File
Value:  select a rice-leaf image
```

Do not manually set the `Content-Type` header; Postman adds the required multipart boundary automatically.

A successful response resembles:

```json
{
  "class_id": 0,
  "label": "bacterial_leaf_blight",
  "confidence": 0.9876
}
```

## Troubleshooting

### `400 Bad Request` when uploading an image

Confirm the request uses a `file` form-data field and that the ML service is running. The frontend upload service must not manually set `Content-Type: multipart/form-data`, because the browser or React Native runtime must create its multipart boundary.

### Expo Go reports that the project is incompatible

This project uses Expo SDK 54. Update Expo Go from the Play Store or App Store, then restart the development server:

```powershell
npx.cmd expo start --clear
```

If the device cannot install an Expo Go version that supports SDK 54, run the web application or use an Android emulator/development build.

### The phone cannot reach the API

- Verify the API is running with `--host 0.0.0.0`.
- Verify both devices are on the same Wi-Fi network.
- Use the computer's Wi-Fi IPv4 address, not `127.0.0.1`, in `api.ts`.
- Allow Python through Windows Firewall on private networks when prompted.

## Available prediction labels

| ID | Label |
| -- | ----- |
| 0 | `bacterial_leaf_blight` |
| 1 | `brown_spot` |
| 2 | `healthy` |
| 3 | `leaf_scald` |
| 4 | `narrow_brown_spot` |

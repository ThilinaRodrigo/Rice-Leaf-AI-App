from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

# VGG19 preprocess
preprocess_input = tf.keras.applications.vgg19.preprocess_input

app = FastAPI(title="Rice Leaf Disease Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/model1.keras"
IMG_SIZE = 224

CLASS_LABELS = {
    0: "bacterial_leaf_blight",
    1: "brown_spot",
    2: "healthy",
    3: "leaf_scald",
    4: "narrow_brown_spot"
}

# Load model with custom_objects
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={"preprocess_input": preprocess_input}
        )
        # Warm-up
        model.predict(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)))
    except Exception as e:
        print(f"Warning: Failed to load model at startup: {e}")

def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = preprocess_input(image)
    return image

def validate_rice_leaf_image(image: Image.Image, confidence: float) -> tuple[bool, str]:
    """
    Senior AI/ML Guardrail: Validates whether an uploaded image contains paddy vegetation
    and satisfies the model's confidence threshold for Out-Of-Distribution (OOD) protection.
    """
    # 1. Confidence Threshold Check (Reject low confidence predictions < 60%)
    if confidence < 0.60:
        return False, "Image not recognized as a rice leaf. Please upload a clear photo of paddy leaves."

    # 2. Vegetation Color Spectrum Analysis (HSV space: Green, Yellowish, Brown leaf hues)
    img_hsv = image.convert('HSV')
    np_img = np.array(img_hsv)
    h, s, v = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2]

    # Hue range: Green (35-90), Yellow/Brown (10-35) with minimum saturation and brightness
    paddy_mask = ((h >= 10) & (h <= 95)) & (s >= 25) & (v >= 25)
    paddy_pixel_ratio = np.sum(paddy_mask) / (np_img.shape[0] * np_img.shape[1])

    if paddy_pixel_ratio < 0.12:
        return False, "Non-plant image detected. Please capture a close-up photo of the rice leaf."

    return True, ""

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if file.content_type and not file.content_type.startswith("image/") and file.content_type != "application/octet-stream":
        raise HTTPException(status_code=400, detail="Invalid image file format")

    if model is None:
        raise HTTPException(status_code=503, detail="ML Model not available or loading on server.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        processed_image = preprocess_image(image)

        predictions = model.predict(processed_image)
        class_id = int(np.argmax(predictions, axis=1)[0])
        confidence = float(np.max(predictions))

        # Perform AI/ML Out-Of-Distribution (OOD) Guardrail Validation
        is_valid, validation_error = validate_rice_leaf_image(image, confidence)
        if not is_valid:
            raise HTTPException(status_code=422, detail=validation_error)

        return {
            "class_id": class_id,
            "label": CLASS_LABELS[class_id],
            "confidence": round(confidence, 4),
            "is_rice_leaf": True
        }

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

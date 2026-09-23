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
    allow_origins=["*"],  # restrict later
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
model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"preprocess_input": preprocess_input}
)

# Warm-up
model.predict(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)))

def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = preprocess_input(image)
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if file.content_type and not file.content_type.startswith("image/") and file.content_type != "application/octet-stream":
        raise HTTPException(status_code=400, detail="Invalid image file")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        processed_image = preprocess_image(image)

        predictions = model.predict(processed_image)
        class_id = int(np.argmax(predictions, axis=1)[0])
        confidence = float(np.max(predictions))

        return {
            "class_id": class_id,
            "label": CLASS_LABELS[class_id],
            "confidence": round(confidence, 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

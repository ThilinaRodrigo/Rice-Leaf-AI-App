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

MODEL_PATH = os.getenv("MODEL_PATH", "models/model1.keras")
VALIDATOR_MODEL_PATH = os.getenv("VALIDATOR_MODEL_PATH", "models/rice_leaf_validator.keras")
RICE_VALIDATOR_THRESHOLD = float(os.getenv("RICE_VALIDATOR_THRESHOLD", "0.50"))
IMG_SIZE = 224

CLASS_LABELS = {
    0: "bacterial_leaf_blight",
    1: "brown_spot",
    2: "healthy",
    3: "leaf_scald",
    4: "narrow_brown_spot"
}

# Monkey-patch Keras Dense layer to ignore 'quantization_config' argument serialized in model
try:
    import keras
    orig_dense_init = keras.layers.Dense.__init__
    def patched_dense_init(self, *args, **kwargs):
        kwargs.pop("quantization_config", None)
        orig_dense_init(self, *args, **kwargs)
    keras.layers.Dense.__init__ = patched_dense_init
except Exception as patch_err:
    print(f"Keras Dense patch notice: {patch_err}")

try:
    orig_tf_dense_init = tf.keras.layers.Dense.__init__
    def patched_tf_dense_init(self, *args, **kwargs):
        kwargs.pop("quantization_config", None)
        orig_tf_dense_init(self, *args, **kwargs)
    tf.keras.layers.Dense.__init__ = patched_tf_dense_init
except Exception:
    pass

# Load disease model with custom_objects and safe_mode=False
model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"preprocess_input": preprocess_input},
    safe_mode=False
)
model.predict(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)))

# Load validator model if present
validator_model = None
if os.path.exists(VALIDATOR_MODEL_PATH):
    try:
        validator_model = tf.keras.models.load_model(
            VALIDATOR_MODEL_PATH,
            custom_objects={"preprocess_input": preprocess_input},
            safe_mode=False
        )
        validator_model.predict(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)))
        print(f"Rice leaf validation model loaded successfully from {VALIDATOR_MODEL_PATH} (threshold: {RICE_VALIDATOR_THRESHOLD})")
    except Exception as val_err:
        print(f"Warning: Failed to load validator model from {VALIDATOR_MODEL_PATH}: {val_err}")

def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = preprocess_input(image)
    return image

def preprocess_validator_image(image: Image.Image) -> np.ndarray:
    image = image.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.post("/validate")
async def validate_image(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/") and file.content_type != "application/octet-stream":
        raise HTTPException(status_code=400, detail="Invalid image file")

    if validator_model is None:
        raise HTTPException(status_code=500, detail="Rice leaf validator model is not loaded")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        processed_image = preprocess_validator_image(image)

        prediction = validator_model.predict(processed_image)
        if len(prediction.shape) > 1 and prediction.shape[1] > 1:
            raw_score = float(prediction[0][1])
        elif len(prediction.shape) > 1:
            raw_score = float(prediction[0][0])
        else:
            raw_score = float(prediction[0])

        prob = round(raw_score, 4)
        is_rice_leaf = bool(prob >= RICE_VALIDATOR_THRESHOLD)

        return {
            "is_rice_leaf": is_rice_leaf,
            "rice_leaf_probability": prob
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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


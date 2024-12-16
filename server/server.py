from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import Request
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import tensorflow as tf
import numpy as np
import cv2
import os
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid input format", "details": exc.errors()},
    )

# Define custom focal loss function
def focal_loss(alpha=0.25, gamma=2.0):
    def focal_loss_fixed(y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, tf.keras.backend.epsilon(), 1 - tf.keras.backend.epsilon())
        loss = -y_true * alpha * tf.pow(1 - y_pred, gamma) * tf.math.log(y_pred) \
               - (1 - y_true) * (1 - alpha) * tf.pow(y_pred, gamma) * tf.math.log(1 - y_pred)
        return tf.reduce_mean(loss)
    return focal_loss_fixed

# Load all models
model_paths = [
    "../model/best_model.keras",
    "../model/deepfake_model_increased_data.keras",
    "../model/fine_tuned_custom_model.keras",
    "../model/final_enhanced_model.keras",
]

models = [load_model(model_path) for model_path in model_paths[:3]]
models.append(load_model(model_paths[3], custom_objects={"focal_loss_fixed": focal_loss(alpha=0.25, gamma=2.0)}))

print(f"Loaded {len(models)} models.")

# Image preprocessing function
def preprocess_image(file) -> np.ndarray:
    img = image.load_img(file, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array /= 255.0  # Normalize image
    return img_array

# Detect human face in the image using OpenCV
def detect_face(file: str) -> bool:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    img = cv2.imread(file)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return len(faces) > 0

# Ensemble prediction
def ensemble_predict(img_array: np.ndarray, user_confidence: float) -> dict:
    ensemble_score = 0.0
    for model in models:
        preds = model.predict(img_array).flatten()
        ensemble_score += preds[0]

    ensemble_score /= len(models)  # Average the scores

    # Adjust the decision threshold based on user confidence
    adjusted_threshold = 0.55 if user_confidence is None else max(0.55, user_confidence)
    label = "Real" if ensemble_score >= adjusted_threshold else "Fake"

    return {
        "predicted_label": label,
        "confidence_score": float(ensemble_score),
        "threshold_used": float(adjusted_threshold)
    }

# API endpoint for prediction
@app.post("/predict")
async def predict_image(file: UploadFile = File(...), confidence: float = Form(None)):
    try:
        # Save the uploaded file temporarily
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as f:
            f.write(await file.read())

        # Detect face in the image
        if not detect_face(temp_file):
            os.remove(temp_file)
            return JSONResponse(content={"error": "No human face detected"}, status_code=400)

        # Preprocess the image
        img_array = preprocess_image(temp_file)

        # Get the ensemble prediction
        result = ensemble_predict(img_array, confidence)

        # Remove the temp file
        os.remove(temp_file)

        return JSONResponse(content=result)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Run the API locally
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

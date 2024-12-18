import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Slider, Typography } from "@mui/material";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // For image preview
  const [confidence, setConfidence] = useState(0.5);
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to get a response from the backend.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.error) {
        setResult({ error: data.error }); // Handle the "No human face detected" case
      } else {
        console.log("Backend Response:", data);
        setResult(data);
      }
      resetSlider();
    },
    onError: (error) => {
      console.error(error.message);
      setResult({ error: "Something went wrong. Please try again." });
    },
  });

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate preview URL
      setResult(null); // Clear previous result when a new file is uploaded
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage); // Use "file" key as expected by the backend
    formData.append("confidence", confidence);

    mutation.mutate(formData);
  };

  const handleSliderChange = (_, value) => {
    setConfidence(value);
  };

  const resetSlider = () => {
    setConfidence(0.5);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        backgroundImage:
          "url('./src/assets/deepfake_background_picture_2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 1,
        color: "white",
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "15px"
        }}
      >
        <Typography variant="h4" gutterBottom>
          DeepFake Detection Model
        </Typography>
        <Typography variant="body1" gutterBottom>
          This tool uses advanced machine learning models to detect whether an
          image is real or fake. You can adjust the confidence level and upload
          an image to analyze its authenticity.
        </Typography>
        <div
          style={{
            margin: "20px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            component="label"
            style={{ marginBottom: "10px" }}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          {selectedImage && (
            <Typography variant="body2">{selectedImage.name}</Typography>
          )}
          {imagePreview && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={imagePreview}
                alt="Uploaded Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </div>
        <div
          style={{
            margin: "20px 0",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography gutterBottom>
            Confidence Level: {confidence.toFixed(2)}
          </Typography>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "50%",
            }}
          >
            <Typography
              variant="body2"
              style={{
                padding: "5px 10px",
                backgroundColor: "green",
                color: "white",
                borderRadius: "5px",
              }}
            >
              Real
            </Typography>
            <Slider
              value={confidence}
              onChange={handleSliderChange}
              step={0.05}
              min={0.1}
              max={0.9}
              valueLabelDisplay="auto"
              disabled={!selectedImage} // Disable slider until image is uploaded
              style={{ flex: 1, margin: "0 16px" }} // Allow the slider to stretch between the labels
            />
            <Typography
              variant="body2"
              style={{
                padding: "5px 10px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "5px",
              }}
            >
              Fake
            </Typography>
          </div>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Analyzing..." : "Submit"}
        </Button>
        {result && (
          <div style={{ marginTop: "20px" }}>
            {result.error ? (
              <Typography color="error">{result.error}</Typography>
            ) : (
              <Typography
                variant="body1"
                style={{
                  padding: "10px",
                  backgroundColor:
                    result.predicted_label === "Fake" ? "red" : "green",
                  color: "white",
                  borderRadius: "5px",
                }}
              >
                Prediction: {result.predicted_label || "N/A"} <br />
                Confidence:{" "}
                {result.confidence_score !== undefined
                  ? result.confidence_score.toFixed(2)
                  : "N/A"}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

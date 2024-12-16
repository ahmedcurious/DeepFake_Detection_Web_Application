import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Slider, Typography, Box } from "@mui/material";

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
      console.log("Backend Response:", data);
      setResult(data);
      resetInputs(); // Reset slider and image selection on success
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

  const resetInputs = () => {
    setConfidence(0.5);
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "auto",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        DeepFake Detection Model
      </Typography>
      <Typography variant="body1" gutterBottom>
        This tool uses advanced machine learning models to detect whether an
        image is real or fake. You can adjust the confidence level and upload an
        image to analyze its authenticity.
      </Typography>
      <Box sx={{ margin: "20px 0" }}>
        <Button
          variant="contained"
          component="label"
          sx={{ marginBottom: "10px" }}
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
          <Box
            sx={{
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
          </Box>
        )}
      </Box>
      <Box sx={{ margin: "20px 0", width: "100%" }}>
        <Typography gutterBottom>
          Confidence Level: {confidence.toFixed(2)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{
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
            sx={{ flex: 1, mx: 2 }} // Allow the slider to stretch between the labels
          />
          <Typography
            variant="body2"
            sx={{
              padding: "5px 10px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "5px",
            }}
          >
            Fake
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Analyzing..." : "Submit"}
      </Button>
      {result && (
        <Box sx={{ marginTop: "20px" }}>
          {result.error ? (
            <Typography color="error">{result.error}</Typography>
          ) : (
            <Typography
              variant="body1"
              sx={{
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
        </Box>
      )}
    </Box>
  );
}

export default App;

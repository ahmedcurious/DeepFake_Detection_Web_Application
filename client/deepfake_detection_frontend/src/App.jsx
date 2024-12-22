import "./App.css";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Slider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";

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
      className="flex flex-col items-center justify-center w-screen h-screen bg-cover
      bg-center bg-no-repeat text-white overflow-hidden max-w-full font-oxanium"
      style={{
        backgroundImage:
          "url('./src/assets/deepfake_background_picture_3.jpg')",
      }}
    >
      <div
        className="flex flex-col items-center justify-center 
      bg-custom-gradient border-solid border-2 border-slate-300 box-border
      rounded-3xl shadow-xl backdrop-blur sm:mx-auto h-fit w-1/2 p-8"
        style={{
          opacity: 0, // Initial hidden state
          animation: "fade-in 700ms ease-in-out forwards",
          animationDelay: "1000ms",
        }}
      >
        <div
          className="w-fit"
          style={{
            opacity: 0, // Initial hidden state
            animation: "fade-in 700ms ease-in-out forwards",
            animationDelay: "1800ms",
          }}
        >
          <h1
            className="text-4xl mb-6 font-press_start_2p text-center shadow-md
          animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white"
          style={{
            animationDelay: "1800ms",
          }}
          >
            DeepFake Detector
          </h1>
        </div>
        <p
          className="text-center text-lg font-medium mb-4 font-oxanium text-wrap w-3/4"
          style={{
            opacity: 0, // Initial hidden state
            animation: "fade-in 700ms ease-in-out forwards",
            animationDelay: "2600ms",
          }}
        >
          This tool uses advanced machine learning models to detect whether an
          image is real or fake. You can adjust the confidence level and upload
          an image to analyze its authenticity.
        </p>
        <div
          className="flex flex-col items-center justify-center my-5"
          style={{
            opacity: 0, // Initial hidden state
            animation: "fade-in 700ms ease-in-out forwards",
            animationDelay: "3200ms",
          }}
        >
          <Button
            variant="outlined"
            component="label"
            className="font-oxanium"
            size="small"
            sx={{
              fontFamily: "Oxanium",
              color: "white",
              borderColor: "white",
              fontSize: "14px",
            }}
            endIcon={<UploadFileIcon />}
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
            <p className="text-sm font-oxanium mt-3">{selectedImage.name}</p>
          )}
          {imagePreview && (
            <div className="mt-2 flex justify-center">
              <img
                src={imagePreview}
                alt="Uploaded Preview"
                className="max-w-full max-h-[300px] rounded-lg shadow-lg animate-in fade-in duration-700"
              />
            </div>
          )}
        </div>
        <div
          className="my-5 w-full flex flex-col items-center justify-center"
          style={{
            opacity: 0, // Initial hidden state
            animation: "fade-in 700ms ease-in-out forwards",
            animationDelay: "3800ms",
          }}
        >
          <p>Confidence Level: {confidence.toFixed(2)}</p>
          <div className="flex items-center justify-between w-1/2">
            <span className="px-3 py-1 bg-green-600 text-white rounded">
              Real
            </span>
            <Slider
              value={confidence}
              onChange={handleSliderChange}
              step={0.05}
              min={0.1}
              max={0.9}
              valueLabelDisplay="auto"
              disabled={!selectedImage}
              className="flex-1 mx-4 font-oxanium"
              sx={{ fontFamily: "Oxanium" }}
            />
            <span className="px-3 py-1 bg-red-600 text-white rounded">
              Fake
            </span>
          </div>
        </div>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={mutation.isLoading}
          className="font-oxanium"
          style={{
            opacity: 0, // Initial hidden state
            animation: "fade-in 700ms ease-in-out forwards",
            animationDelay: "4600ms",
          }}
          sx={{ fontFamily: "Oxanium", backgroundColor: "#01c3d5" }}
          endIcon={<SendIcon />}
        >
          {mutation.isLoading ? "Analyzing..." : "Submit"}
        </Button>
        {result && (
          <div className="mt-5 animate-in fade-in duration-700">
            {result.error ? (
              <p className="text-white bg-red-600 rounded py-2 px-10">
                {result.error}
              </p>
            ) : (
              <p
                className={`rounded text-white py-2 px-10 ${
                  result.predicted_label === "Fake"
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                Prediction: {result.predicted_label || "N/A"} <br />
                Confidence:{" "}
                {result.confidence_score !== undefined
                  ? result.confidence_score.toFixed(2)
                  : "N/A"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

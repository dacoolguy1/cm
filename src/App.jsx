import React, { useState, useRef, useCallback, useEffect } from "react";

// Circle positioning constants - adjust these to match your background image
const CIRCLE_CENTER_X = 540;
const CIRCLE_CENTER_Y = 415;
const CIRCLE_RADIUS = 240;

// Image Cropper Component
const ImageCropper = ({ image, onCrop, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [resizeStart, setResizeStart] = useState({ scale: 1, y: 0 });

  const cropAreaSize = 300;
  const minScale = 0.5;
  const maxScale = 3;

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const imgAspect = image.naturalWidth / image.naturalHeight;
      const cropAspect = 1; // Circle is 1:1

      let initialScale;
      if (imgAspect > cropAspect) {
        initialScale = cropAreaSize / image.naturalHeight;
      } else {
        initialScale = cropAreaSize / image.naturalWidth;
      }

      setImageScale(initialScale);
      setImagePosition({
        x: centerX - (image.naturalWidth * initialScale) / 2,
        y: centerY - (image.naturalHeight * initialScale) / 2,
      });
    }
  }, [image]);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw image
    ctx.drawImage(
      image,
      imagePosition.x,
      imagePosition.y,
      image.naturalWidth * imageScale,
      image.naturalHeight * imageScale,
    );

    // Draw overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Create circular crop area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = cropAreaSize / 2;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw crop circle border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw corner handles for resizing
    const handleSize = 20;
    const handlePositions = [
      {
        x: centerX + radius - handleSize / 2,
        y: centerY - radius + handleSize / 2,
      },
      {
        x: centerX + radius - handleSize / 2,
        y: centerY + radius - handleSize / 2,
      },
      {
        x: centerX - radius + handleSize / 2,
        y: centerY + radius - handleSize / 2,
      },
      {
        x: centerX - radius + handleSize / 2,
        y: centerY - radius + handleSize / 2,
      },
    ];

    handlePositions.forEach((pos) => {
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(
        pos.x - handleSize / 2,
        pos.y - handleSize / 2,
        handleSize,
        handleSize,
      );
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        pos.x - handleSize / 2 + 2,
        pos.y - handleSize / 2 + 2,
        handleSize - 4,
        handleSize - 4,
      );
    });
  }, [image, imagePosition, imageScale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = cropAreaSize / 2;

    const handleSize = 20;
    const handlePositions = [
      {
        x: centerX + radius - handleSize / 2,
        y: centerY - radius + handleSize / 2,
      },
      {
        x: centerX + radius - handleSize / 2,
        y: centerY + radius - handleSize / 2,
      },
      {
        x: centerX - radius + handleSize / 2,
        y: centerY + radius - handleSize / 2,
      },
      {
        x: centerX - radius + handleSize / 2,
        y: centerY - radius + handleSize / 2,
      },
    ];

    const clickedHandle = handlePositions.find(
      (pos) =>
        x >= pos.x - handleSize / 2 &&
        x <= pos.x + handleSize / 2 &&
        y >= pos.y - handleSize / 2 &&
        y <= pos.y + handleSize / 2,
    );

    if (clickedHandle) {
      setIsResizing(true);
      setResizeStart({ scale: imageScale, y });
    } else {
      setIsDragging(true);
      setDragStart({ x: x - imagePosition.x, y: y - imagePosition.y });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setImagePosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    } else if (isResizing) {
      const deltaY = y - resizeStart.y;
      const scaleFactor = 1 + deltaY * 0.01;
      const newScale = Math.max(
        minScale,
        Math.min(maxScale, resizeStart.scale * scaleFactor),
      );
      setImageScale(newScale);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleCrop = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = cropAreaSize / 2;

    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");
    cropCanvas.width = radius * 2;
    cropCanvas.height = radius * 2;

    const scaleX = image.naturalWidth / (image.naturalWidth * imageScale);
    const scaleY = image.naturalHeight / (image.naturalHeight * imageScale);

    const sourceX = (centerX - imagePosition.x - radius) * scaleX;
    const sourceY = (centerY - imagePosition.y - radius) * scaleY;
    const sourceWidth = radius * 2 * scaleX;
    const sourceHeight = radius * 2 * scaleY;

    cropCtx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      radius * 2,
      radius * 2,
    );

    const croppedImage = new Image();
    croppedImage.onload = () => onCrop(croppedImage);
    croppedImage.src = cropCanvas.toDataURL();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3
        style={{ marginBottom: "10px", fontSize: "1.5rem", color: "#1f2937" }}
      >
        Adjust Your Photo
      </h3>
      <p style={{ marginBottom: "20px", color: "#6b7280", fontSize: "0.9rem" }}>
        Drag to move • Use corner handles to resize
      </p>

      <div
        style={{
          width: "100%",
          height: "400px",
          border: "2px solid #e5e7eb",
          borderRadius: "15px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            cursor: "move",
            display: "block",
            touchAction: "none", // prevent scrolling during drag
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleMouseUp();
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            fontWeight: "bold",
            color: "#374151",
            display: "block",
            marginBottom: "10px",
          }}
        >
          Size: {Math.round(imageScale * 100)}%
        </label>
        <input
          type="range"
          min={minScale}
          max={maxScale}
          step="0.1"
          value={imageScale}
          onChange={(e) => setImageScale(parseFloat(e.target.value))}
          style={{
            width: "100%",
            height: "8px",
            borderRadius: "5px",
            background: "#e5e7eb",
            outline: "none",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 24px",
            border: "none",
            borderRadius: "25px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: "#6b7280",
            color: "white",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleCrop}
          style={{
            padding: "12px 24px",
            border: "none",
            borderRadius: "25px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: "#3b82f6",
            color: "white",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
          }}
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
};

function App() {
  const [step, setStep] = useState("initial");
  const [userImage, setUserImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [backgroundTemplate, setBackgroundTemplate] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(true);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Load background template on component mount
  useEffect(() => {
    console.log("Loading background template from /images/back.png");
    const img = new Image();
    img.onload = () => {
      console.log(
        "Background template loaded successfully:",
        img.width,
        "x",
        img.height,
      );
      setBackgroundTemplate(img);
      setTemplateLoading(false);
    };
    img.onerror = () => {
      console.error("Failed to load background template from /images/back.png");
      // Create fallback background
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
      gradient.addColorStop(0, "#1a365d");
      gradient.addColorStop(1, "#2d3748");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CCIC Camp Meeting 2025", 540, 200);

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(540, 450, 180, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "30px Arial";
      ctx.fillText("I will be attending", 540, 700);

      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setBackgroundTemplate(fallbackImg);
        setTemplateLoading(false);
      };
      fallbackImg.src = canvas.toDataURL();
    };

    img.src = "/images/back.png";
  }, []);

  const handleCircleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name, file.size, file.type);

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("FileReader loaded successfully");
      const img = new Image();
      img.onload = () => {
        console.log(
          "Image loaded successfully:",
          img.naturalWidth,
          "x",
          img.naturalHeight,
        );
        setUserImage(img);
        setStep("cropping");
        setIsLoading(false);
      };
      img.onerror = (error) => {
        console.error("Failed to load image:", error);
        alert("Failed to load image. Please try again.");
        setIsLoading(false);
        setStep("initial");
      };
      img.src = e.target.result;
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      alert("Error reading file. Please try again.");
      setIsLoading(false);
      setStep("initial");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropComplete = (croppedImg) => {
    setCroppedImage(croppedImg);
    setStep("uploaded");
    generateFlyer(croppedImg);
  };

  const handleCropCancel = () => {
    setStep("initial");
    setUserImage(null);
  };

  const generateFlyer = useCallback(
    (imageToUse) => {
      console.log("Starting flyer generation...");

      if (!imageToUse || !canvasRef.current) {
        console.error("Missing imageToUse or canvas");
        alert(
          "Unable to generate flyer. Please try uploading your photo again.",
        );
        setStep("initial");
        return;
      }

      if (!backgroundTemplate) {
        console.error("Background template not loaded yet");
        alert(
          "Background template is still loading. Please try again in a moment.",
        );
        setStep("initial");
        return;
      }

      try {
        console.log(
          "Background template available:",
          backgroundTemplate.width,
          "x",
          backgroundTemplate.height,
        );

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = 1080;
        canvas.height = 1080;
        ctx.clearRect(0, 0, 1080, 1080);

        console.log("Drawing background template on canvas...");
        ctx.drawImage(backgroundTemplate, 0, 0, 1080, 1080);
        console.log("Background template drawn on canvas successfully");

        const centerX = CIRCLE_CENTER_X;
        const centerY = CIRCLE_CENTER_Y;
        const radius = CIRCLE_RADIUS;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();

        const size = radius * 2;
        // Clip the canvas to a circle before drawing the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Calculate aspect ratio fit (cover mode)
        const imgAspect = imageToUse.width / imageToUse.height;
        const circleSize = radius * 2;
        let drawWidth, drawHeight;

        if (imgAspect > 1) {
          // Image is wider than tall → fit to circle width
          drawWidth = circleSize;
          drawHeight = circleSize / imgAspect;
        } else {
          // Image is taller than wide → fit to circle height
          drawHeight = circleSize;
          drawWidth = circleSize * imgAspect;
        }

        // Center the image within the circle
        const drawX = centerX - drawWidth / 2;
        const drawY = centerY - drawHeight / 2;

        ctx.drawImage(imageToUse, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        console.log("Photo positioned at:", { centerX, centerY, radius });

        const dataURL = canvas.toDataURL("image/png");
        setGeneratedImage(dataURL);
        setStep("generated");
        console.log("Flyer generated successfully");
      } catch (error) {
        console.error("Error generating flyer:", error);
        alert("Error generating flyer. Please try again.");
        setStep("initial");
      }
    },
    [backgroundTemplate],
  );

  const downloadFlyer = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "CCIC-Camp-Meeting-2025-Flyer.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const resetApp = () => {
    setStep("initial");
    setUserImage(null);
    setCroppedImage(null);
    setGeneratedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "2.5rem",
              fontWeight: "bold",
            }}
          >
            CCIC Camp Meeting 2025
          </h1>
          <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.9 }}>
            Create Your Personalized Flyer
          </p>
        </div>

        <div style={{ padding: "30px" }}>
          {/* Initial Step */}
          {step === "initial" && (
            <div style={{ textAlign: "center" }}>
              {templateLoading ? (
                <div>
                  <div style={{ fontSize: "4rem", marginBottom: "20px" }}>
                    🎨
                  </div>
                  <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
                    Loading flyer template...
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: "15px",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      marginBottom: "30px",
                    }}
                  >
                    <img
                      src="/images/back.png"
                      alt="Camp Meeting Flyer"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        display: "block",
                      }}
                    />
                    <div
                      onClick={handleCircleClick}
                      style={{
                        position: "absolute",
                        top: "15%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        backgroundColor: isLoading
                          ? "rgba(59, 130, 246, 0.8)"
                          : "rgba(255, 255, 255, 0.9)",
                        border: "3px dashed #3b82f6",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {isLoading ? (
                        <div
                          style={{
                            fontSize: "2rem",
                            animation: "spin 1s linear infinite",
                          }}
                        >
                          📷
                        </div>
                      ) : (
                        <>
                          <div
                            style={{ fontSize: "2rem", marginBottom: "5px" }}
                          >
                            +
                          </div>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#3b82f6",
                              fontWeight: "bold",
                            }}
                          >
                            Add Photo
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "#6b7280",
                      marginBottom: "20px",
                    }}
                  >
                    Click the circle on the flyer above to upload your photo and
                    create your personalized flyer!
                  </p>
                </>
              )}
            </div>
          )}

          {/* Cropping Step */}
          {step === "cropping" && userImage && (
            <ImageCropper
              image={userImage}
              onCrop={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}

          {/* Processing Step */}
          {step === "uploaded" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "20px",
                  animation: "spin 2s linear infinite",
                }}
              >
                🎨
              </div>
              <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
                Creating your personalized flyer...
              </p>
            </div>
          )}

          {/* Generated Step */}
          {step === "generated" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "30px",
                  padding: "15px 30px",
                  backgroundColor: "#dcfce7",
                  borderRadius: "50px",
                  color: "#166534",
                  fontWeight: "bold",
                }}
              >
                <span style={{ fontSize: "1.5rem", marginRight: "10px" }}>
                  ✅
                </span>
                Your personalized flyer is ready!
              </div>

              <div
                style={{
                  marginBottom: "30px",
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  display: "inline-block",
                }}
              >
                <img
                  src={generatedImage}
                  alt="Generated Flyer"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={downloadFlyer}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    padding: "15px 30px",
                    borderRadius: "50px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  📥 Download Flyer
                </button>
                <button
                  onClick={resetApp}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "15px 30px",
                    borderRadius: "50px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  🔄 Create Another
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#6b7280",
              fontWeight: "500",
            }}
          >
            Done by CCIC MEDIA TEAM
          </p>
        </div>

        {/* Hidden Elements */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: "none" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;

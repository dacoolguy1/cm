import React, { useState, useRef, useCallback, useEffect } from "react";

// Camp Meeting 2026 - Photo Slot Coordinates on 1080x1350 template
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const PHOTO_SLOT = {
  x: 71,
  y: 418,
  width: 414,
  height: 551,
};

// Image Cropper Component (Rectangular for 2026 Flyer)
const ImageCropper = ({ image, onCrop, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [resizeStart, setResizeStart] = useState({ scale: 1, y: 0 });

  // Crop area sized for preview (matching 414:551 aspect ratio ≈ 0.7513)
  const cropAreaHeight = 320;
  const cropAreaWidth = Math.round(cropAreaHeight * (PHOTO_SLOT.width / PHOTO_SLOT.height)); // ~240px
  const minScale = 0.3;
  const maxScale = 3;

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const imgAspect = image.naturalWidth / image.naturalHeight;
      const cropAspect = cropAreaWidth / cropAreaHeight;

      let initialScale;
      if (imgAspect > cropAspect) {
        // Image is wider than crop box - match height
        initialScale = cropAreaHeight / image.naturalHeight;
      } else {
        // Image is narrower than crop box - match width
        initialScale = cropAreaWidth / image.naturalWidth;
      }

      setImageScale(initialScale);
      setImagePosition({
        x: centerX - (image.naturalWidth * initialScale) / 2,
        y: centerY - (image.naturalHeight * initialScale) / 2,
      });
    }
  }, [image, cropAreaWidth, cropAreaHeight]);

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

    // Draw dimmed overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Cut out rectangular crop area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const cropX = centerX - cropAreaWidth / 2;
    const cropY = centerY - cropAreaHeight / 2;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(cropX, cropY, cropAreaWidth, cropAreaHeight);
    ctx.restore();

    // Draw crop border
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(cropX, cropY, cropAreaWidth, cropAreaHeight);
    ctx.setLineDash([]);

    // Draw corner handles for resizing
    const handleSize = 16;
    const handlePositions = [
      { x: cropX, y: cropY },
      { x: cropX + cropAreaWidth, y: cropY },
      { x: cropX, y: cropY + cropAreaHeight },
      { x: cropX + cropAreaWidth, y: cropY + cropAreaHeight },
    ];

    handlePositions.forEach((pos) => {
      ctx.fillStyle = "#b45309";
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
  }, [image, imagePosition, imageScale, cropAreaWidth, cropAreaHeight]);

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
    const cropX = centerX - cropAreaWidth / 2;
    const cropY = centerY - cropAreaHeight / 2;

    const handleSize = 24;
    const handlePositions = [
      { x: cropX, y: cropY },
      { x: cropX + cropAreaWidth, y: cropY },
      { x: cropX, y: cropY + cropAreaHeight },
      { x: cropX + cropAreaWidth, y: cropY + cropAreaHeight },
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
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setImagePosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    } else if (isResizing) {
      const deltaY = e.clientY - resizeStart.y;
      const scaleFactor = 1 - deltaY * 0.008;
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
    const cropX = centerX - cropAreaWidth / 2;
    const cropY = centerY - cropAreaHeight / 2;

    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");
    cropCanvas.width = PHOTO_SLOT.width;
    cropCanvas.height = PHOTO_SLOT.height;

    const renderedWidth = image.naturalWidth * imageScale;
    const renderedHeight = image.naturalHeight * imageScale;
    const scaleX = image.naturalWidth / renderedWidth;
    const scaleY = image.naturalHeight / renderedHeight;

    const sourceX = (cropX - imagePosition.x) * scaleX;
    const sourceY = (cropY - imagePosition.y) * scaleY;
    const sourceWidth = cropAreaWidth * scaleX;
    const sourceHeight = cropAreaHeight * scaleY;

    cropCtx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      PHOTO_SLOT.width,
      PHOTO_SLOT.height,
    );

    const croppedImage = new Image();
    croppedImage.onload = () => onCrop(croppedImage);
    croppedImage.src = cropCanvas.toDataURL("image/png");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3
        style={{ marginBottom: "10px", fontSize: "1.5rem", color: "#1f2937" }}
      >
        Adjust Your Photo
      </h3>
      <p style={{ marginBottom: "20px", color: "#6b7280", fontSize: "0.9rem" }}>
        Drag to position • Use the slider or corner handles to resize
      </p>

      <div
        style={{
          width: "100%",
          height: "440px",
          border: "2px solid #fde68a",
          borderRadius: "15px",
          overflow: "hidden",
          marginBottom: "20px",
          backgroundColor: "#18181b",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            cursor: isDragging ? "grabbing" : "grab",
            display: "block",
            touchAction: "none",
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

      <div style={{ marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <label style={{ fontWeight: "600", color: "#374151", fontSize: "0.95rem" }}>
            Zoom / Size
          </label>
          <span style={{ color: "#d97706", fontWeight: "bold" }}>
            {Math.round(imageScale * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={minScale}
          max={maxScale}
          step="0.05"
          value={imageScale}
          onChange={(e) => setImageScale(parseFloat(e.target.value))}
          style={{
            width: "100%",
            height: "8px",
            borderRadius: "5px",
            background: "#fde68a",
            outline: "none",
            accentColor: "#d97706",
            cursor: "pointer",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 28px",
            border: "none",
            borderRadius: "30px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: "#e5e7eb",
            color: "#374151",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleCrop}
          style={{
            padding: "12px 32px",
            border: "none",
            borderRadius: "30px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            color: "white",
            boxShadow: "0 4px 15px rgba(217, 119, 6, 0.4)",
          }}
        >
          Apply Photo
        </button>
      </div>
    </div>
  );
};

function App() {
  const [step, setStep] = useState("initial");
  const [userImage, setUserImage] = useState(null);
  const [, setCroppedImage] = useState(null);
  const [backgroundTemplate, setBackgroundTemplate] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(true);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Load background template (back2.png for Camp Meeting 2026)
  useEffect(() => {
    console.log("Loading background template from /images/back2.png");
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
      console.error(
        "Failed to load background template from /images/back2.png",
      );
      // Create fallback background matching 2026 1080x1350 gold theme
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, "#fef3c7");
      gradient.addColorStop(0.5, "#fde68a");
      gradient.addColorStop(1, "#d97706");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#78350f";
      ctx.font = "bold 56px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CAMPMEETING 2026", 540, 220);

      ctx.font = "bold 44px Arial";
      ctx.fillText("WALKING IN DOMINION", 540, 290);

      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 6;
      ctx.strokeRect(PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.width, PHOTO_SLOT.height);

      ctx.fillStyle = "#92400e";
      ctx.font = "28px Arial";
      ctx.fillText("Photo Slot", PHOTO_SLOT.x + PHOTO_SLOT.width / 2, PHOTO_SLOT.y + PHOTO_SLOT.height / 2);

      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setBackgroundTemplate(fallbackImg);
        setTemplateLoading(false);
      };
      fallbackImg.src = canvas.toDataURL();
    };

    img.src = "/images/back2.png";
  }, []);

  const handleUploadSlotClick = () => {
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

    if (file.size > 15 * 1024 * 1024) {
      alert("File size must be less than 15MB.");
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
      console.log("Starting Camp Meeting 2026 flyer generation...");

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
          "Background template dimensions:",
          backgroundTemplate.width,
          "x",
          backgroundTemplate.height,
        );

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 1. Draw base 2026 template (1080x1350)
        ctx.drawImage(backgroundTemplate, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 2. Draw user photo into the rectangular placeholder slot (414x551 at x:71, y:418)
        ctx.save();
        ctx.beginPath();
        ctx.rect(PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.width, PHOTO_SLOT.height);
        ctx.clip();
        ctx.drawImage(
          imageToUse,
          PHOTO_SLOT.x,
          PHOTO_SLOT.y,
          PHOTO_SLOT.width,
          PHOTO_SLOT.height,
        );
        ctx.restore();

        console.log("Photo positioned at slot:", PHOTO_SLOT);

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

  const isIOSDevice = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  const downloadFlyer = useCallback(async () => {
    if (!generatedImage) return;

    try {
      // Convert dataURL to Blob for reliable cross-platform handling
      const parts = generatedImage.split(";base64,");
      const contentType = parts[0].split(":")[1] || "image/png";
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const fileName = "CCIC-Camp-Meeting-2026-Flyer.png";
      const file = new File([blob], fileName, { type: contentType });

      // 1. Web Share API (Best experience on iOS & Mobile devices)
      // Opens the native iOS Share sheet where users can tap "Save Image" to save to Camera Roll
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "CCIC Camp Meeting 2026 Flyer",
            text: "Here is my personalized CCIC Camp Meeting 2026 flyer! #WalkingInDominion",
          });
          return;
        } catch (shareErr) {
          if (shareErr.name === "AbortError") {
            // User cancelled share sheet
            return;
          }
          console.warn("navigator.share was rejected, trying blob download:", shareErr);
        }
      }

      // 2. Standard Blob Download for Android & Desktop
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);

      // 3. Fallback for iOS browsers where programmatic anchor download is blocked
      if (isIOSDevice()) {
        const newWindow = window.open(blobUrl, "_blank");
        if (!newWindow) {
          window.location.href = blobUrl;
        }
      }
    } catch (error) {
      console.error("Error during flyer download:", error);
      // Traditional fallback
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "CCIC-Camp-Meeting-2026-Flyer.png";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
        background: "linear-gradient(135deg, #181106 0%, #291804 50%, #120a02 100%)",
        padding: "20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          maxWidth: "840px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(217, 119, 6, 0.15)",
          overflow: "hidden",
          flex: "1",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)",
            color: "white",
            padding: window.innerWidth <= 768 ? "24px 16px" : "32px 24px",
            textAlign: "center",
            boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              letterSpacing: "1px",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            Walking in Dominion
          </div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: window.innerWidth <= 768 ? "1.8rem" : "2.6rem",
              fontWeight: "900",
              letterSpacing: "-0.5px",
              lineHeight: "1.2",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            CCIC Camp Meeting 2026
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: window.innerWidth <= 768 ? "0.95rem" : "1.15rem",
              opacity: 0.95,
              fontWeight: "400",
            }}
          >
            Create & Download Your Personalized Flyer
          </p>
        </div>

        <div style={{ padding: window.innerWidth <= 768 ? "20px 15px" : "35px" }}>
          {/* Initial Step */}
          {step === "initial" && (
            <div style={{ textAlign: "center" }}>
              {templateLoading ? (
                <div style={{ padding: "60px 0" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "20px" }}>
                    ✨
                  </div>
                  <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
                    Loading Camp Meeting 2026 flyer template...
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
                      marginBottom: "25px",
                    }}
                  >
                    <img
                      src="/images/back2.png"
                      alt="Camp Meeting 2026 Flyer Template"
                      style={{
                        width: "100%",
                        maxWidth: "420px",
                        height: "auto",
                        display: "block",
                      }}
                    />
                    {/* Interactive upload overlay over the rectangular photo slot */}
                    <div
                      onClick={handleUploadSlotClick}
                      role="button"
                      tabIndex={0}
                      title="Click to upload your photo"
                      style={{
                        position: "absolute",
                        top: "30.96%", // 418 / 1350
                        left: "6.57%", // 71 / 1080
                        width: "38.33%", // 414 / 1080
                        height: "40.81%", // 551 / 1350
                        borderRadius: "6px",
                        backgroundColor: isLoading
                          ? "rgba(217, 119, 6, 0.85)"
                          : "rgba(255, 255, 255, 0.8)",
                        border: "3px dashed #b45309",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(6px)",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                        padding: "10px",
                      }}
                    >
                      {isLoading ? (
                        <div
                          style={{
                            fontSize: "2rem",
                            animation: "spin 1s linear infinite",
                          }}
                        >
                          ⏳
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              backgroundColor: "#b45309",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.8rem",
                              marginBottom: "8px",
                              boxShadow: "0 4px 10px rgba(180, 83, 9, 0.35)",
                            }}
                          >
                            +
                          </div>
                          <span
                            style={{
                              fontSize: "0.95rem",
                              color: "#78350f",
                              fontWeight: "bold",
                            }}
                          >
                            Add Your Photo
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#92400e",
                              marginTop: "4px",
                            }}
                          >
                            Tap here
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "#4b5563",
                      marginBottom: "24px",
                      maxWidth: "500px",
                      margin: "0 auto 24px",
                      lineHeight: "1.5",
                    }}
                  >
                    Click the photo area on the flyer above to upload your photo and generate your personalized Camp Meeting 2026 flyer!
                  </p>

                  <button
                    onClick={handleUploadSlotClick}
                    style={{
                      padding: "14px 36px",
                      borderRadius: "50px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                      color: "white",
                      border: "none",
                      boxShadow: "0 6px 20px rgba(217, 119, 6, 0.35)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    📷 Upload Photo
                  </button>
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
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "20px",
                  animation: "spin 2s linear infinite",
                }}
              >
                ✨
              </div>
              <p style={{ fontSize: "1.3rem", color: "#78350f", fontWeight: "600" }}>
                Creating your personalized Camp Meeting 2026 flyer...
              </p>
            </div>
          )}

          {/* Generated Step */}
          {step === "generated" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "25px",
                  padding: "12px 28px",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: "50px",
                  color: "#92400e",
                  fontWeight: "bold",
                  fontSize: "1.05rem",
                }}
              >
                <span style={{ fontSize: "1.3rem", marginRight: "10px" }}>
                  🎉
                </span>
                Your Camp Meeting 2026 flyer is ready!
              </div>

              <div
                style={{
                  marginBottom: "25px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
                  display: "inline-block",
                }}
              >
                <img
                  src={generatedImage}
                  alt="Generated Camp Meeting 2026 Flyer"
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    height: "auto",
                    display: "block",
                    WebkitTouchCallout: "default",
                    userSelect: "auto",
                    WebkitUserSelect: "auto",
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
                    background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    color: "white",
                    border: "none",
                    padding: "16px 36px",
                    borderRadius: "50px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 6px 20px rgba(217, 119, 6, 0.4)",
                  }}
                >
                  📥 Save / Download Flyer
                </button>
                <button
                  onClick={resetApp}
                  style={{
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    padding: "16px 32px",
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

              {/* iOS specific tip */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 18px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "14px",
                  border: "1px dashed #d97706",
                  color: "#78350f",
                  fontSize: "0.88rem",
                  lineHeight: "1.45",
                  maxWidth: "420px",
                  margin: "20px auto 0",
                  textAlign: "center",
                }}
              >
                📱 <strong>iPhone Tip:</strong> Tap <strong>"Save / Download Flyer"</strong> and select <strong>"Save Image"</strong> to save directly to your Photos. You can also press &amp; hold the flyer image above and choose <strong>"Save to Photos"</strong>.
              </div>
            </div>
          )}
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

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 20px",
          color: "#fef3c7",
          fontSize: "0.95rem",
          opacity: 0.9,
        }}
      >
        Developed by{" "}
        <span
          style={{
            fontWeight: "bold",
            color: "#fbbf24",
          }}
        >
          CCIC MEDIA TEAM
        </span>
      </footer>

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

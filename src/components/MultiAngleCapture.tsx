import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, RotateCcw, Check, X, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapturedImage {
  id: string;
  url: string;
  file: File;
  angle: string;
  timestamp: Date;
}

interface MultiAngleCaptureProps {
  onComplete: (images: CapturedImage[]) => void;
  onBack: () => void;
  className?: string;
}

const requiredAngles = [
  { id: "front", name: "Front View", description: "Face-on view of the animal", hindi: "सामने का दृश्य" },
  { id: "side", name: "Side Profile", description: "Complete side profile", hindi: "बगल का दृश्य" },
  { id: "rear", name: "Rear View", description: "Back view of the animal", hindi: "पीछे का दृश्य" },
  { id: "features", name: "Key Features", description: "Close-up of distinctive features", hindi: "मुख्य विशेषताएं" }
];

export const MultiAngleCapture = ({ onComplete, onBack, className }: MultiAngleCaptureProps) => {
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = requiredAngles[currentAngleIndex];
  const progress = (capturedImages.length / requiredAngles.length) * 100;

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permission or upload images instead.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreamActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  const confirmCapture = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${currentAngle.id}-${Date.now()}.jpg`, { type: "image/jpeg" });
        const newImage: CapturedImage = {
          id: currentAngle.id,
          url: capturedImage,
          file,
          angle: currentAngle.name,
          timestamp: new Date()
        };

        setCapturedImages(prev => [...prev, newImage]);
        setCapturedImage(null);

        if (currentAngleIndex < requiredAngles.length - 1) {
          setCurrentAngleIndex(prev => prev + 1);
        }
      }
    }, "image/jpeg", 0.9);
  }, [capturedImage, currentAngle, currentAngleIndex]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      const newImage: CapturedImage = {
        id: currentAngle.id,
        url: imageUrl,
        file,
        angle: currentAngle.name,
        timestamp: new Date()
      };

      setCapturedImages(prev => [...prev, newImage]);

      if (currentAngleIndex < requiredAngles.length - 1) {
        setCurrentAngleIndex(prev => prev + 1);
      }
    }
  }, [currentAngle, currentAngleIndex]);

  const removeImage = useCallback((angleId: string) => {
    setCapturedImages(prev => {
      const filtered = prev.filter(img => img.id !== angleId);
      // Find the removed angle index and go back to it
      const removedAngleIndex = requiredAngles.findIndex(angle => angle.id === angleId);
      setCurrentAngleIndex(removedAngleIndex);
      return filtered;
    });
  }, []);

  const goToPreviousAngle = () => {
    if (currentAngleIndex > 0) {
      setCurrentAngleIndex(prev => prev - 1);
    }
  };

  const goToNextAngle = () => {
    if (currentAngleIndex < requiredAngles.length - 1) {
      setCurrentAngleIndex(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    if (capturedImages.length >= 2) { // Minimum 2 angles required
      onComplete(capturedImages);
    }
  };

  const isAngleCaptured = (angleId: string) => {
    return capturedImages.some(img => img.id === angleId);
  };

  const isCurrentAngleCaptured = isAngleCaptured(currentAngle.id);

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Multi-Angle Analysis</h2>
          <p className="text-sm text-muted-foreground">बहु-कोणीय विश्लेषण</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{capturedImages.length} / {requiredAngles.length} angles</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-2">
              {requiredAngles.map((angle, index) => (
                <div
                  key={angle.id}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-smooth",
                    isAngleCaptured(angle.id) ? "bg-success" : 
                    index === currentAngleIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Angle Instructions */}
      <Card className={cn("border-2", isCurrentAngleCaptured ? "border-success" : "border-primary")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{currentAngle.name}</CardTitle>
            {isCurrentAngleCaptured && (
              <Badge variant="default" className="bg-success text-success-foreground">
                <Check className="w-3 h-3 mr-1" />
                Captured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{currentAngle.description}</p>
            <p className="text-xs text-muted-foreground">{currentAngle.hindi}</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={goToPreviousAngle}
              variant="outline"
              size="sm"
              disabled={currentAngleIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground self-center">
              {currentAngleIndex + 1} of {requiredAngles.length}
            </span>
            <Button
              onClick={goToNextAngle}
              variant="outline"
              size="sm"
              disabled={currentAngleIndex === requiredAngles.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera/Image Capture */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="camera-preview bg-muted rounded-lg overflow-hidden relative">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt={`${currentAngle.name} capture`}
                className="w-full h-full object-cover"
              />
            ) : isStreamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center bg-muted">
                <div className="text-center space-y-2">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isCurrentAngleCaptured ? "Retake this angle" : `Capture ${currentAngle.name.toLowerCase()}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {capturedImage ? (
              <div className="flex gap-3">
                <Button onClick={retakePhoto} variant="outline" size="mobile" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={confirmCapture} variant="confirm" size="mobile" className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {isStreamActive ? (
                  <Button onClick={capturePhoto} variant="camera" size="mobile-lg" className="w-full">
                    <Camera className="w-5 h-5 mr-2" />
                    Capture {currentAngle.name}
                  </Button>
                ) : (
                  <Button onClick={startCamera} variant="camera" size="mobile-lg" className="w-full">
                    <Camera className="w-5 h-5 mr-2" />
                    {isCurrentAngleCaptured ? "Retake" : "Start Camera"}
                  </Button>
                )}
                
                <div className="relative">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="mobile"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Captured Images Grid */}
      {capturedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Captured Images</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {capturedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.angle}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => removeImage(image.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className="absolute top-1 left-1 text-xs bg-success">
                    {image.angle}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      <div className="space-y-3">
        <Button
          onClick={handleComplete}
          variant="hero"
          size="mobile-lg"
          className="w-full"
          disabled={capturedImages.length < 2}
        >
          <Check className="w-5 h-5 mr-2" />
          Complete Multi-Angle Analysis
          <span className="text-xs block font-normal">
            {capturedImages.length < 2 ? `Need ${2 - capturedImages.length} more images` : "Ready for Analysis"}
          </span>
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>💡 Minimum 2 angles required. More angles = higher accuracy</p>
          <p>कम से कम 2 कोण आवश्यक। अधिक कोण = बेहतर सटीकता</p>
        </div>
      </div>
    </div>
  );
};
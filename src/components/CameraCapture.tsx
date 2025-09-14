import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onImageCapture: (imageFile: File, imageUrl: string) => void;
  className?: string;
}

export const CameraCapture = ({ onImageCapture, className }: CameraCaptureProps) => {
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
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
      setError("Camera access denied. Please allow camera permission or upload an image instead.");
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

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to blob and create object URL
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `cattle-${Date.now()}.jpg`, { type: "image/jpeg" });
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
        const file = new File([blob], `cattle-${Date.now()}.jpg`, { type: "image/jpeg" });
        onImageCapture(file, capturedImage);
      }
    }, "image/jpeg", 0.9);
  }, [capturedImage, onImageCapture]);

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
      onImageCapture(file, imageUrl);
    }
  }, [onImageCapture]);

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Capture Animal Image</h3>
          <p className="text-sm text-muted-foreground">
            Take a clear photo of the cattle or buffalo for breed identification
          </p>
          <p className="text-xs text-muted-foreground">
            स्पष्ट तस्वीर लें / Clear photo लें
          </p>
        </div>

        {/* Camera Preview or Captured Image */}
        <div className="camera-preview bg-muted rounded-lg overflow-hidden relative">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured animal"
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
                <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
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
              <Button
                onClick={retakePhoto}
                variant="outline"
                size="mobile"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={confirmCapture}
                variant="confirm"
                size="mobile"
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {isStreamActive ? (
                <Button
                  onClick={capturePhoto}
                  variant="camera"
                  size="mobile-lg"
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </Button>
              ) : (
                <Button
                  onClick={startCamera}
                  variant="camera"
                  size="mobile-lg"
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
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
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Database, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle,
  BarChart3,
  MapPin,
  Volume2
} from "lucide-react";
import { CameraCapture } from "@/components/CameraCapture";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { BreedResults } from "@/components/BreedResults";
import { BreedDatabase } from "@/components/BreedDatabase";
import { MultiAngleCapture } from "@/components/MultiAngleCapture";
import { BatchProcessing } from "@/components/BatchProcessing";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { GeolocationFeatures } from "@/components/GeolocationFeatures";
import { VoiceCommands } from "@/components/VoiceCommands";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

type AppState = "home" | "capture" | "multi-angle" | "batch" | "analytics" | "location" | "voice" | "analyzing" | "results" | "database" | "confirmed";

interface BreedPrediction {
  name: string;
  hindiName: string;
  confidence: number;
  characteristics: string[];
  region: string;
}

// Mock data for demonstration
const mockPredictions: BreedPrediction[] = [
  {
    name: "Gir",
    hindiName: "गीर",
    confidence: 87,
    characteristics: ["Drought resistant", "High milk yield", "Distinctive forehead", "White patches"],
    region: "Gujarat, Rajasthan"
  },
  {
    name: "Sahiwal",
    hindiName: "साहीवाल",
    confidence: 72,
    characteristics: ["Heat tolerant", "Good milk producer", "Docile nature"],
    region: "Punjab, Haryana"
  },
  {
    name: "Red Sindhi",
    hindiName: "लाल सिंधी",
    confidence: 64,
    characteristics: ["Heat resistant", "Good grazer", "Hardy breed"],
    region: "Maharashtra, Karnataka"
  }
];

const BreedAI = () => {
  const [currentState, setCurrentState] = useState<AppState>("home");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [confirmedBreed, setConfirmedBreed] = useState<BreedPrediction | null>(null);
  const { toast } = useToast();

  const handleImageCapture = (file: File, imageUrl: string) => {
    setCapturedImage(imageUrl);
    setCurrentState("analyzing");
  };

  const handleAnalysisComplete = () => {
    setCurrentState("results");
  };

  const handleBreedConfirm = (breed: BreedPrediction) => {
    setConfirmedBreed(breed);
    setCurrentState("confirmed");
    toast({
      title: "Breed Confirmed!",
      description: `${breed.name} (${breed.hindiName}) has been confirmed and will be sent to BPA.`,
      duration: 4000,
    });
  };

  const handleBreedCorrect = () => {
    toast({
      title: "Feedback Recorded",
      description: "Your correction has been noted. This helps improve our AI model.",
      variant: "default",
    });
    setCurrentState("capture");
  };

  const handleStartOver = () => {
    setCapturedImage(null);
    setConfirmedBreed(null);
    setCurrentState("home");
  };

  const renderContent = () => {
    switch (currentState) {
      case "home":
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="BreedAI - Cattle breed identification"
                  className="w-full h-64 object-cover rounded-2xl shadow-elevated"
                />
                <div className="absolute inset-0 gradient-hero opacity-80 rounded-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div className="text-white space-y-4">
                    <h1 className="text-4xl font-bold">BreedAI</h1>
                    <p className="text-xl">AI-Powered Cattle & Buffalo Breed Recognition</p>
                    <p className="text-base opacity-90">एआई-संचालित मवेशी और भैंस नस्ल पहचान</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Camera,
                  title: "Image Capture",
                  description: "Take or upload photos",
                  hindi: "तस्वीर लें"
                },
                {
                  icon: Zap,
                  title: "AI Analysis",
                  description: "Instant breed detection",
                  hindi: "तुरंत पहचान"
                },
                {
                  icon: Database,
                  title: "Breed Database",
                  description: "Comprehensive breed info",
                  hindi: "संपूर्ण जानकारी"
                },
                {
                  icon: Users,
                  title: "BPA Integration",
                  description: "Connect with Bharat Pashudhan App",
                  hindi: "भारत पशुधन ऐप"
                }
              ].map((feature, index) => (
                <Card key={index} className="breed-card">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <p className="text-xs text-muted-foreground">{feature.hindi}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentState("capture")}
                variant="hero"
                size="mobile-lg"
                className="w-full"
              >
                <Camera className="w-5 h-5 mr-3" />
                Quick Analysis
              </Button>
              
              <Button
                onClick={() => setCurrentState("multi-angle")}
                variant="camera"
                size="mobile-lg"
                className="w-full"
              >
                <Camera className="w-5 h-5 mr-3" />
                Multi-Angle Analysis
              </Button>
              
              <Button
                onClick={() => setCurrentState("batch")}
                variant="success"
                size="mobile-lg"
                className="w-full"
              >
                <Users className="w-5 h-5 mr-3" />
                Batch Processing
              </Button>
              
              <Button
                onClick={() => setCurrentState("analytics")}
                variant="outline"
                size="mobile-lg"
                className="w-full"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                View Analytics
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => setCurrentState("location")}
                variant="outline"
                size="mobile"
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Location Services
              </Button>
              
              <Button
                onClick={() => setCurrentState("voice")}
                variant="outline"
                size="mobile"
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Voice Commands
              </Button>
              
              <Button
                onClick={() => setCurrentState("database")}
                variant="outline"
                size="mobile"
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                Breed Database
              </Button>
            </div>

            {/* Info Section */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">How BreedAI Works</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">1</Badge>
                    <p>Capture or upload a clear image of the animal</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">2</Badge>
                    <p>AI analyzes the image for breed characteristics</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">3</Badge>
                    <p>Review predictions and confirm the correct breed</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">4</Badge>
                    <p>Data is sent to Bharat Pashudhan App for registration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "multi-angle":
        return (
          <MultiAngleCapture 
            onComplete={(images) => {
              setCapturedImage(images[0]?.url || null);
              setCurrentState("analyzing");
            }}
            onBack={() => setCurrentState("home")}
          />
        );

      case "batch":
        return <BatchProcessing onBack={() => setCurrentState("home")} />;

      case "analytics":
        return <AnalyticsDashboard />;

      case "location":
        return <GeolocationFeatures />;

      case "voice":
        return <VoiceCommands onCommand={(cmd) => console.log("Voice command:", cmd)} />;

      case "capture":
        return (
          <CameraCapture 
            onImageCapture={handleImageCapture}
            className="mt-6"
          />
        );

      case "analyzing":
        return capturedImage ? (
          <LoadingAnalysis
            image={capturedImage}
            onComplete={handleAnalysisComplete}
          />
        ) : null;

      case "results":
        return capturedImage ? (
          <BreedResults
            image={capturedImage}
            predictions={mockPredictions}
            onConfirm={handleBreedConfirm}
            onCorrect={handleBreedCorrect}
            onBack={() => setCurrentState("capture")}
          />
        ) : null;

      case "database":
        return <BreedDatabase />;

      case "confirmed":
        return (
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-success">Breed Confirmed!</h2>
              <p className="text-muted-foreground">नस्ल की पुष्टि हो गई!</p>
            </div>

            {confirmedBreed && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-primary">{confirmedBreed.name}</h3>
                    <p className="text-muted-foreground">{confirmedBreed.hindiName}</p>
                    <Badge className="mt-2 confidence-high">
                      Confidence: {confirmedBreed.confidence}%
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>✅ Breed data has been prepared for BPA integration</p>
                    <p>✅ Record saved for future reference</p>
                    <p>✅ AI model feedback recorded for improvement</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleStartOver}
                variant="hero"
                size="mobile-lg"
                className="w-full"
              >
                Analyze Another Animal
              </Button>
              
              <Button
                onClick={() => setCurrentState("database")}
                variant="outline"
                size="mobile"
                className="w-full"
              >
                View Breed Database
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4">
        {/* Header */}
        {currentState !== "home" && (
          <div className="mb-6">
            <Button
              onClick={() => setCurrentState("home")}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              ← Back to Home
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">BreedAI</h1>
              <p className="text-sm text-muted-foreground">Cattle & Buffalo Breed Recognition</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default BreedAI;
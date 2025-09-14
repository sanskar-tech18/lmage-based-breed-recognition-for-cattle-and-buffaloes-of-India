import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Camera, Brain, Database } from "lucide-react";
import { useState, useEffect } from "react";

interface LoadingAnalysisProps {
  image: string;
  onComplete: () => void;
}

const analysisSteps = [
  {
    id: 1,
    title: "Processing Image",
    description: "Analyzing image quality and features",
    hindiDescription: "छवि की गुणवत्ता का विश्लेषण",
    icon: Camera,
    duration: 2000,
  },
  {
    id: 2,
    title: "AI Model Analysis",
    description: "Running breed classification model",
    hindiDescription: "नस्ल वर्गीकरण मॉडल चलाया जा रहा है",
    icon: Brain,
    duration: 3000,
  },
  {
    id: 3,
    title: "Matching Database",
    description: "Comparing with breed database",
    hindiDescription: "नस्ल डेटाबेस से तुलना",
    icon: Database,
    duration: 2000,
  },
];

export const LoadingAnalysis = ({ image, onComplete }: LoadingAnalysisProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const runAnalysis = async () => {
      let totalProgress = 0;
      
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStep(i);
        const step = analysisSteps[i];
        const stepStart = totalProgress;
        const stepEnd = ((i + 1) / analysisSteps.length) * 100;
        
        // Animate progress for this step
        const startTime = Date.now();
        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const stepProgress = Math.min(elapsed / step.duration, 1);
          const currentProgress = stepStart + (stepEnd - stepStart) * stepProgress;
          
          setProgress(currentProgress);
          
          if (stepProgress < 1) {
            progressTimer = setTimeout(animateProgress, 50);
          } else {
            totalProgress = stepEnd;
          }
        };
        
        animateProgress();
        
        // Wait for step to complete
        await new Promise(resolve => {
          stepTimer = setTimeout(resolve, step.duration);
        });
      }
      
      // Complete the analysis
      setProgress(100);
      setTimeout(onComplete, 500);
    };

    runAnalysis();

    return () => {
      clearTimeout(stepTimer);
      clearTimeout(progressTimer);
    };
  }, [onComplete]);

  const currentStepData = analysisSteps[currentStep];

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Analyzing Image</h2>
        <p className="text-sm text-muted-foreground">छवि का विश्लेषण किया जा रहा है</p>
      </div>

      {/* Image Preview */}
      <Card>
        <CardContent className="p-4">
          <img
            src={image}
            alt="Animal being analyzed"
            className="w-full h-48 object-cover rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Analysis Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {currentStepData ? (
                  <currentStepData.icon className="w-5 h-5 text-primary" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">
                  {currentStepData?.title || "Processing..."}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentStepData?.description || "Please wait..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentStepData?.hindiDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {analysisSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-smooth ${
                  index <= currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          {/* Tips */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              💡 For best results, ensure the animal is clearly visible with good lighting
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              बेहतर परिणाम के लिए अच्छी रोशनी में स्पष्ट तस्वीर लें
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreedPrediction {
  name: string;
  hindiName: string;
  confidence: number;
  characteristics: string[];
  region: string;
}

interface BreedResultsProps {
  image: string;
  predictions: BreedPrediction[];
  onConfirm: (selectedBreed: BreedPrediction) => void;
  onCorrect: () => void;
  onBack: () => void;
  className?: string;
}

const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 80) return { level: "high", label: "High Confidence", className: "confidence-high" };
  if (confidence >= 60) return { level: "medium", label: "Medium Confidence", className: "confidence-medium" };
  return { level: "low", label: "Low Confidence", className: "confidence-low" };
};

export const BreedResults = ({ 
  image, 
  predictions, 
  onConfirm, 
  onCorrect, 
  onBack, 
  className 
}: BreedResultsProps) => {
  const [selectedBreed, setSelectedBreed] = useState<BreedPrediction>(predictions[0]);
  
  const topPrediction = predictions[0];
  const confidenceInfo = getConfidenceLevel(topPrediction.confidence);

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Breed Analysis Results</h2>
          <p className="text-sm text-muted-foreground">नस्ल विश्लेषण परिणाम</p>
        </div>
      </div>

      {/* Image Preview */}
      <Card>
        <CardContent className="p-4">
          <img
            src={image}
            alt="Analyzed animal"
            className="w-full h-48 object-cover rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Top Prediction */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Top Match</CardTitle>
            <Badge className={confidenceInfo.className}>
              {confidenceInfo.label}: {topPrediction.confidence}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-primary">{topPrediction.name}</h3>
            <p className="text-base text-muted-foreground">{topPrediction.hindiName}</p>
            <p className="text-sm text-muted-foreground mt-1">Region: {topPrediction.region}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Key Characteristics:</h4>
            <div className="flex flex-wrap gap-2">
              {topPrediction.characteristics.map((characteristic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {characteristic}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Suggestions */}
      {predictions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Other Possibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictions.slice(1).map((prediction, index) => {
              const confidence = getConfidenceLevel(prediction.confidence);
              return (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-smooth breed-card",
                    selectedBreed.name === prediction.name 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedBreed(prediction)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{prediction.name}</h4>
                      <p className="text-sm text-muted-foreground">{prediction.hindiName}</p>
                    </div>
                    <Badge className={confidence.className} variant="outline">
                      {prediction.confidence}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => onConfirm(selectedBreed)}
          variant="confirm"
          size="mobile-lg"
          className="flex-1"
        >
          <Check className="w-5 h-5 mr-2" />
          Confirm Breed
          <span className="block text-xs font-normal">पुष्टि करें</span>
        </Button>
        <Button
          onClick={onCorrect}
          variant="correct"
          size="mobile-lg"
          className="flex-1"
        >
          <X className="w-5 h-5 mr-2" />
          Need Correction
          <span className="block text-xs font-normal">सुधार चाहिए</span>
        </Button>
      </div>

      {/* Confidence Explanation */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">About Confidence Scores:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• High (80%+): Very reliable prediction</li>
                <li>• Medium (60-79%): Good match, review alternatives</li>
                <li>• Low (&lt;60%): Multiple breeds possible, manual verification recommended</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
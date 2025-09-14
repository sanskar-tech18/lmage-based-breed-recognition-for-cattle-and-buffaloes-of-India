import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Camera, 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BatchItem {
  id: string;
  fileName: string;
  imageUrl: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: {
    breed: string;
    confidence: number;
    timestamp: Date;
  };
  error?: string;
}

interface BatchProcessingProps {
  onBack: () => void;
  className?: string;
}

export const BatchProcessing = ({ onBack, className }: BatchProcessingProps) => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [farmName, setFarmName] = useState("");
  const [surveyorName, setSurveyorName] = useState("");
  const { toast } = useToast();

  const addImagesToBatch = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const newItem: BatchItem = {
          id: `batch-${Date.now()}-${Math.random()}`,
          fileName: file.name,
          imageUrl: URL.createObjectURL(file),
          status: "pending",
          progress: 0,
        };
        setBatchItems(prev => [...prev, newItem]);
      }
    });

    toast({
      title: "Images Added",
      description: `${files.length} images added to batch queue`,
    });
  }, [toast]);

  const removeItem = useCallback((id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearBatch = useCallback(() => {
    setBatchItems([]);
    setCurrentProcessingIndex(0);
  }, []);

  const mockBreedResults = [
    { breed: "Gir", confidence: 87 },
    { breed: "Sahiwal", confidence: 82 },
    { breed: "Murrah", confidence: 91 },
    { breed: "Red Sindhi", confidence: 76 },
    { breed: "Nili Ravi", confidence: 89 },
  ];

  const processNextItem = useCallback(async () => {
    if (currentProcessingIndex >= batchItems.length) {
      setIsProcessing(false);
      toast({
        title: "Batch Processing Complete",
        description: "All images have been processed successfully!",
      });
      return;
    }

    const currentItem = batchItems[currentProcessingIndex];
    
    // Update status to processing
    setBatchItems(prev => 
      prev.map((item, index) => 
        index === currentProcessingIndex 
          ? { ...item, status: "processing" as const }
          : item
      )
    );

    // Simulate processing with progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setBatchItems(prev => 
        prev.map((item, index) => 
          index === currentProcessingIndex 
            ? { ...item, progress }
            : item
        )
      );
    }

    // Complete processing with random result
    const randomResult = mockBreedResults[Math.floor(Math.random() * mockBreedResults.length)];
    const success = Math.random() > 0.1; // 90% success rate

    setBatchItems(prev => 
      prev.map((item, index) => 
        index === currentProcessingIndex 
          ? { 
              ...item, 
              status: success ? "completed" as const : "error" as const,
              result: success ? {
                breed: randomResult.breed,
                confidence: randomResult.confidence,
                timestamp: new Date()
              } : undefined,
              error: success ? undefined : "Failed to process image. Please try again."
            }
          : item
      )
    );

    setCurrentProcessingIndex(prev => prev + 1);
  }, [currentProcessingIndex, batchItems, toast]);

  const startBatchProcessing = useCallback(async () => {
    if (batchItems.length === 0) {
      toast({
        title: "No Images",
        description: "Please add images to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentProcessingIndex(0);
  }, [batchItems.length, toast]);

  const pauseProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const resumeProcessing = useCallback(() => {
    setIsProcessing(true);
  }, []);

  // Continue processing
  if (isProcessing && currentProcessingIndex < batchItems.length) {
    setTimeout(processNextItem, 100);
  }

  const completedItems = batchItems.filter(item => item.status === "completed");
  const errorItems = batchItems.filter(item => item.status === "error");
  const pendingItems = batchItems.filter(item => item.status === "pending");

  const exportResults = useCallback(() => {
    const results = completedItems.map(item => ({
      fileName: item.fileName,
      breed: item.result?.breed,
      confidence: item.result?.confidence,
      timestamp: item.result?.timestamp?.toISOString(),
      farmName,
      surveyorName,
    }));

    const csvContent = [
      "File Name,Breed,Confidence (%),Timestamp,Farm Name,Surveyor Name",
      ...results.map(r => `"${r.fileName}","${r.breed}",${r.confidence},"${r.timestamp}","${farmName}","${surveyorName}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breed-analysis-batch-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Batch results have been exported to CSV",
    });
  }, [completedItems, farmName, surveyorName, toast]);

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Batch Processing Mode</h2>
          <p className="text-muted-foreground">बैच प्रसंस्करण मोड - Process Multiple Animals</p>
        </div>
      </div>

      {/* Survey Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Survey Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="farm-name">Farm/Area Name</Label>
            <Input
              id="farm-name"
              placeholder="Enter farm or area name"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surveyor-name">Field Worker Name</Label>
            <Input
              id="surveyor-name"
              placeholder="Enter your name"
              value={surveyorName}
              onChange={(e) => setSurveyorName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{batchItems.length}</p>
            <p className="text-sm text-muted-foreground">Total Images</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{completedItems.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{pendingItems.length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{errorItems.length}</p>
            <p className="text-sm text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Button
            variant="camera"
            size="mobile"
            onClick={() => document.getElementById('batch-upload')?.click()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Images
          </Button>
          <input
            id="batch-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addImagesToBatch(e.target.files)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {batchItems.length > 0 && (
          <>
            {!isProcessing ? (
              <Button
                onClick={startBatchProcessing}
                variant="hero"
                size="mobile"
                disabled={pendingItems.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Processing
              </Button>
            ) : (
              <Button onClick={pauseProcessing} variant="warning" size="mobile">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}

            {completedItems.length > 0 && (
              <Button onClick={exportResults} variant="success" size="mobile">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            )}

            <Button onClick={clearBatch} variant="destructive" size="mobile">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </>
        )}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Processing Progress</h3>
                <Badge variant="secondary">
                  {currentProcessingIndex} / {batchItems.length}
                </Badge>
              </div>
              <Progress 
                value={(currentProcessingIndex / batchItems.length) * 100} 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground text-center">
                Processing images... Please don't close the app
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Queue ({batchItems.length})</TabsTrigger>
          <TabsTrigger value="results">Results ({completedItems.length})</TabsTrigger>
          <TabsTrigger value="errors">Errors ({errorItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {batchItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Images in Queue</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add multiple images to start batch processing
                </p>
                <Button
                  onClick={() => document.getElementById('batch-upload')?.click()}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Images
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchItems.map((item, index) => (
                <Card key={item.id} className="breed-card">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <img
                        src={item.imageUrl}
                        alt={item.fileName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      
                      <div>
                        <p className="font-medium text-sm truncate">{item.fileName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            className={cn(
                              item.status === "completed" && "bg-success text-success-foreground",
                              item.status === "processing" && "bg-primary text-primary-foreground",
                              item.status === "pending" && "bg-muted text-muted-foreground",
                              item.status === "error" && "bg-destructive text-destructive-foreground"
                            )}
                          >
                            {item.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {item.status === "processing" && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                            {item.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {item.status === "error" && <AlertCircle className="w-3 h-3 mr-1" />}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="ghost"
                            size="sm"
                            disabled={isProcessing && index <= currentProcessingIndex}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {item.status === "processing" && (
                        <Progress value={item.progress} className="h-2" />
                      )}

                      {item.result && (
                        <div className="text-xs space-y-1">
                          <p className="font-medium">Breed: {item.result.breed}</p>
                          <p className="text-muted-foreground">
                            Confidence: {item.result.confidence}%
                          </p>
                        </div>
                      )}

                      {item.error && (
                        <p className="text-xs text-destructive">{item.error}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {completedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Results Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Complete processing to see results here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Completed Analysis</h3>
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <div className="grid gap-4">
                {completedItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.imageUrl}
                          alt={item.fileName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Breed: {item.result?.breed}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="confidence-high">
                              {item.result?.confidence}% confidence
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.result?.timestamp?.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {errorItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-success mb-4" />
                <h3 className="font-medium mb-2">No Errors</h3>
                <p className="text-sm text-muted-foreground">
                  All processing completed successfully!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {errorItems.map((item) => (
                <Card key={item.id} className="border-destructive/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.fileName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.fileName}</p>
                        <p className="text-sm text-destructive">{item.error}</p>
                      </div>
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
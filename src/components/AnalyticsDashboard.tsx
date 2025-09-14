import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar, 
  Target,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  className?: string;
}

// Mock analytics data
const analyticsData = {
  totalScans: 1247,
  successRate: 87.3,
  avgConfidence: 78.2,
  topBreeds: [
    { name: "Gir", hindi: "गीर", count: 234, percentage: 18.7, trend: "+12%" },
    { name: "Sahiwal", hindi: "साहीवाल", count: 189, percentage: 15.1, trend: "+8%" },
    { name: "Murrah", hindi: "मुर्रा", count: 167, percentage: 13.4, trend: "+15%" },
    { name: "Red Sindhi", hindi: "लाल सिंधी", count: 143, percentage: 11.5, trend: "+5%" },
    { name: "Nili Ravi", hindi: "नीली रावी", count: 128, percentage: 10.3, trend: "+7%" }
  ],
  regionData: [
    { state: "Gujarat", scans: 298, accuracy: 89.2 },
    { state: "Punjab", scans: 267, accuracy: 85.7 },
    { state: "Haryana", scans: 234, accuracy: 88.1 },
    { state: "Maharashtra", scans: 189, accuracy: 86.4 },
    { state: "Rajasthan", scans: 156, accuracy: 84.3 }
  ],
  weeklyTrends: [
    { day: "Mon", scans: 45, accuracy: 87 },
    { day: "Tue", scans: 52, accuracy: 89 },
    { day: "Wed", scans: 38, accuracy: 85 },
    { day: "Thu", scans: 61, accuracy: 91 },
    { day: "Fri", scans: 57, accuracy: 88 },
    { day: "Sat", scans: 43, accuracy: 86 },
    { day: "Sun", scans: 29, accuracy: 84 }
  ],
  confidenceDistribution: [
    { range: "90-100%", count: 412, color: "bg-success" },
    { range: "80-89%", count: 356, color: "bg-primary" },
    { range: "70-79%", count: 298, color: "bg-warning" },
    { range: "60-69%", count: 181, color: "bg-destructive/70" }
  ]
};

export const AnalyticsDashboard = ({ className }: AnalyticsDashboardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [selectedRegion, setSelectedRegion] = useState("all");

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">विश्लेषण डैशबोर्ड - BreedAI Performance Insights</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="breed-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.totalScans.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-xs text-muted-foreground">कुल स्कैन</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="breed-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-xs text-muted-foreground">सफलता दर</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="breed-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.avgConfidence}%</p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-xs text-muted-foreground">औसत विश्वास</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="breed-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Active FLWs</p>
                <p className="text-xs text-muted-foreground">सक्रिय कर्मी</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breeds" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breeds">Breed Distribution</TabsTrigger>
          <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="breeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Identified Breeds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.topBreeds.map((breed, index) => (
                <div key={breed.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 text-center">
                        #{index + 1}
                      </Badge>
                      <div>
                        <span className="font-medium">{breed.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({breed.hindi})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{breed.count}</span>
                      <Badge variant="secondary" className="ml-2 text-success">
                        {breed.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={breed.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {breed.percentage}% of total identifications
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Regional Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.regionData.map((region) => (
                  <div key={region.state} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{region.state}</h4>
                      <p className="text-sm text-muted-foreground">{region.scans} scans</p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        "text-white",
                        region.accuracy > 88 ? "bg-success" :
                        region.accuracy > 85 ? "bg-primary" : "bg-warning"
                      )}>
                        {region.accuracy}% accuracy
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {analyticsData.weeklyTrends.map((day) => (
                    <div key={day.day} className="text-center">
                      <div className="bg-muted rounded p-3 space-y-2">
                        <p className="text-xs font-medium">{day.day}</p>
                        <p className="text-lg font-bold">{day.scans}</p>
                        <p className="text-xs text-muted-foreground">scans</p>
                        <Badge variant="outline" className="text-xs">
                          {day.accuracy}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Peak activity on Thursday with highest accuracy (91%)</li>
                    <li>• Weekend activity drops but maintains good accuracy</li>
                    <li>• Consistent performance throughout the week</li>
                    <li>• सप्ताह भर में स्थिर प्रदर्शन बना रहा</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Confidence Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {analyticsData.confidenceDistribution.map((range) => (
                  <div key={range.range} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{range.range}</span>
                      <span className="text-muted-foreground">{range.count} scans</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={cn("h-3 rounded-full transition-all", range.color)}
                        style={{ width: `${(range.count / 1247) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((range.count / 1247) * 100).toFixed(1)}% of total scans
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold text-success">768</p>
                  <p className="text-sm text-muted-foreground">High Confidence (80%+)</p>
                  <p className="text-xs text-muted-foreground">उच्च विश्वास स्कोर</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">479</p>
                  <p className="text-sm text-muted-foreground">Needs Review (&lt;80%)</p>
                  <p className="text-xs text-muted-foreground">समीक्षा आवश्यक</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Tips */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance Insights & Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Strengths:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• High accuracy rate across all regions (84%+)</li>
                <li>• Consistent performance in cattle breed identification</li>
                <li>• Strong adoption in Gujarat and Punjab</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Areas for Improvement:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Focus training on buffalo breeds (lower confidence)</li>
                <li>• Improve weekend field worker engagement</li>
                <li>• Expand coverage in southern states</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
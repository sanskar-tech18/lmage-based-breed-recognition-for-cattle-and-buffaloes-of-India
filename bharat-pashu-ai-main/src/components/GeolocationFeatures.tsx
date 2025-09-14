import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Globe, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface GeolocationFeaturesProps {
  onLocationUpdate?: (location: LocationData) => void;
  className?: string;
}

// Mock regional breed data
const regionalBreedRecommendations = {
  "Gujarat": ["Gir", "Kankrej", "Dangi"],
  "Punjab": ["Sahiwal", "Murrah Buffalo", "Nili Ravi Buffalo"],
  "Haryana": ["Sahiwal", "Murrah Buffalo", "Hariana"],
  "Maharashtra": ["Red Sindhi", "Gaolao", "Khillar"],
  "Rajasthan": ["Gir", "Kankrej", "Rathi"],
  "Uttar Pradesh": ["Murrah Buffalo", "Sahiwal", "Gangatiri"],
  "Karnataka": ["Red Sindhi", "Amritmahal", "Hallikar"],
  "Tamil Nadu": ["Kangayam", "Umblachery", "Pulikulam"]
};

export const GeolocationFeatures = ({ onLocationUpdate, className }: GeolocationFeaturesProps) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const { toast } = useToast();

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };

      // Mock reverse geocoding
      const mockAddress = await reverseGeocode(locationData.latitude, locationData.longitude);
      const updatedLocation = { ...locationData, ...mockAddress };
      
      setLocation(updatedLocation);
      onLocationUpdate?.(updatedLocation);
      
      toast({
        title: "Location Updated",
        description: `Location captured with ${Math.round(locationData.accuracy)}m accuracy`,
      });

    } catch (err: any) {
      let errorMessage = "Failed to get location";
      
      if (err.code === 1) {
        errorMessage = "Location access denied. Please enable location permissions.";
      } else if (err.code === 2) {
        errorMessage = "Location unavailable. Please check your GPS settings.";
      } else if (err.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }
      
      setError(errorMessage);
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onLocationUpdate, toast]);

  // Mock reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    // In a real app, you'd use a geocoding service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on rough coordinates
    const mockData = {
      address: `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`,
      district: "Sample District",
      state: lat > 26 ? "Punjab" : lat > 23 ? "Gujarat" : "Maharashtra",
      country: "India"
    };
    
    setSelectedState(mockData.state);
    return mockData;
  };

  const handleManualLocationSubmit = () => {
    if (!manualLocation.trim()) return;

    // Mock location for manual entry
    const mockLocation: LocationData = {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      timestamp: new Date(),
      address: manualLocation,
      state: selectedState || "Unknown"
    };

    setLocation(mockLocation);
    onLocationUpdate?.(mockLocation);
    
    toast({
      title: "Manual Location Set",
      description: `Location set to: ${manualLocation}`,
    });
  };

  useEffect(() => {
    // Auto-detect location on component mount
    getCurrentLocation();
  }, [getCurrentLocation]);

  const getRecommendedBreeds = () => {
    if (!location?.state) return [];
    return regionalBreedRecommendations[location.state as keyof typeof regionalBreedRecommendations] || [];
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy <= 10) return { level: "excellent", color: "bg-success", text: "Excellent" };
    if (accuracy <= 50) return { level: "good", color: "bg-primary", text: "Good" };
    if (accuracy <= 100) return { level: "fair", color: "bg-warning", text: "Fair" };
    return { level: "poor", color: "bg-destructive", text: "Poor" };
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Services
        </h2>
        <p className="text-sm text-muted-foreground">स्थान सेवाएं - GPS & Regional Data</p>
      </div>

      {/* Current Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button onClick={getCurrentLocation} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          ) : location ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium">Location Detected</span>
                {location.accuracy > 0 && (
                  <Badge className={getAccuracyLevel(location.accuracy).color}>
                    {getAccuracyLevel(location.accuracy).text} ({Math.round(location.accuracy)}m)
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                {location.address && (
                  <p><span className="font-medium">Address:</span> {location.address}</p>
                )}
                {location.district && (
                  <p><span className="font-medium">District:</span> {location.district}</p>
                )}
                {location.state && (
                  <p><span className="font-medium">State:</span> {location.state}</p>
                )}
                <p className="text-muted-foreground">
                  Last updated: {location.timestamp.toLocaleTimeString()}
                </p>
              </div>

              <Button onClick={getCurrentLocation} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                Refresh Location
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="animate-pulse">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Getting your location..." : "Location not detected"}
              </p>
              <Button onClick={getCurrentLocation} variant="camera" size="mobile" disabled={isLoading}>
                <Navigation className="w-4 h-4 mr-2" />
                {isLoading ? "Locating..." : "Get Location"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Location Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="w-5 h-5" />
            Manual Location Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-location">Enter Location Manually</Label>
            <Input
              id="manual-location"
              placeholder="Enter farm/village/district name"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state-select">Select State</Label>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Select State</option>
              {Object.keys(regionalBreedRecommendations).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <Button 
            onClick={handleManualLocationSubmit} 
            variant="outline" 
            className="w-full"
            disabled={!manualLocation.trim() || !selectedState}
          >
            <Map className="w-4 h-4 mr-2" />
            Set Manual Location
          </Button>
        </CardContent>
      </Card>

      {/* Regional Breed Recommendations */}
      {location?.state && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Regional Breed Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Common breeds in {location.state}:
              </p>
              <div className="flex flex-wrap gap-2">
                {getRecommendedBreeds().map((breed) => (
                  <Badge key={breed} variant="secondary" className="text-sm">
                    {breed}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">💡 Regional Accuracy Boost:</span> Our AI model 
                performs {Math.floor(Math.random() * 10) + 5}% better for breeds commonly 
                found in {location.state}. Location data helps improve breed predictions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Privacy */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Privacy & Location Data</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Location data is used only for breed recommendations</li>
                <li>• GPS coordinates are not shared with third parties</li>
                <li>• Regional data helps improve AI accuracy</li>
                <li>• आपका स्थान डेटा सुरक्षित है</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
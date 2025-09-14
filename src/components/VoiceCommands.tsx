// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  CheckCircle,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommandsProps {
  onCommand?: (command: string, params?: any) => void;
  className?: string;
}

interface Command {
  id: string;
  english: string;
  hindi: string;
  action: string;
  description: string;
}

const voiceCommands: Command[] = [
  {
    id: "take_photo",
    english: "take photo",
    hindi: "फोटो लें",
    action: "takePhoto",
    description: "Capture a new image"
  },
  {
    id: "confirm_breed",
    english: "confirm breed",
    hindi: "नस्ल की पुष्टि",
    action: "confirmBreed",
    description: "Confirm the identified breed"
  },
  {
    id: "retake_photo",
    english: "retake photo",
    hindi: "दोबारा फोटो लें",
    action: "retakePhoto",
    description: "Capture image again"
  },
  {
    id: "need_correction",
    english: "need correction",
    hindi: "सुधार चाहिए",
    action: "needCorrection",
    description: "Report incorrect identification"
  },
  {
    id: "start_camera",
    english: "start camera",
    hindi: "कैमरा शुरू करें",
    action: "startCamera",
    description: "Activate camera"
  },
  {
    id: "go_back",
    english: "go back",
    hindi: "वापस जाएं",
    action: "goBack",
    description: "Navigate to previous screen"
  },
  {
    id: "help",
    english: "help",
    hindi: "मदद",
    action: "showHelp",
    description: "Show available commands"
  }
];

export const VoiceCommands = ({ onCommand, className }: VoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const { toast } = useToast();

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
  }, []);

  const speak = useCallback((text: string, lang: "en" | "hi" = "en") => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const processCommand = useCallback((transcript: string, confidence: number) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Find matching command
    const matchedCommand = voiceCommands.find(cmd => 
      normalizedTranscript.includes(cmd.english.toLowerCase()) ||
      normalizedTranscript.includes(cmd.hindi)
    );

    if (matchedCommand && confidence > 0.7) {
      setLastCommand(matchedCommand.english);
      setConfidence(confidence);
      
      // Execute command
      onCommand?.(matchedCommand.action);
      
      // Voice feedback
      const feedback = language === "hi" 
        ? `${matchedCommand.hindi} - आदेश मिला`
        : `${matchedCommand.english} - command received`;
      
      speak(feedback, language);
      
      toast({
        title: "Voice Command",
        description: `Executed: ${matchedCommand.description}`,
      });
    } else {
      speak(language === "hi" ? "समझ नहीं आया, कृपया दोहराएं" : "Sorry, I didn't understand that", language);
    }
  }, [onCommand, language, speak, toast]);

  const startListening = useCallback(() => {
    if (!isSpeechSupported || !isEnabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      speak(language === "hi" ? "सुन रहा हूं" : "Listening", language);
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      processCommand(transcript, confidence);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice commands",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
    }
  }, [isSpeechSupported, isEnabled, language, processCommand, speak, toast]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    speak(
      newLang === "hi" ? "हिंदी में बदल दिया गया" : "Switched to English", 
      newLang
    );
  };

  if (!isSpeechSupported) {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Voice Commands Not Supported</h3>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support speech recognition. Please use manual controls.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Commands
            <Badge variant="secondary" className="ml-2">
              {language === "hi" ? "हिंदी" : "English"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="voice-enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
              <Label htmlFor="voice-enabled">Enable Voice Commands</Label>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={toggleLanguage}
                variant="outline"
                size="sm"
                disabled={!isEnabled}
              >
                {language === "hi" ? "EN" : "हि"}
              </Button>
              
              <Button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                variant="outline"
                size="sm"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Listening Button */}
          {isEnabled && (
            <div className="text-center space-y-4">
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "hero"}
                size="mobile-lg"
                className={cn(
                  "w-full relative",
                  isListening && "animate-pulse"
                )}
                disabled={!isEnabled}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Listening
                    {language === "hi" && <span className="block text-xs">सुनना बंद करें</span>}
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Voice Command
                    {language === "hi" && <span className="block text-xs">आवाज़ कमांड शुरू करें</span>}
                  </>
                )}
              </Button>

              {isListening && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              )}

              {lastCommand && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Last Command: {lastCommand}</span>
                    <Badge variant="outline">{Math.round(confidence * 100)}%</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="w-4 h-4" />
            Available Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {voiceCommands.map((command) => (
              <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    "{command.english}" / "{command.hindi}"
                  </p>
                  <p className="text-xs text-muted-foreground">{command.description}</p>
                </div>
                <Button
                  onClick={() => speak(language === "hi" ? command.hindi : command.english, language)}
                  variant="ghost"
                  size="sm"
                  disabled={!voiceEnabled}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Voice Command Tips</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Use commands in English or Hindi</li>
                <li>• Wait for the beep before speaking</li>
                <li>• Commands work best in quiet environments</li>
                <li>• स्पष्ट और सामान्य गति से बोलें</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, Eye, EyeOff, CheckCircle, XCircle, Info } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApiKeyModal({ open, onOpenChange, onSuccess }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [validationSuccess, setValidationSuccess] = useState(false);
  
  const { saveApiKey, validateApiKey } = useApiKey();

  useEffect(() => {
    if (!open) {
      setApiKey("");
      setValidationError("");
      setValidationSuccess(false);
      setShowKey(false);
    }
  }, [open]);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      setValidationError("Please enter your OpenAI API key");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      setValidationError("OpenAI API keys should start with 'sk-'");
      return;
    }

    setIsValidating(true);
    setValidationError("");
    setValidationSuccess(false);

    try {
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        saveApiKey(apiKey);
        setValidationSuccess(true);
        
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 1500);
      } else {
        setValidationError("Invalid API key. Please check your key and try again.");
      }
    } catch (error) {
      setValidationError("Failed to validate API key. Please check your internet connection and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating) {
      handleValidateAndSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-ai-primary" />
            OpenAI API Key Required
          </DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to start generating images with DALL-E
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
                disabled={isValidating}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
                disabled={isValidating}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {validationSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>API key validated successfully!</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-1">
                <p><strong>How to get your API key:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></li>
                  <li>Sign in to your OpenAI account</li>
                  <li>Click "Create new secret key"</li>
                  <li>Copy and paste the key here</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  Your API key is stored securely in your browser and never sent to our servers.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isValidating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleValidateAndSave}
              disabled={isValidating || !apiKey.trim()}
              className="flex-1"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Save & Validate"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
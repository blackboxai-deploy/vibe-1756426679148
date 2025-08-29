"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles, History, Download, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useApiKeyStore } from "@/lib/stores/api-key-store";
import { useGenerationStore } from "@/lib/stores/generation-store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { hasValidKey, clearApiKey } = useApiKeyStore();
  const { generationHistory } = useGenerationStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(generationHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-image-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-ai-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-ai-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent">
                AI Image Generator
              </h1>
              <p className="text-xs text-muted-foreground">Powered by OpenAI DALL-E</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Generation History Count */}
          {generationHistory.length > 0 && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{generationHistory.length}</span>
            </div>
          )}

          {/* Export History */}
          {generationHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportHistory}
              className="hidden sm:flex"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:ml-2 sm:inline">Settings</span>
          </Button>

          {/* API Key Status */}
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${hasValidKey ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {hasValidKey ? 'API Connected' : 'API Key Required'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Modal would be rendered here */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">API Key Status</label>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-sm ${hasValidKey ? 'text-green-600' : 'text-red-600'}`}>
                    {hasValidKey ? 'Connected' : 'Not Connected'}
                  </span>
                  {hasValidKey && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        clearApiKey();
                        setShowSettings(false);
                      }}
                    >
                      Clear Key
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Generation History</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">
                    {generationHistory.length} images generated
                  </span>
                  {generationHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportHistory}
                    >
                      Export
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Theme</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground capitalize">
                    {theme || 'system'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
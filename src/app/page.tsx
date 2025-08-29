'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useApiKey } from '@/hooks/use-api-key';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { apiKey, isValidated, showKeyModal, setShowKeyModal, validateKey, updateKey } = useApiKey();
  const { toast } = useToast();

  useEffect(() => {
    if (!apiKey || !isValidated) {
      setShowKeyModal(true);
    }
  }, [apiKey, isValidated, setShowKeyModal]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey || !isValidated) {
      setShowKeyModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          size: selectedSize,
          apiKey
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);

      toast({
        title: "Success!",
        description: "Image generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating the image.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeySubmit = async (key: string) => {
    const isValid = await validateKey(key);
    if (isValid) {
      updateKey(key);
      setShowKeyModal(false);
      toast({
        title: "API Key Validated",
        description: "Your OpenAI API key has been successfully validated and saved.",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please check your OpenAI API key and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-4">
            AI Image Generator
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Create stunning images with OpenAI's DALL-E
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Controls */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Generate Image</CardTitle>
              <CardDescription className="text-gray-300">
                Describe the image you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-white">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="A beautiful sunset over a mountain lake with reflections..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                      <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">1024×1024</SelectItem>
                      <SelectItem value="1024x1792">1024×1792</SelectItem>
                      <SelectItem value="1792x1024">1792×1024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Image Display */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `ai-generated-${Date.now()}.png`;
                      link.click();
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Download Image
                  </Button>
                </div>
              ) : (
                <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Your generated image will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Key Modal */}
      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">OpenAI API Key Required</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your OpenAI API key to start generating images.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-white">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                className="bg-white/10 border-white/20 text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    handleKeySubmit(target.value);
                  }
                }}
              />
            </div>
            <Button
              onClick={() => {
                const input = document.getElementById('apiKey') as HTMLInputElement;
                if (input?.value) {
                  handleKeySubmit(input.value);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Validate & Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
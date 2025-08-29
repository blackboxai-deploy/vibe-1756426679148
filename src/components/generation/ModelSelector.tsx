"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, Clock, DollarSign } from "lucide-react";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  maxSize: string;
  quality: string[];
  style: string[];
  costPer1024: number;
  speed: "fast" | "medium" | "slow";
  recommended?: boolean;
}

const models: ModelOption[] = [
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "Latest model with highest quality and best prompt adherence",
    maxSize: "1792x1024",
    quality: ["standard", "hd"],
    style: ["vivid", "natural"],
    costPer1024: 0.04,
    speed: "slow",
    recommended: true,
  },
  {
    id: "dall-e-2",
    name: "DALL-E 2",
    description: "Faster generation with good quality, more economical option",
    maxSize: "1024x1024",
    quality: ["standard"],
    style: ["natural"],
    costPer1024: 0.02,
    speed: "fast",
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onParametersChange: (params: {
    quality: string;
    style: string;
    size: string;
  }) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  onParametersChange,
}: ModelSelectorProps) {
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [selectedStyle, setSelectedStyle] = useState("vivid");
  const [selectedSize, setSelectedSize] = useState("1024x1024");

  const currentModel = models.find((m) => m.id === selectedModel);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    const model = models.find((m) => m.id === modelId);
    if (model) {
      const defaultQuality = model.quality[0];
      const defaultStyle = model.style[0];
      setSelectedQuality(defaultQuality);
      setSelectedStyle(defaultStyle);
      onParametersChange({
        quality: defaultQuality,
        style: defaultStyle,
        size: selectedSize,
      });
    }
  };

  const handleParameterChange = (type: string, value: string) => {
    if (type === "quality") setSelectedQuality(value);
    if (type === "style") setSelectedStyle(value);
    if (type === "size") setSelectedSize(value);

    onParametersChange({
      quality: type === "quality" ? value : selectedQuality,
      style: type === "style" ? value : selectedStyle,
      size: type === "size" ? value : selectedSize,
    });
  };

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="w-4 h-4 text-green-500" />;
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "slow":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSizeOptions = (modelId: string) => {
    if (modelId === "dall-e-3") {
      return ["1024x1024", "1024x1792", "1792x1024"];
    }
    return ["256x256", "512x512", "1024x1024"];
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-ai-primary" />
          AI Model Selection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedModel === model.id
                  ? "ring-2 ring-ai-primary border-ai-primary"
                  : "hover:border-ai-secondary"
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {model.name}
                    {model.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </CardTitle>
                  {getSpeedIcon(model.speed)}
                </div>
                <CardDescription className="text-sm">
                  {model.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Size:</span>
                    <span className="font-medium">{model.maxSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cost (1024px):</span>
                    <span className="font-medium flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {model.costPer1024.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quality Options:</span>
                    <span className="font-medium">{model.quality.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Parameter Controls */}
      {currentModel && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Generation Parameters</h4>
          
          {/* Size Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Image Size</label>
            <div className="flex flex-wrap gap-2">
              {getSizeOptions(selectedModel).map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleParameterChange("size", size)}
                  className="text-xs"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          {currentModel.quality.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <div className="flex gap-2">
                {currentModel.quality.map((quality) => (
                  <Button
                    key={quality}
                    variant={selectedQuality === quality ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleParameterChange("quality", quality)}
                    className="capitalize"
                  >
                    {quality}
                    {quality === "hd" && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        +$0.02
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Style Selection */}
          {currentModel.style.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Style</label>
              <div className="flex gap-2">
                {currentModel.style.map((style) => (
                  <Button
                    key={style}
                    variant={selectedStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleParameterChange("style", style)}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Cost Estimation */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Cost:</span>
                <span className="text-lg font-bold text-ai-primary flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {(
                    currentModel.costPer1024 *
                    (selectedQuality === "hd" ? 2 : 1)
                  ).toFixed(3)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per image generation
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
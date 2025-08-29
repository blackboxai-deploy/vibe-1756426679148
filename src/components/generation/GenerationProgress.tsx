"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Image, Zap, Clock, DollarSign } from "lucide-react";

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  stage: string;
  estimatedCost: number;
  estimatedTime: number;
  model: string;
  onCancel?: () => void;
}

export function GenerationProgress({
  isGenerating,
  progress,
  stage,
  estimatedCost,
  estimatedTime,
  model,
  onCancel
}: GenerationProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'initializing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'processing':
        return <Zap className="h-4 w-4 animate-pulse text-yellow-500" />;
      case 'generating':
        return <Image className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'finalizing':
        return <Loader2 className="h-4 w-4 animate-spin text-green-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (!isGenerating) return null;

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-ai-primary/20 bg-gradient-to-br from-background to-ai-primary/5">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStageIcon(stage)}
            <h3 className="font-semibold text-lg">Generating Image</h3>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="capitalize text-muted-foreground">{stage}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
          />
        </div>

        {/* Stage Description */}
        <div className="text-sm text-muted-foreground text-center">
          {stage === 'initializing' && 'Preparing your request...'}
          {stage === 'processing' && 'Processing your prompt...'}
          {stage === 'generating' && 'Creating your image with AI...'}
          {stage === 'finalizing' && 'Almost done! Finalizing image...'}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="text-muted-foreground">Time</div>
              <div className="font-medium">{formatTime(elapsedTime)}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="text-muted-foreground">Cost</div>
              <div className="font-medium">${estimatedCost.toFixed(3)}</div>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded-lg p-2">
          Using {model.toUpperCase()} • Est. {estimatedTime}s
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-ai-primary animate-pulse`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
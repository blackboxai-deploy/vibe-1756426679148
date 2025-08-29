"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Heart, Share2, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: "dall-e-2" | "dall-e-3";
  size: string;
  quality?: "standard" | "hd";
  style?: "natural" | "vivid";
  createdAt: string;
  cost: number;
  isFavorite?: boolean;
}

interface ImageCardProps {
  image: GeneratedImage;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ImageCard({ image, onToggleFavorite, onDelete }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Download started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "AI Generated Image",
          text: `Check out this AI-generated image: "${image.prompt}"`,
          url: image.url,
        });
      } else {
        await navigator.clipboard.writeText(image.url);
        toast({
          title: "Link copied",
          description: "Image URL copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share the image.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.prompt);
      toast({
        title: "Prompt copied",
        description: "Prompt copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy prompt.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModelBadgeColor = (model: string) => {
    return model === "dall-e-3" ? "bg-purple-500" : "bg-blue-500";
  };

  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {!imageError ? (
            <Image
              src={image.url}
              alt={image.prompt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <div className="relative aspect-square w-full">
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 80vw"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View full size</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={handleDownload}
                      disabled={isLoading}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => onToggleFavorite(image.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          image.isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{image.isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Model badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`text-xs ${getModelBadgeColor(image.model)} text-white`}>
              {image.model.toUpperCase()}
            </Badge>
          </div>

          {/* Favorite indicator */}
          {image.isFavorite && (
            <div className="absolute top-2 right-2">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </div>
          )}
        </div>

        {/* Image details */}
        <div className="p-4 space-y-3">
          {/* Prompt */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {image.prompt}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleCopyPrompt}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy prompt
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>{image.size}</span>
              {image.quality && (
                <>
                  <span>•</span>
                  <span className="capitalize">{image.quality}</span>
                </>
              )}
              {image.style && (
                <>
                  <span>•</span>
                  <span className="capitalize">{image.style}</span>
                </>
              )}
            </div>
            <span>${image.cost.toFixed(3)}</span>
          </div>

          {/* Date and actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDate(image.createdAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(image.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
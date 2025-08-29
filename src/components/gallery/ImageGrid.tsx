"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Download, Heart, Trash2, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { GeneratedImage } from '@/types/generation';

interface ImageGridProps {
  images: GeneratedImage[];
  onDelete?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onView?: (image: GeneratedImage) => void;
}

export function ImageGrid({ images, onDelete, onFavorite, onView }: ImageGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt Copied",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModelBadgeColor = (model: string) => {
    switch (model) {
      case 'dall-e-3':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'dall-e-2':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Eye className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Images Generated Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Start creating amazing AI-generated images by entering a prompt and clicking generate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <Card
          key={image.id}
          className="group overflow-hidden border-2 hover:border-ai-primary/50 transition-all duration-300"
          onMouseEnter={() => setHoveredId(image.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <CardContent className="p-0">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={image.url}
                alt={image.prompt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              
              {/* Overlay with actions */}
              <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-300 ${
                hoveredId === image.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onView?.(image)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(image)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onFavorite?.(image.id)}
                  className={`border-white/30 ${
                    image.isFavorite 
                      ? 'bg-red-500/80 hover:bg-red-500/90 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDelete(image.id)}
                    className="bg-red-500/80 hover:bg-red-500/90 text-white border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Model badge */}
              <div className="absolute top-2 left-2">
                <Badge className={`text-xs ${getModelBadgeColor(image.model)}`}>
                  {image.model.toUpperCase()}
                </Badge>
              </div>

              {/* Favorite indicator */}
              {image.isFavorite && (
                <div className="absolute top-2 right-2">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </div>
              )}
            </div>

            {/* Image info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(image.timestamp)}</span>
                <span>{image.size}</span>
              </div>

              <p className="text-sm line-clamp-2 leading-relaxed">
                {image.prompt}
              </p>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyPrompt(image.prompt)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Prompt
                </Button>
                
                {image.cost && (
                  <span className="text-xs text-muted-foreground">
                    ${image.cost.toFixed(3)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
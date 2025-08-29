"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Copy, RotateCcw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptBuilderProps {
  value: string;
  onChange: (value: string) => void;
  onEnhance?: (prompt: string) => Promise<string>;
  isEnhancing?: boolean;
}

const STYLE_PRESETS = [
  { name: 'Photorealistic', prompt: 'photorealistic, high quality, detailed, professional photography' },
  { name: 'Digital Art', prompt: 'digital art, concept art, trending on artstation, highly detailed' },
  { name: 'Oil Painting', prompt: 'oil painting, classical art style, brush strokes, artistic' },
  { name: 'Watercolor', prompt: 'watercolor painting, soft colors, artistic, flowing' },
  { name: 'Anime/Manga', prompt: 'anime style, manga art, japanese animation style' },
  { name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic, sci-fi' },
  { name: 'Fantasy', prompt: 'fantasy art, magical, mystical, enchanted' },
  { name: 'Minimalist', prompt: 'minimalist, clean, simple, modern design' },
  { name: 'Vintage', prompt: 'vintage style, retro, classic, nostalgic' },
  { name: 'Abstract', prompt: 'abstract art, geometric, modern, artistic interpretation' }
];

const QUALITY_MODIFIERS = [
  'high quality', 'detailed', '4k', '8k', 'ultra detailed', 'masterpiece',
  'professional', 'sharp focus', 'highly detailed', 'award winning'
];

const LIGHTING_OPTIONS = [
  'natural lighting', 'studio lighting', 'golden hour', 'dramatic lighting',
  'soft lighting', 'cinematic lighting', 'volumetric lighting', 'ambient lighting'
];

const CAMERA_ANGLES = [
  'close-up', 'wide shot', 'portrait', 'landscape', 'aerial view',
  'low angle', 'high angle', 'macro photography', 'panoramic'
];

const PROMPT_TEMPLATES = [
  {
    category: 'Portrait',
    templates: [
      'A professional headshot of a person, studio lighting, high quality',
      'Portrait of a character, detailed facial features, dramatic lighting',
      'Close-up portrait, expressive eyes, soft lighting, photorealistic'
    ]
  },
  {
    category: 'Landscape',
    templates: [
      'Beautiful landscape with mountains and lake, golden hour lighting',
      'Serene forest scene, misty morning, natural lighting',
      'Desert landscape at sunset, dramatic sky, wide shot'
    ]
  },
  {
    category: 'Architecture',
    templates: [
      'Modern building architecture, clean lines, professional photography',
      'Historic cathedral interior, dramatic lighting, detailed stonework',
      'Futuristic cityscape, neon lights, cyberpunk style'
    ]
  },
  {
    category: 'Abstract',
    templates: [
      'Abstract geometric composition, vibrant colors, modern art',
      'Flowing liquid forms, colorful, artistic interpretation',
      'Minimalist abstract design, clean shapes, contemporary'
    ]
  }
];

export default function PromptBuilder({ value, onChange, onEnhance, isEnhancing }: PromptBuilderProps) {
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleAddToPrompt = useCallback((addition: string) => {
    const currentPrompt = value.trim();
    const newPrompt = currentPrompt 
      ? `${currentPrompt}, ${addition}`
      : addition;
    onChange(newPrompt);
  }, [value, onChange]);

  const handleStyleSelect = useCallback((style: typeof STYLE_PRESETS[0]) => {
    setSelectedStyle(style.name);
    handleAddToPrompt(style.prompt);
  }, [handleAddToPrompt]);

  const handleTemplateSelect = useCallback((template: string) => {
    onChange(template);
    setActiveTab('builder');
  }, [onChange]);

  const handleClearPrompt = useCallback(() => {
    onChange('');
    setSelectedStyle(null);
  }, [onChange]);

  const handleCopyPrompt = useCallback(async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
    }
  }, [value]);

  const handleEnhancePrompt = useCallback(async () => {
    if (onEnhance && value.trim()) {
      try {
        const enhanced = await onEnhance(value);
        onChange(enhanced);
      } catch (error) {
        console.error('Failed to enhance prompt:', error);
      }
    }
  }, [onEnhance, value, onChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Prompt Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4">
            {/* Main Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Prompt</label>
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-[100px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrompt}
                  disabled={!value}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearPrompt}
                  disabled={!value}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Style Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Art Styles</label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((style) => (
                  <Badge
                    key={style.name}
                    variant={selectedStyle === style.name ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleStyleSelect(style)}
                  >
                    {style.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quality Modifiers */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality & Detail</label>
              <div className="flex flex-wrap gap-2">
                {QUALITY_MODIFIERS.map((modifier) => (
                  <Badge
                    key={modifier}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleAddToPrompt(modifier)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {modifier}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Lighting Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lighting</label>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_OPTIONS.map((lighting) => (
                  <Badge
                    key={lighting}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleAddToPrompt(lighting)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {lighting}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Camera Angles */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Composition</label>
              <div className="flex flex-wrap gap-2">
                {CAMERA_ANGLES.map((angle) => (
                  <Badge
                    key={angle}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleAddToPrompt(angle)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {angle}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {PROMPT_TEMPLATES.map((category) => (
              <div key={category.category} className="space-y-2">
                <h3 className="font-medium text-sm">{category.category}</h3>
                <div className="space-y-2">
                  {category.templates.map((template, index) => (
                    <Card
                      key={index}
                      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <p className="text-sm">{template}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="enhance" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">AI Prompt Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  Use GPT-4 to enhance your prompt for better image generation results
                </p>
              </div>
              
              <Button
                onClick={handleEnhancePrompt}
                disabled={!value.trim() || isEnhancing || !onEnhance}
                className="w-full"
              >
                {isEnhancing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhance Prompt
                  </>
                )}
              </Button>

              {!onEnhance && (
                <p className="text-xs text-muted-foreground text-center">
                  Prompt enhancement requires an OpenAI API key
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
export interface GenerationRequest {
  prompt: string;
  model: 'dall-e-2' | 'dall-e-3';
  size: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface GenerationResponse {
  id: string;
  created: number;
  data: GeneratedImage[];
}

export interface GeneratedImage {
  url: string;
  revised_prompt?: string;
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  model: string;
  size: string;
  quality?: string;
  style?: string;
  imageUrl: string;
  timestamp: number;
  cost: number;
}

export interface GenerationSettings {
  defaultModel: 'dall-e-2' | 'dall-e-3';
  defaultSize: string;
  defaultQuality: 'standard' | 'hd';
  defaultStyle: 'vivid' | 'natural';
  autoEnhancePrompts: boolean;
  saveHistory: boolean;
}

export interface CostCalculation {
  model: string;
  size: string;
  quality?: string;
  quantity: number;
  costPerImage: number;
  totalCost: number;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  category: 'photorealistic' | 'artistic' | 'abstract' | 'anime' | 'vintage' | 'modern';
  thumbnail: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  popularity: number;
}

export interface GenerationError {
  code: string;
  message: string;
  type: 'api_error' | 'validation_error' | 'rate_limit' | 'insufficient_quota';
}

export interface BatchGenerationRequest {
  prompts: string[];
  model: 'dall-e-2' | 'dall-e-3';
  size: string;
  quality?: string;
  style?: string;
}

export interface UsageStats {
  totalGenerations: number;
  totalCost: number;
  generationsToday: number;
  costToday: number;
  favoriteModel: string;
  averageCostPerImage: number;
}
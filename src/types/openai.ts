export interface OpenAIConfig {
  apiKey: string;
  model: 'dall-e-2' | 'dall-e-3';
  baseURL?: string;
}

export interface GenerationRequest {
  prompt: string;
  model: 'dall-e-2' | 'dall-e-3';
  size: ImageSize;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
  response_format?: 'url' | 'b64_json';
}

export interface GenerationResponse {
  created: number;
  data: GeneratedImage[];
}

export interface GeneratedImage {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageSize {
  width: number;
  height: number;
  label: string;
  value: string;
}

export interface ModelInfo {
  id: 'dall-e-2' | 'dall-e-3';
  name: string;
  description: string;
  maxResolution: string;
  supportedSizes: ImageSize[];
  costPerImage: number;
  features: string[];
  qualityOptions?: ('standard' | 'hd')[];
  styleOptions?: ('vivid' | 'natural')[];
}

export interface GenerationSettings {
  model: 'dall-e-2' | 'dall-e-3';
  size: ImageSize;
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
  numberOfImages: number;
  enhancePrompt: boolean;
}

export interface CostEstimate {
  model: string;
  imagesCount: number;
  costPerImage: number;
  totalCost: number;
  currency: string;
}

export interface APIKeyValidation {
  isValid: boolean;
  error?: string;
  organization?: string;
  hasImageGeneration?: boolean;
}

export interface GenerationError {
  code: string;
  message: string;
  type: 'invalid_request_error' | 'rate_limit_error' | 'api_error' | 'authentication_error';
  param?: string;
}

export interface UsageStats {
  totalGenerations: number;
  totalCost: number;
  generationsToday: number;
  costToday: number;
  lastGeneration?: Date;
  favoriteModel: string;
}

export const DALL_E_2_SIZES: ImageSize[] = [
  { width: 256, height: 256, label: '256×256', value: '256x256' },
  { width: 512, height: 512, label: '512×512', value: '512x512' },
  { width: 1024, height: 1024, label: '1024×1024', value: '1024x1024' }
];

export const DALL_E_3_SIZES: ImageSize[] = [
  { width: 1024, height: 1024, label: '1024×1024 (Square)', value: '1024x1024' },
  { width: 1024, height: 1792, label: '1024×1792 (Portrait)', value: '1024x1792' },
  { width: 1792, height: 1024, label: '1792×1024 (Landscape)', value: '1792x1024' }
];

export const MODEL_INFO: Record<string, ModelInfo> = {
  'dall-e-2': {
    id: 'dall-e-2',
    name: 'DALL-E 2',
    description: 'Fast and economical image generation',
    maxResolution: '1024×1024',
    supportedSizes: DALL_E_2_SIZES,
    costPerImage: 0.020,
    features: ['Multiple sizes', 'Fast generation', 'Cost effective']
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    description: 'Highest quality image generation with enhanced prompt understanding',
    maxResolution: '1792×1024',
    supportedSizes: DALL_E_3_SIZES,
    costPerImage: 0.040,
    features: ['HD quality', 'Enhanced prompts', 'Style control', 'Better understanding'],
    qualityOptions: ['standard', 'hd'],
    styleOptions: ['vivid', 'natural']
  }
};

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  model: 'dall-e-3',
  size: DALL_E_3_SIZES[0],
  quality: 'standard',
  style: 'vivid',
  numberOfImages: 1,
  enhancePrompt: true
};
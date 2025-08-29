import OpenAI from 'openai';
import { ApiKeyManager } from './api-key-manager';

export interface GenerationParams {
  prompt: string;
  model: 'dall-e-2' | 'dall-e-3';
  size: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface GenerationResult {
  url: string;
  revised_prompt?: string;
}

export interface GenerationResponse {
  images: GenerationResult[];
  cost: number;
  model: string;
  timestamp: number;
}

export class OpenAIClient {
  private client: OpenAI | null = null;

  private initializeClient(): OpenAI {
    const apiKey = ApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please configure your API key.');
    }

    if (!this.client) {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }

    return this.client;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });

      await testClient.models.list();
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  async generateImage(params: GenerationParams): Promise<GenerationResponse> {
    const client = this.initializeClient();

    try {
      const requestParams: any = {
        model: params.model,
        prompt: params.prompt,
        size: params.size,
        n: params.n || 1,
      };

      if (params.model === 'dall-e-3') {
        if (params.quality) requestParams.quality = params.quality;
        if (params.style) requestParams.style = params.style;
        requestParams.n = 1; // DALL-E 3 only supports n=1
      }

      const response = await client.images.generate(requestParams);

      const images: GenerationResult[] = response.data.map(image => ({
        url: image.url!,
        revised_prompt: image.revised_prompt
      }));

      const cost = this.calculateCost(params);

      return {
        images,
        cost,
        model: params.model,
        timestamp: Date.now()
      };
    } catch (error: any) {
      if (error?.error?.code === 'invalid_api_key') {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (error?.error?.code === 'insufficient_quota') {
        throw new Error('Insufficient quota. Please check your OpenAI account billing.');
      } else if (error?.error?.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error?.error?.message) {
        throw new Error(`OpenAI API Error: ${error.error.message}`);
      } else {
        throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  private calculateCost(params: GenerationParams): number {
    const pricing = {
      'dall-e-2': {
        '256x256': 0.016,
        '512x512': 0.018,
        '1024x1024': 0.020
      },
      'dall-e-3': {
        '1024x1024': {
          standard: 0.040,
          hd: 0.080
        },
        '1024x1792': {
          standard: 0.080,
          hd: 0.120
        },
        '1792x1024': {
          standard: 0.080,
          hd: 0.120
        }
      }
    };

    const n = params.n || 1;

    if (params.model === 'dall-e-2') {
      const size = params.size as keyof typeof pricing['dall-e-2'];
      return (pricing['dall-e-2'][size] || 0.020) * n;
    } else {
      const size = params.size as keyof typeof pricing['dall-e-3'];
      const quality = params.quality || 'standard';
      const sizeConfig = pricing['dall-e-3'][size] as any;
      
      if (typeof sizeConfig === 'object') {
        return sizeConfig[quality] * n;
      }
      return 0.040 * n; // fallback
    }
  }

  async enhancePrompt(prompt: string): Promise<string> {
    const client = this.initializeClient();

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating detailed, artistic prompts for AI image generation. 
            Enhance the user's prompt to be more descriptive and likely to produce high-quality, visually appealing images.
            Keep the core concept but add artistic details, lighting, composition, and style elements.
            Return only the enhanced prompt, no explanations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content?.trim() || prompt;
    } catch (error) {
      console.warn('Prompt enhancement failed, using original prompt:', error);
      return prompt;
    }
  }

  resetClient(): void {
    this.client = null;
  }
}

export const openaiClient = new OpenAIClient();
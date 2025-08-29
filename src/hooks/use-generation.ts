import { useState, useCallback } from 'react';
import { useApiKey } from './use-api-key';
import { generateImage, enhancePrompt } from '@/lib/openai-client';
import { calculateCost } from '@/lib/cost-calculator';
import { saveToHistory } from '@/lib/storage';
import type { GenerationParams, GeneratedImage, GenerationStatus } from '@/types/generation';

export function useGeneration() {
  const { apiKey } = useApiKey();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const generate = useCallback(async (params: GenerationParams) => {
    if (!apiKey) {
      setError('OpenAI API key is required');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatus('preparing');
    setError(null);

    try {
      // Step 1: Enhance prompt if requested
      let finalPrompt = params.prompt;
      if (params.enhancePrompt) {
        setStatus('enhancing-prompt');
        setProgress(20);
        finalPrompt = await enhancePrompt(params.prompt, apiKey);
      }

      // Step 2: Calculate cost
      const estimatedCost = calculateCost(params.model, params.size, params.quantity);
      
      // Step 3: Generate images
      setStatus('generating');
      setProgress(40);

      const results: GeneratedImage[] = [];
      
      for (let i = 0; i < params.quantity; i++) {
        setProgress(40 + (i / params.quantity) * 50);
        
        const response = await generateImage({
          ...params,
          prompt: finalPrompt,
          n: 1 // Generate one at a time for better progress tracking
        }, apiKey);

        if (response.data && response.data.length > 0) {
          const imageData = response.data[0];
          const generatedImage: GeneratedImage = {
            id: `img_${Date.now()}_${i}`,
            url: imageData.url!,
            prompt: finalPrompt,
            originalPrompt: params.prompt,
            model: params.model,
            size: params.size,
            quality: params.quality,
            style: params.style,
            revisedPrompt: imageData.revised_prompt,
            createdAt: new Date().toISOString(),
            cost: estimatedCost / params.quantity
          };

          results.push(generatedImage);
          
          // Save to history immediately
          await saveToHistory(generatedImage);
        }
      }

      setProgress(100);
      setStatus('complete');
      setGeneratedImages(results);

      return results;

    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate image');
      setStatus('error');
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setStatus('idle');
      }, 2000);
    }
  }, [apiKey]);

  const generateBatch = useCallback(async (prompts: string[], params: Omit<GenerationParams, 'prompt' | 'quantity'>) => {
    if (!apiKey) {
      setError('OpenAI API key is required');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatus('preparing');
    setError(null);

    try {
      const results: GeneratedImage[] = [];
      const totalPrompts = prompts.length;

      for (let i = 0; i < totalPrompts; i++) {
        const prompt = prompts[i];
        setProgress((i / totalPrompts) * 100);
        setStatus('generating');

        const batchResults = await generate({
          ...params,
          prompt,
          quantity: 1
        });

        if (batchResults) {
          results.push(...batchResults);
        }
      }

      setGeneratedImages(results);
      return results;

    } catch (err: any) {
      console.error('Batch generation error:', err);
      setError(err.message || 'Failed to generate batch');
      setStatus('error');
    }
  }, [apiKey, generate]);

  const enhancePromptOnly = useCallback(async (prompt: string) => {
    if (!apiKey) {
      setError('OpenAI API key is required');
      return prompt;
    }

    try {
      return await enhancePrompt(prompt, apiKey);
    } catch (err: any) {
      console.error('Prompt enhancement error:', err);
      setError(err.message || 'Failed to enhance prompt');
      return prompt;
    }
  }, [apiKey]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setGeneratedImages([]);
  }, []);

  return {
    // State
    isGenerating,
    progress,
    status,
    error,
    generatedImages,
    
    // Actions
    generate,
    generateBatch,
    enhancePromptOnly,
    clearError,
    clearResults
  };
}
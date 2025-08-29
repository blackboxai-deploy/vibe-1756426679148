import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      model = 'dall-e-3', 
      size = '1024x1024', 
      quality = 'standard', 
      style = 'vivid',
      n = 1,
      apiKey 
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const validSizes = {
      'dall-e-2': ['256x256', '512x512', '1024x1024'],
      'dall-e-3': ['1024x1024', '1024x1792', '1792x1024']
    };

    if (!validSizes[model as keyof typeof validSizes]?.includes(size)) {
      return NextResponse.json(
        { error: `Invalid size ${size} for model ${model}` },
        { status: 400 }
      );
    }

    const requestParams: any = {
      model,
      prompt,
      size,
      n: Math.min(n, model === 'dall-e-3' ? 1 : 10),
    };

    if (model === 'dall-e-3') {
      requestParams.quality = quality;
      requestParams.style = style;
    }

    const response = await openai.images.generate(requestParams);

    const cost = calculateCost(model, size, quality, n);

    return NextResponse.json({
      success: true,
      images: response.data,
      cost: cost,
      model: model,
      prompt: prompt,
      revised_prompt: response.data[0]?.revised_prompt || prompt
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Insufficient OpenAI quota' },
        { status: 402 }
      );
    }

    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.code === 'content_policy_violation') {
      return NextResponse.json(
        { error: 'Content policy violation. Please modify your prompt.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

function calculateCost(model: string, size: string, quality: string, n: number): number {
  const pricing = {
    'dall-e-2': {
      '256x256': 0.016,
      '512x512': 0.018,
      '1024x1024': 0.020
    },
    'dall-e-3': {
      '1024x1024': {
        'standard': 0.040,
        'hd': 0.080
      },
      '1024x1792': {
        'standard': 0.080,
        'hd': 0.120
      },
      '1792x1024': {
        'standard': 0.080,
        'hd': 0.120
      }
    }
  };

  if (model === 'dall-e-2') {
    return (pricing['dall-e-2'][size as keyof typeof pricing['dall-e-2']] || 0.020) * n;
  }

  if (model === 'dall-e-3') {
    const sizePrice = pricing['dall-e-3'][size as keyof typeof pricing['dall-e-3']];
    if (typeof sizePrice === 'object') {
      return (sizePrice[quality as keyof typeof sizePrice] || 0.040) * n;
    }
  }

  return 0.040 * n;
}
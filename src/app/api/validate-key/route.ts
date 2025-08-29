import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid API key format. OpenAI API keys start with "sk-"' },
        { status: 400 }
      );
    }

    // Test the API key with a minimal request
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      // Make a simple request to validate the key
      await openai.models.list();
      
      return NextResponse.json(
        { 
          valid: true, 
          message: 'API key is valid' 
        },
        { status: 200 }
      );
    } catch (openaiError: any) {
      if (openaiError.status === 401) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Invalid API key. Please check your OpenAI API key.' 
          },
          { status: 401 }
        );
      } else if (openaiError.status === 429) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Rate limit exceeded. Please try again later.' 
          },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Failed to validate API key. Please try again.' 
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
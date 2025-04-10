import { NextResponse } from 'next/server';
import { JigsawStack } from 'jigsawstack';

// Create a timeout promise to prevent hanging requests
const timeoutPromise = (ms: number) => 
  new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );

export async function GET(request: Request) {
  try {
    // Extract query parameter from the URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'What is the capital of France?';
    
    const jigsawstack = JigsawStack({
      apiKey: process.env.JIGSAW_API_KEY || '',
    });

    // Race the API call against a timeout
    const result = await Promise.race([
      jigsawstack.web.search({
        query
      }),
      timeoutPromise(30000) // 30 second timeout
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Perplexity API route:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (errorMessage.includes('timed out')) {
        statusCode = 504; // Gateway Timeout
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        statusCode = 404;
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid key')) {
        statusCode = 401;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 
import { NextResponse } from 'next/server';
import { generateCustomTopic } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic prompt is required' },
        { status: 400 }
      );
    }

    const generated = await generateCustomTopic(topic.trim());
    return NextResponse.json(generated);
  } catch (error: unknown) {
    console.error('API Error in /api/generate-topic:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

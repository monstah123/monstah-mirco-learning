import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenarioTitle, scenarioDescription, messages } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing in server environment' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const conversationHistory = (messages || [])
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Character'}: ${m.content}`)
      .join('\n');

    const prompt = `You are an AI Roleplay Coach & Partner for "Monstah Micro Learning".
Scenario: "${scenarioTitle || 'Social Conversation'}" (${scenarioDescription || 'Real-world interaction'}).

Task:
1. Play the role of the other person in this scenario naturally and realistically (1-2 sentences max).
2. Evaluate the user's latest message for charisma, confidence, status, and warmth.
3. Assign a Charisma Score (1-100).
4. Provide a 1-sentence constructive feedback tip.

Conversation so far:
${conversationHistory}

Return ONLY valid JSON matching this exact structure:
{
  "reply": "In-character realistic reply to the user (1-2 sentences)",
  "charismaScore": 85,
  "feedbackTip": "Short 1-sentence feedback on their tone, confidence, or phrasing."
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI Roleplay Generation Failed';
    console.error('AI Roleplay Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

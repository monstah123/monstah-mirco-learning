import { NextResponse } from 'next/server';

const apiKey = process.env.ELEVENLABS_API_KEY || '';

export const GEMINI_STUDIO_VOICE_MAP: Record<string, { voiceId: string; name: string }> = {
  kore: { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Kore (Female, Warm)' },
  puck: { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Puck (Male, Crisp)' },
  charon: { voiceId: 'pNInz6obpgDQGcFmaJgB', name: 'Charon (Male, Deep)' },
  fenrir: { voiceId: 'VR6AewLTigWG4xSOukaG', name: 'Fenrir (Male, Raspy)' },
  zephyr: { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Zephyr (Female, Gentle)' },
};

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ fallback: true, error: 'ElevenLabs API key not set' });
    }

    const config = GEMINI_STUDIO_VOICE_MAP[voiceId] || GEMINI_STUDIO_VOICE_MAP['kore'];

    // Call ElevenLabs API for ultra-realistic studio AI speech
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('ElevenLabs API error:', errText);
      return NextResponse.json({ fallback: true, error: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      audioContent: `data:audio/mp3;base64,${base64Audio}`,
      voiceName: config.name,
    });
  } catch (err: unknown) {
    console.error('TTS synthesis error:', err);
    return NextResponse.json({ fallback: true, error: 'Failed to synthesize speech' });
  }
}

import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';

export const VOICES = [
  { id: 'en-US-Journey-F', name: 'Studio Female (Journey)', gender: 'FEMALE' },
  { id: 'en-US-Journey-O', name: 'Studio Male (Journey)', gender: 'MALE' },
  { id: 'en-US-Neural2-F', name: 'Neural Female (Ava)', gender: 'FEMALE' },
  { id: 'en-US-Neural2-D', name: 'Neural Male (Andrew)', gender: 'MALE' },
  { id: 'en-US-Wavenet-F', name: 'Warm Female (Wavenet)', gender: 'FEMALE' },
  { id: 'en-US-Wavenet-D', name: 'Deep Male (Wavenet)', gender: 'MALE' },
];

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const selectedVoice = VOICES.find(v => v.id === voiceId) || VOICES[0];

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: selectedVoice.id,
          ssmlGender: selectedVoice.gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.audioContent) {
      console.warn('Google TTS API returned fallback:', data);
      return NextResponse.json({
        fallback: true,
        error: data.error?.message || 'TTS API unavailable',
      });
    }

    // Return base64 MP3 audio string
    return NextResponse.json({
      audioContent: data.audioContent,
      voiceName: selectedVoice.name,
    });
  } catch (err: unknown) {
    console.error('TTS generation error:', err);
    return NextResponse.json({ fallback: true, error: 'Failed to synthesize speech' });
  }
}

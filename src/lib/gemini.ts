// ============================================
// Monstah Micro Learning — Gemini AI Service
// Optimized for Ultra-Short, Punchy SmartyMe-Style Cards!
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lesson, Quiz, Topic } from './types';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface GeneratedContent {
  topic: Topic;
  lesson: Lesson;
  quiz: Quiz;
}

export async function generateCustomTopic(userQuery: string): Promise<GeneratedContent> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are the master content creator for "Monstah Micro Learning", a exact carbon copy of SmartyMe app.
SmartyMe cards are ULTRA-CONCISE, HIGH-MOTIVATION micro-lessons modeled directly after SmartyMe app.
Each lesson features vivid real-world scenarios, exact word-for-word script examples (showing weak vs. winning phrasing), and actionable rules of thumb.

The user wants a micro-lesson about: "${userQuery}".

Generate JSON matching this EXACT structure:

{
  "topic": {
    "id": "ai-slug-id",
    "name": "Short Topic Title (max 3-4 words)",
    "icon": "Single relevant emoji",
    "color": "#HEX_COLOR (e.g. #10B981, #E67E22, #3498DB, #8E44AD, #EF4444, or #F59E0B)",
    "description": "Short 1-sentence topic description (max 10 words)",
    "lessonCount": 1
  },
  "lesson": {
    "id": "ai-lesson-slug",
    "topicId": "ai-slug-id",
    "title": "Short Catchy Lesson Title",
    "subtitle": "Short 3-5 word subtitle",
    "duration": 3,
    "difficulty": "beginner",
    "order": 1,
    "cards": [
      {
        "id": "card-1",
        "type": "scenario",
        "contextHeader": "📋 Scenario Setup",
        "title": "Real-World Context",
        "content": "Short 2-sentence vivid situation setup (e.g. 'Late Thursday. You are preparing to discuss a promotion with your lead...').",
        "emoji": "🎬"
      },
      {
        "id": "card-2",
        "type": "script",
        "contextHeader": "💬 What to Say",
        "title": "Winning Script vs Weak Phrasing",
        "content": "Compare phrasing to handle this situation effectively.",
        "examples": [
          { "label": "Weak Phrasing", "text": "A timid or frustrated response that fails.", "status": "bad" },
          { "label": "Winning Script", "text": "A clear, confident, high-impact exact sentence to say.", "status": "best" }
        ],
        "emoji": "🗣️"
      },
      {
        "id": "card-3",
        "type": "explanation",
        "contextHeader": "💡 Strategy Breakdown",
        "title": "Why It Works",
        "content": "Strictly 1-2 short sentences explaining the psychology behind the winning approach. Maximum 25 words!",
        "emoji": "🧠",
        "highlight": "Exact 2-4 word key phrase to highlight"
      },
      {
        "id": "card-4",
        "type": "keyPoint",
        "contextHeader": "🔑 Golden Rule",
        "title": "Key Takeaway",
        "content": "Strictly 1 short memorable rule of thumb sentence. Maximum 15 words!",
        "emoji": "🔑"
      }
    ]
  },
  "quiz": {
    "id": "ai-quiz-slug",
    "lessonId": "ai-lesson-slug",
    "topicId": "ai-slug-id",
    "questions": [
      {
        "id": "q-1",
        "type": "multiple_choice",
        "question": "Short clear question about the lesson?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Short 1-sentence explanation."
      },
      {
        "id": "q-2",
        "type": "true_false",
        "question": "Short True or False question?",
        "options": ["True", "False"],
        "correctIndex": 0,
        "explanation": "Short 1-sentence explanation."
      },
      {
        "id": "q-3",
        "type": "multiple_choice",
        "question": "Short practical application question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 1,
        "explanation": "Short 1-sentence explanation."
      }
    ]
  }
}

STRICT RULE: Keep all text ultra-short, crisp, and bite-sized like SmartyMe app! Return ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    const data: GeneratedContent = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error('Failed to parse Gemini response:', responseText, error);
    throw new Error('Failed to generate structured content from Gemini');
  }
}

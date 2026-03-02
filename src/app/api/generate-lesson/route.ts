import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert educator and researcher. You will receive the full text of an academic research paper and a student's background level. Your job is to generate a complete, structured interactive lesson that teaches the key ideas of this paper at the appropriate depth.

You must respond with ONLY a valid JSON object (no markdown, no backticks, no preamble). The JSON must match this schema:

{
  "paperTitle": "string",
  "authors": "string",
  "tldr": "string — a 1-2 sentence plain-English summary",
  "sections": [
    {
      "id": "section-1",
      "title": "string — section heading",
      "content": "string — explanation in Markdown with LaTeX ($...$ inline, $$...$$ block)",
      "keyTakeaway": "string — one sentence summary"
    }
  ],
  "conceptMap": {
    "nodes": [
      {
        "id": "node-1",
        "label": "string — concept name",
        "description": "string — 1-2 sentence explanation",
        "isPrerequisite": true,
        "difficulty": 1
      }
    ],
    "edges": [
      {
        "source": "node-1",
        "target": "node-2",
        "label": "string — relationship like requires, extends, etc."
      }
    ]
  },
  "interactiveElements": [
    {
      "id": "interactive-1",
      "afterSection": "section-1",
      "type": "slider",
      "title": "string",
      "description": "string",
      "config": {}
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "string (Markdown/LaTeX ok)",
      "type": "conceptual",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "string",
      "paperReference": "section-1"
    }
  ],
  "relatedPapers": [
    {
      "title": "string",
      "reason": "string",
      "arxivId": "string or unknown"
    }
  ]
}

INTERACTIVE ELEMENT CONFIG FORMATS:

For type "slider", config must be:
{"parameter": "string", "min": 0, "max": 100, "default": 50, "step": 1, "unit": "string", "effectDescription": "string", "dataPoints": [{"value": 0, "output": "string"}, {"value": 50, "output": "string"}, {"value": 100, "output": "string"}]}

For type "comparison", config must be:
{"leftLabel": "string", "rightLabel": "string", "leftContent": "string (markdown)", "rightContent": "string (markdown)"}

For type "animation", config must be:
{"steps": [{"label": "string", "description": "string"}]}

GENERATION GUIDELINES:
- Generate 5-7 sections that progressively build understanding.
- Generate 8-12 concept map nodes and 10-15 edges.
- Generate 2 interactive elements (at least one slider type).
- Generate 5 quiz questions mixing conceptual, application, and what-if types. Quiz type must be one of: "conceptual", "application", "whatif".
- Generate 3-4 related papers.
- For "beginner" level: lots of analogies, define all terms, avoid jargon, simplify math.
- For "undergrad" level: assume basic field knowledge, explain advanced concepts, some math.
- For "grad" level: assume technical literacy, focus on methodology and novelty, full math.
- For "expert" level: skip basics, focus on contributions vs prior work, limitations, detailed math.
- Make content ENGAGING — use "you" language, rhetorical questions, vivid analogies.
- Keep section content concise but informative (2-4 paragraphs each).
- CRITICAL: Return ONLY valid JSON. No markdown fences, no text before or after the JSON object.`;

function tryParseJSON(text: string) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from response
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { paperText, level } = await request.json();

    if (!paperText || !level) {
      return NextResponse.json(
        { error: 'Paper text and level are required' },
        { status: 400 }
      );
    }

    const validLevels = ['beginner', 'undergrad', 'grad', 'expert'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be one of: beginner, undergrad, grad, expert' },
        { status: 400 }
      );
    }

    // Truncate paper text to avoid exceeding context
    const truncatedText = paperText.slice(0, 40000);
    const userMessage = `Here is the paper text:\n\n${truncatedText}\n\nThe student's background level is: ${level}`;

    console.log('Calling OpenRouter API (Nemotron a3b)...');
    const response = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      max_tokens: 16000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json(
        { error: 'Unexpected response format from AI' },
        { status: 500 }
      );
    }

    console.log('Response received, finish_reason:', response.choices[0]?.finish_reason);
    console.log('Response length:', text.length);

    // If the response was truncated (hit max_tokens), the JSON will be incomplete
    if (response.choices[0]?.finish_reason === 'length') {
      console.warn('Response was truncated (hit max_tokens). Retrying with shorter prompt...');

      const shorterText = paperText.slice(0, 20000);
      const shorterMessage = `Here is the paper text (abbreviated):\n\n${shorterText}\n\nThe student's background level is: ${level}\n\nIMPORTANT: Keep your response concise. Use shorter section content (2-3 paragraphs each). Generate exactly 5 sections, 8 concept map nodes, 2 interactive elements, 4 quiz questions, and 3 related papers.`;

      const retryResponse = await client.chat.completions.create({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        max_tokens: 16000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: shorterMessage },
        ],
      });

      const retryText = retryResponse.choices[0]?.message?.content;
      if (retryText) {
        console.log('Retry finish_reason:', retryResponse.choices[0]?.finish_reason);
        const lesson = tryParseJSON(retryText);
        if (lesson) {
          return NextResponse.json(lesson);
        }
      }

      return NextResponse.json(
        { error: 'The AI response was too long to complete. Please try again.' },
        { status: 500 }
      );
    }

    let lesson = tryParseJSON(text);

    if (!lesson) {
      console.warn('JSON parse failed. First 200 chars:', text.slice(0, 200));
      console.warn('Last 200 chars:', text.slice(-200));

      // Retry once
      console.warn('Retrying...');
      const retryResponse = await client.chat.completions.create({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        max_tokens: 16000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + '\n\nREMINDER: Return ONLY the raw JSON object. No markdown code fences. No text before or after.' },
          { role: 'user', content: userMessage },
        ],
      });

      const retryText = retryResponse.choices[0]?.message?.content;
      if (retryText) {
        lesson = tryParseJSON(retryText);
      }
    }

    if (!lesson) {
      return NextResponse.json(
        { error: 'Failed to generate valid lesson data. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Lesson generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate lesson: ${message}` },
      { status: 500 }
    );
  }
}

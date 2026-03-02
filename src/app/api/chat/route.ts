import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, paperText, history } = await request.json();

    if (!message || !paperText) {
      return NextResponse.json(
        { error: 'Message and paper text are required' },
        { status: 400 }
      );
    }

    const truncatedPaper = paperText.slice(0, 30000);

    const systemPrompt = `You are a helpful research assistant. The user is reading an academic paper and has questions about it. Answer clearly and concisely, referencing specific parts of the paper when relevant. Use markdown formatting for structure.

IMPORTANT — Math formatting rules:
- For inline math use single dollar signs: $x^2 + y^2$
- For block/display math use double dollar signs on their own lines:

$$
E = mc^2
$$

- NEVER use \\[ ... \\] or \\( ... \\) delimiters. ALWAYS use $ and $$ delimiters.

Here is the full paper text:

${truncatedPaper}`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await getClient().chat.completions.create({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      max_tokens: 2000,
      messages,
    });

    let reply = response.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Fix LaTeX delimiters: \[ ... \] → $$ ... $$ and \( ... \) → $ ... $
    reply = reply
      .replace(/\\\[/g, '$$')
      .replace(/\\\]/g, '$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Chat failed: ${message}` },
      { status: 500 }
    );
  }
}

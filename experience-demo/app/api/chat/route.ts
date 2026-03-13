import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const model = process.env.LLM_MODEL || 'gpt-4o';

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (body.systemPrompt) {
      messages.push({ role: 'system', content: body.systemPrompt });
    }

    for (const msg of body.messages) {
      messages.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      });
    }

    const start = performance.now();
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    const latencyMs = performance.now() - start;

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content, latencyMs: Math.round(latencyMs * 100) / 100 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

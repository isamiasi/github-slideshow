import { generateDraft } from './generator.ts';
import { buildSystemPrompt } from './prompt-policy.ts';
import type { GenerationInput, GenerationOutput } from './types.ts';

function pickJson(text: string): GenerationOutput | null {
  try {
    const parsed = JSON.parse(text) as GenerationOutput;
    if (parsed.title && parsed.poem && parsed.sunoPrompt && parsed.imagePrompt && parsed.shortsScript && parsed.youtubeTitle) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export async function generateWithOpenAI(input: GenerationInput): Promise<GenerationOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return generateDraft(input);

  const payload = {
    model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
    input: [
      { role: 'system', content: [{ type: 'text', text: buildSystemPrompt() }] },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Return only JSON with keys: title, poem, sunoPrompt, imagePrompt, shortsScript, youtubeTitle. ' +
              JSON.stringify(input)
          }
        ]
      }
    ],
    text: { format: { type: 'json_object' } }
  };

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return generateDraft(input);
  const data = (await res.json()) as { output_text?: string };
  const parsed = pickJson(data.output_text ?? '');
  return parsed ?? generateDraft(input);
}

import type { GenerationInput, GenerationOutput } from './types.ts';

const MAX_LEN = {
  emotion: 32,
  protagonist: 120,
  theme: 120,
  time: 60,
  place: 120,
  situation: 500
} as const;

export function validateGenerationInput(body: Partial<GenerationInput>) {
  const required: (keyof GenerationInput)[] = ['emotion', 'protagonist', 'theme', 'time', 'place', 'situation'];
  for (const key of required) {
    const value = body[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return { ok: false, error: `Missing or invalid field: ${key}` };
    }
    if (value.length > MAX_LEN[key]) {
      return { ok: false, error: `Field too long: ${key}` };
    }
  }
  return { ok: true as const };
}

export function validateGenerationOutput(output: GenerationOutput) {
  const required: (keyof GenerationOutput)[] = ['title', 'poem', 'sunoPrompt', 'imagePrompt', 'shortsScript', 'youtubeTitle'];
  for (const key of required) {
    if (!output[key] || output[key].trim().length === 0) {
      return { ok: false, error: `Invalid output field: ${key}` };
    }
  }
  return { ok: true as const };
}

export const REQUIRED_STYLE = [
  'Vietnamese emotional atmosphere',
  'cinematic',
  'restrained emotion',
  'ambient',
  'soft piano',
  'industrial ambience'
] as const;

export const BANNED_STYLE = ['hyperpop', 'EDM', 'aggressive beat', 'viral slang'] as const;

export function buildSystemPrompt() {
  return [
    'You are an emotional storytelling generator for short-form music-video ideation.',
    'Focus on Vietnamese migrant-worker-in-Japan context.',
    'Output must be subtle, poetic, cinematic, visually descriptive, and emotionally restrained.',
    'Do not over-explain feelings or repeat explicit emotion words.',
    `Must include style anchors: ${REQUIRED_STYLE.join(', ')}.`,
    `Must avoid: ${BANNED_STYLE.join(', ')}.`
  ].join(' ');
}

export function validateOutput(text: string) {
  const lower = text.toLowerCase();
  const bannedHit = BANNED_STYLE.find((w) => {
    const token = w.toLowerCase();
    if (!lower.includes(token)) return false;
    // allow when explicitly negated (e.g., 'avoid EDM')
    return !lower.includes(`avoid ${token}`) && !lower.includes(`no ${token}`) && !lower.includes(`without ${token}`);
  });
  return { ok: !bannedHit, reason: bannedHit ? `banned style token detected: ${bannedHit}` : null };
}


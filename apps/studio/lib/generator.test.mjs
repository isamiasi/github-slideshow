import assert from 'node:assert/strict';
import { generateDraft } from './generator.ts';

const out = generateDraft({
  emotion: '孤独',
  protagonist: 'ベトナム人技能実習生',
  theme: '夜の改札',
  time: '深夜2時',
  place: '埼玉',
  situation: '工場帰りに立ち止まる'
});

assert.ok(out.title.includes('夜の改札'));
assert.ok(out.sunoPrompt.includes('Vietnamese emotional atmosphere'));
assert.ok(out.imagePrompt.includes('Japanese night scenery'));
assert.ok(out.youtubeTitle.length > 0);

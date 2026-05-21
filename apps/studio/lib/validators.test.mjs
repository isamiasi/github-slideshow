import assert from 'node:assert/strict';
import { validateGenerationInput, validateGenerationOutput } from './validators.ts';

const validInput = {
  emotion: '孤独', protagonist: 'ベトナム人技能実習生', theme: '夜の改札',
  time: '深夜2時', place: '埼玉', situation: '工場帰りに立ち止まる'
};

assert.equal(validateGenerationInput(validInput).ok, true);
assert.equal(validateGenerationInput({ ...validInput, emotion: '' }).ok, false);
assert.equal(validateGenerationInput({ ...validInput, situation: 'a'.repeat(501) }).ok, false);

const validOutput = { title: 'タイトル', poem: 'a\nb\nc', sunoPrompt: 'x', imagePrompt: 'y', shortsScript: 'z', youtubeTitle: 't' };
assert.equal(validateGenerationOutput(validOutput).ok, true);
assert.equal(validateGenerationOutput({ ...validOutput, poem: '' }).ok, false);

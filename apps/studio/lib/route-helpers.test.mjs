import assert from 'node:assert/strict';
import { handleCreateWork, handleDeleteWorkById, handleGenerate, handleGetWorkById, handleListWorksPaginated, handleUpdateWorkById } from './route-helpers.ts';

const goodInput = { emotion: '孤独', protagonist: 'A', theme: 'B', time: 'C', place: 'D', situation: 'E' };
assert.equal((await handleGenerate({ ...goodInput, emotion: '' })).status, 400);
const generated = await handleGenerate(goodInput);
assert.ok([200, 422].includes(generated.status));
assert.equal((await handleCreateWork({ title: 'x' })).status, 400);
assert.equal((await handleUpdateWorkById('x', { title: '' })).status, 400);

const base = {
  id: 'work-test-1', createdAt: new Date().toISOString(), emotion: '孤独', protagonist: 'ベトナム人技能実習生',
  theme: '夜の改札', time: '深夜2時', place: '埼玉', situation: '工場帰り', title: '夜の改札', poem: 'a\nb\nc',
  sunoPrompt: 'Vietnamese emotional atmosphere, cinematic, restrained emotion, ambient, soft piano, industrial ambience. avoid edm, avoid hyperpop, avoid aggressive beat.',
  imagePrompt: 'Japanese night scenery', shortsScript: '0-3s ...', youtubeTitle: 'title'
};
assert.equal((await handleCreateWork(base)).status, 201);
assert.equal((await handleGetWorkById(base.id)).status, 200);
const before = await handleGetWorkById(base.id);
const updated = await handleUpdateWorkById(base.id, { title: '更新タイトル', emotion: '郷愁', poem: 'x\ny\nz' });
assert.equal(updated.status, 200);
assert.equal(updated.json.item.title, '更新タイトル');
assert.equal(updated.json.item.createdAt, before.json.item.createdAt);
assert.ok(updated.json.item.updatedAt);
assert.equal((await handleDeleteWorkById(base.id)).status, 200);
assert.equal((await handleGetWorkById(base.id)).status, 404);


const base2 = {
  id: 'work-test-2', createdAt: new Date().toISOString(), emotion: '希望', protagonist: 'B',
  theme: '朝の歩道', time: '朝6時', place: '川口', situation: '工場前を歩く', title: '朝の歩道', poem: 'd\ne\nf',
  sunoPrompt: 'Vietnamese emotional atmosphere, cinematic, restrained emotion, ambient, soft piano, industrial ambience. avoid edm, avoid hyperpop, avoid aggressive beat.',
  imagePrompt: 'Japanese night scenery', shortsScript: '0-3s ...', youtubeTitle: 'title2'
};
await handleCreateWork(base2);

const pagedAll = await handleListWorksPaginated({ limit: 1, offset: 0 });
assert.equal(pagedAll.status, 200);
assert.equal(pagedAll.json.limit, 1);
assert.ok(pagedAll.json.total >= 1);

const pagedEmotion = await handleListWorksPaginated({ limit: 10, offset: 0, emotion: '希望' });
assert.equal(pagedEmotion.status, 200);
assert.ok(pagedEmotion.json.items.every((x) => x.emotion === '希望'));

const pagedQuery = await handleListWorksPaginated({ limit: 10, offset: 0, query: '朝の歩道' });
assert.equal(pagedQuery.status, 200);
assert.ok(pagedQuery.json.items.some((x) => x.title.includes('朝の歩道') || x.theme.includes('朝の歩道')));

await handleDeleteWorkById(base2.id);


// pagination bounds
const bounded = await handleListWorksPaginated({ limit: 9999, offset: -5 });
assert.equal(bounded.status, 200);
assert.equal(bounded.json.limit, 100);
assert.equal(bounded.json.offset, 0);


// query clamp sanity (empty/whitespace query should behave like no query)
const noQuery = await handleListWorksPaginated({ limit: 5, offset: 0, query: '   ' });
assert.equal(noQuery.status, 200);
assert.ok(Array.isArray(noQuery.json.items));

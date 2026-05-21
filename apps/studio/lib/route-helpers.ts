import type { GenerationInput, WorkRecord } from './types.ts';
import { validateGenerationInput, validateGenerationOutput } from './validators.ts';
import { generateWithOpenAI } from './openai-generator.ts';
import { buildSystemPrompt, validateOutput } from './prompt-policy.ts';
import { listWorkRecords, saveWorkRecord, deleteWorkRecord, updateWorkRecord } from './work-repository.ts';

export async function handleGenerate(body: Partial<GenerationInput>) {
  const check = validateGenerationInput(body);
  if (!check.ok) return { status: 400, json: { error: check.error } };

  const output = await generateWithOpenAI(body as GenerationInput);
  const outCheck = validateGenerationOutput(output);
  if (!outCheck.ok) return { status: 422, json: { error: outCheck.error } };

  const policy = validateOutput(JSON.stringify(output));
  if (!policy.ok) return { status: 422, json: { error: policy.reason } };

  return { status: 200, json: { systemPrompt: buildSystemPrompt(), output } };
}

export async function handleListWorks() {
  const items = await listWorkRecords(20);
  return { status: 200, json: { items } };
}

export async function handleCreateWork(body: Partial<WorkRecord>) {
  if (!body.id || !body.title || !body.createdAt || !body.emotion || !body.poem) {
    return { status: 400, json: { error: 'id, title, createdAt, emotion, poem are required' } };
  }
  const item = await saveWorkRecord(body as WorkRecord);
  return { status: 201, json: { item } };
}

export async function handleGetWorkById(id: string) {
  const items = await listWorkRecords(200);
  const item = items.find((w) => w.id === id);
  if (!item) return { status: 404, json: { error: 'Not found' } };
  return { status: 200, json: { item } };
}

export async function handleDeleteWorkById(id: string) {
  const ok = await deleteWorkRecord(id);
  if (!ok) return { status: 404, json: { error: 'Not found' } };
  return { status: 200, json: { ok: true } };
}


export async function handleUpdateWorkById(id: string, body: Partial<WorkRecord>) {
  if (!body.title || !body.emotion || !body.poem) {
    return { status: 400, json: { error: 'title, emotion, poem are required' } };
  }
  const existing = await handleGetWorkById(id);
  if (existing.status !== 200) return existing;
  const prev = (existing.json as { item: WorkRecord }).item;
  const merged = { ...prev, ...body, id, createdAt: prev.createdAt, updatedAt: new Date().toISOString() } as WorkRecord;
  const item = await updateWorkRecord(merged);
  return { status: 200, json: { item } };
}


export async function handleListWorksPaginated(params: {
  limit?: number;
  offset?: number;
  emotion?: string;
  query?: string;
}) {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const offset = Math.max(params.offset ?? 0, 0);
  const emotion = (params.emotion ?? '').trim();
  const query = (params.query ?? '').trim().toLowerCase();

  let items = await listWorkRecords(500);
  if (emotion) items = items.filter((w) => w.emotion === emotion);
  if (query) {
    items = items.filter((w) =>
      [w.title, w.theme, w.place, w.situation, w.poem, w.youtubeTitle].join(' ').toLowerCase().includes(query)
    );
  }

  const total = items.length;
  const paged = items.slice(offset, offset + limit);
  return { status: 200, json: { items: paged, total, limit, offset } };
}

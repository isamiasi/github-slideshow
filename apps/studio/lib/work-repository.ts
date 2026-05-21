import { deleteWork as deleteMemoryWork, listWorks as listMemoryWorks, saveWork as saveMemoryWork, updateWork as updateMemoryWork } from './work-store.ts';
import type { WorkRecord } from './types.ts';

type SupabaseInsertResponse = { data?: unknown; error?: { message: string } | null };
type SupabaseSelectResponse<T> = { data?: T[] | null; error?: { message: string } | null };

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

function toScene(work: WorkRecord) {
  return JSON.stringify({
    protagonist: work.protagonist,
    theme: work.theme,
    time: work.time,
    place: work.place,
    situation: work.situation
  });
}

function fromRow(row: { id: string; title: string; emotion: string; scene: string; poem: string; suno_prompt: string; image_prompt: string; shorts_script: string; youtube_title: string; created_at: string; updated_at?: string; }): WorkRecord {
  let parsed = { protagonist: '', theme: '', time: '', place: '', situation: '' };
  try {
    parsed = { ...parsed, ...(JSON.parse(row.scene ?? '{}') as Partial<typeof parsed>) };
  } catch {
    const [time = '', place = '', ...rest] = (row.scene ?? '').split(' / ');
    parsed = { protagonist: '', theme: '', time, place, situation: rest.join(' / ') };
  }
  return {
    id: row.id,
    title: row.title,
    emotion: row.emotion,
    time: parsed.time,
    place: parsed.place,
    situation: parsed.situation,
    protagonist: parsed.protagonist,
    theme: parsed.theme,
    poem: row.poem,
    sunoPrompt: row.suno_prompt,
    imagePrompt: row.image_prompt,
    shortsScript: row.shorts_script,
    youtubeTitle: row.youtube_title,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at
  };
}

async function supabaseInsert(work: WorkRecord): Promise<WorkRecord> {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/work`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY as string}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      id: work.id,
      title: work.title,
      emotion: work.emotion,
      scene: toScene(work),
      poem: work.poem,
      suno_prompt: work.sunoPrompt,
      image_prompt: work.imagePrompt,
      shorts_script: work.shortsScript,
      youtube_title: work.youtubeTitle,
      created_at: work.createdAt,
      updated_at: work.updatedAt ?? work.createdAt
    })
  });
  const payload = (await res.json()) as SupabaseInsertResponse;
  if (!res.ok || payload.error) throw new Error(payload.error?.message ?? 'Supabase insert failed');
  return work;
}

async function supabaseUpdate(work: WorkRecord): Promise<WorkRecord> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/work?id=eq.${encodeURIComponent(work.id)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY as string}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: work.title,
      emotion: work.emotion,
      scene: toScene(work),
      poem: work.poem,
      suno_prompt: work.sunoPrompt,
      image_prompt: work.imagePrompt,
      shorts_script: work.shortsScript,
      youtube_title: work.youtubeTitle,
      updated_at: new Date().toISOString()
    })
  });
  if (!res.ok) throw new Error('Supabase update failed');
  return work;
}

async function supabaseList(limit = 20): Promise<WorkRecord[]> {
  const select = 'id,title,emotion,scene,poem,suno_prompt,image_prompt,shorts_script,youtube_title,created_at,updated_at';
  const url = `${process.env.SUPABASE_URL}/rest/v1/work?select=${encodeURIComponent(select)}&order=created_at.desc&limit=${limit}`;
  const res = await fetch(url, { headers: { apikey: process.env.SUPABASE_ANON_KEY as string, Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY as string}` } });
  const payload = (await res.json()) as SupabaseSelectResponse<{ id: string; title: string; emotion: string; scene: string; poem: string; suno_prompt: string; image_prompt: string; shorts_script: string; youtube_title: string; created_at: string; updated_at?: string; }>;
  if (!res.ok || payload.error || !payload.data) throw new Error(payload.error?.message ?? 'Supabase list failed');
  return payload.data.map(fromRow);
}

async function supabaseDelete(id: string): Promise<boolean> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/work?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { apikey: process.env.SUPABASE_ANON_KEY as string, Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY as string}` } });
  return res.ok;
}

export async function saveWorkRecord(work: WorkRecord): Promise<WorkRecord> {
  if (!hasSupabaseEnv()) return saveMemoryWork(work);
  try { return await supabaseInsert(work); } catch { return saveMemoryWork(work); }
}

export async function updateWorkRecord(work: WorkRecord): Promise<WorkRecord> {
  if (!hasSupabaseEnv()) return updateMemoryWork(work.id, work) ?? saveMemoryWork(work);
  try { return await supabaseUpdate(work); } catch { return updateMemoryWork(work.id, work) ?? saveMemoryWork(work); }
}

export async function listWorkRecords(limit = 20): Promise<WorkRecord[]> {
  if (!hasSupabaseEnv()) return listMemoryWorks(limit);
  try { return await supabaseList(limit); } catch { return listMemoryWorks(limit); }
}

export async function deleteWorkRecord(id: string): Promise<boolean> {
  if (!hasSupabaseEnv()) return deleteMemoryWork(id);
  try { const ok = await supabaseDelete(id); return ok || deleteMemoryWork(id); } catch { return deleteMemoryWork(id); }
}

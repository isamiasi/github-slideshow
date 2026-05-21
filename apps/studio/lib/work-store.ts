import type { GenerationInput, GenerationOutput } from './types';

export type WorkRecord = GenerationInput & GenerationOutput & {
  id: string;
  createdAt: string;
};

const memory = new Map<string, WorkRecord>();

export function saveWork(work: WorkRecord) {
  memory.set(work.id, work);
  return work;
}

export function listWorks(limit = 20) {
  return [...memory.values()]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export function deleteWork(id: string) {
  return memory.delete(id);
}

export function updateWork(id: string, patch: Partial<WorkRecord>) {
  const prev = memory.get(id);
  if (!prev) return null;
  const next = { ...prev, ...patch, id };
  memory.set(id, next);
  return next;
}

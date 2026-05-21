'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { WorkRecord } from '@/lib/types';

export function HistoryPanel({ onSelect, onDeleted, refreshKey }: { onSelect: (workId: string) => void; onDeleted?: (id: string) => void; refreshKey: number }) {
  const [items, setItems] = useState<WorkRecord[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>('');
  const [lastSource, setLastSource] = useState<'cache' | 'network' | '-'>('-');
  const [showDebugMeta, setShowDebugMeta] = useState(false);
  const requestSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Record<string, { items: WorkRecord[]; total: number }>>({});
  const cacheOrderRef = useRef<string[]>([]);

  function invalidateCacheAll() {
    cacheRef.current = {};
    cacheOrderRef.current = [];
  }
  const [sortKey, setSortKey] = useState<'updated_desc' | 'created_desc' | 'emotion_asc'>('updated_desc');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  async function load() {
    const seq = ++requestSeqRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (emotionFilter !== 'all') q.set('emotion', emotionFilter);
    if (debouncedQuery.trim()) q.set('query', debouncedQuery.trim());
    const key = q.toString();
    const cached = cacheRef.current[key];
    if (cached) {
      setItems(cached.items);
      setTotal(cached.total);
      setLastLoadedAt(new Date().toISOString());
      setLastSource('cache');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/works?${key}`, { signal: controller.signal });
      const data = await res.json();
      if (seq !== requestSeqRef.current) return;
      if (res.ok) {
        const next = { items: data.items ?? [], total: data.total ?? 0 };
        cacheRef.current[key] = next;
        cacheOrderRef.current = cacheOrderRef.current.filter((k) => k !== key);
        cacheOrderRef.current.push(key);
        const MAX_CACHE = 30;
        if (cacheOrderRef.current.length > MAX_CACHE) {
          const evict = cacheOrderRef.current.shift();
          if (evict) delete cacheRef.current[evict];
        }
        setItems(next.items);
        setTotal(next.total);
        setLastLoadedAt(new Date().toISOString());
        setLastSource('network');
      } else {
        setError(data.error ?? '履歴の取得に失敗しました');
      setErrorCount((v) => v + 1);
      }
      setLoading(false);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      if (seq !== requestSeqRef.current) return;
      setError('履歴の取得に失敗しました');
      setErrorCount((v) => v + 1);
      setLoading(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/works/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((w) => w.id !== id));
      invalidateCacheAll();
      onDeleted?.(id);
      setError('');
      setErrorCount(0);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? '削除に失敗しました');
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [refreshKey, offset, emotionFilter, debouncedQuery]);

  useEffect(() => {
    if (refreshKey > 0) {
      invalidateCacheAll();
      setOffset(0);
    }
  }, [refreshKey]);

  const emotions = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.emotion)))], [items]);
  useEffect(() => {
    setOffset(0);
  }, [emotionFilter, debouncedQuery, sortKey]);

  const cacheStats = useMemo(() => ({
    keys: Object.keys(cacheRef.current).length,
    order: cacheOrderRef.current.length
  }), [items, total, loading]);

  const filterSummary = useMemo(() => {
    const parts = [];
    if (emotionFilter !== 'all') parts.push(`感情:${emotionFilter}`);
    if (debouncedQuery.trim()) parts.push(`検索:${debouncedQuery.trim()}`);
    parts.push(`並び:${sortKey}`);
    return parts.join(' / ');
  }, [emotionFilter, debouncedQuery, sortKey]);

  const filtered = useMemo(
    () =>
      items
      .filter((w) => {
        const hitEmotion = emotionFilter === 'all' || w.emotion === emotionFilter;
        const q = query.trim().toLowerCase();
        const hitQuery = q.length === 0 || [w.title, w.theme, w.place, w.situation, w.poem].join(' ').toLowerCase().includes(q);
        return hitEmotion && hitQuery;
      })
      .sort((a, b) => {
        if (sortKey === 'emotion_asc') return a.emotion.localeCompare(b.emotion, 'ja');
        if (sortKey === 'created_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date((b.updatedAt ?? b.createdAt)).getTime() - new Date((a.updatedAt ?? a.createdAt)).getTime();
      }),
    [items, query, emotionFilter, sortKey]
  );

  return (
    <div className="mt-4 rounded-xl border border-line bg-panel p-4 text-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-medium">保存履歴</h3>
        <div className="flex gap-2">
          <button className="rounded bg-slate-800 px-2 py-1 text-xs" onClick={load}>再読込</button>
          <button className="rounded bg-slate-900 px-2 py-1 text-xs" onClick={() => { invalidateCacheAll(); load(); }}>キャッシュクリア</button>
        </div>
        <button className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" onClick={() => { setQuery(''); setDebouncedQuery(''); setEmotionFilter('all'); setSortKey('updated_desc'); setOffset(0); setError(''); invalidateCacheAll(); }}>条件クリア</button>
      </div>
      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <input className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" placeholder="キーワード検索" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setDebouncedQuery(query); setOffset(0); } }} />
        <select className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" value={emotionFilter} onChange={(e) => setEmotionFilter(e.target.value)}>
          {emotions.map((e) => (
            <option key={e} value={e}>{e === 'all' ? '全感情' : e}</option>
          ))}
        </select>
        <select className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" value={sortKey} onChange={(e) => setSortKey(e.target.value as 'updated_desc' | 'created_desc' | 'emotion_asc')}>
          <option value="updated_desc">更新が新しい順</option>
          <option value="created_desc">作成が新しい順</option>
          <option value="emotion_asc">感情A→Z</option>
        </select>
        <button className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" onClick={() => { setQuery(''); setDebouncedQuery(''); setEmotionFilter('all'); setSortKey('updated_desc'); setOffset(0); setError(''); invalidateCacheAll(); }}>条件クリア</button>
      </div>
      {loading && <p className="mb-2 text-xs text-slate-400">読み込み中...（通信中）</p>}
      <p className="mb-2 text-xs text-slate-600">失敗回数: {errorCount}</p>
      {error && (
        <div className="mb-2 flex items-center gap-2">
          <p className="text-xs text-red-300">{error}</p>
          <button className="rounded bg-slate-800 px-2 py-1 text-xs" onClick={load}>再試行</button>
        </div>
      )}
      <p className="mb-2 text-xs text-slate-500">検索は入力後0.25秒で自動反映</p>
      <p className="mb-2 text-xs text-slate-500">条件: {filterSummary}</p>
      <div className="mb-2 flex items-center gap-2">
        <button className="rounded bg-slate-900 px-2 py-1 text-xs" onClick={() => setShowDebugMeta((v) => !v)}>{showDebugMeta ? '詳細を隠す' : '詳細を表示'}</button>
      </div>
      {showDebugMeta && (
        <>
          <p className="mb-2 text-xs text-slate-600">cache keys: {cacheStats.keys}</p>
          <p className="mb-2 text-xs text-slate-600">最終取得: {lastLoadedAt ? new Date(lastLoadedAt).toLocaleString('ja-JP') : '-'} / source: {lastSource === '-' ? 'none' : lastSource}</p>
        </>
      )}
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>{total}件中 {total === 0 ? 0 : Math.min(offset + 1, total)}-{Math.min(offset + limit, total)}</span>
        <div className="flex gap-2">
          <button className="rounded bg-slate-800 px-2 py-1 disabled:opacity-40" disabled={loading || offset === 0} onClick={() => setOffset((v) => Math.max(0, v - limit))}>前へ</button>
          <button className="rounded bg-slate-800 px-2 py-1 disabled:opacity-40" disabled={loading || offset + limit >= total} onClick={() => setOffset((v) => v + limit)}>次へ</button>
          <button className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" onClick={() => { setQuery(''); setDebouncedQuery(''); setEmotionFilter('all'); setSortKey('updated_desc'); setOffset(0); setError(''); invalidateCacheAll(); }}>条件クリア</button>
      </div>
        <button className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" onClick={() => { setQuery(''); setDebouncedQuery(''); setEmotionFilter('all'); setSortKey('updated_desc'); setOffset(0); setError(''); invalidateCacheAll(); }}>条件クリア</button>
      </div>
      <div className="max-h-56 overflow-auto">
        {filtered.length === 0 && <p className="text-slate-400">該当する保存データがありません（条件クリアをお試しください）</p>}
        {filtered.map((w) => (
          <div key={w.id} className="mb-2 rounded border border-slate-700 p-2">
            <button onClick={() => onSelect(w.id)} className="w-full text-left hover:bg-slate-900">
              <p className="truncate">{w.title}</p>
              <p className="text-xs text-slate-400">{w.emotion} / 作成 {new Date(w.createdAt).toLocaleString('ja-JP')}</p>
              <p className="text-xs text-slate-500">更新 {new Date((w.updatedAt ?? w.createdAt)).toLocaleString('ja-JP')}</p>
            </button>
            <button onClick={() => remove(w.id)} className="mt-2 rounded bg-slate-800 px-2 py-1 text-xs">削除</button>
            <button className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" onClick={() => { setQuery(''); setDebouncedQuery(''); setEmotionFilter('all'); setSortKey('updated_desc'); setOffset(0); setError(''); invalidateCacheAll(); }}>条件クリア</button>
      </div>
        ))}
        <button className="rounded border border-slate-700 bg-slate-950 p-2 text-xs" onClick={() => { setQuery(''); setDebouncedQuery(''); setEmotionFilter('all'); setSortKey('updated_desc'); setOffset(0); setError(''); invalidateCacheAll(); }}>条件クリア</button>
      </div>
    </div>
  );
}

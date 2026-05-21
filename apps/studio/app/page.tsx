'use client';

import { useState } from 'react';
import type { GenerationOutput, WorkRecord } from '@/lib/types';
import { HistoryPanel } from '@/components/history-panel';

export default function Page() {
  const [form, setForm] = useState({
    emotion: '孤独',
    protagonist: '来日5年目のベトナム人技能実習生',
    theme: '夜勤明け、駅前で立ち止まる',
    time: '深夜2時',
    place: '埼玉の小さな工業地帯',
    situation: '工場のサイレンが止み、自販機の白い光の前で家族の写真を見返している。'
  });

  const [output, setOutput] = useState<GenerationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [health, setHealth] = useState<'idle' | 'ok' | 'ng'>('idle');



  function onDeletedHistory(id: string) {
    if (selectedWorkId === id) {
      setSelectedWorkId(null);
      setSavedMessage('選択中の履歴を削除しました');
      setOutput(null);
    }
  }

  async function onSelectHistory(workId: string) {
    setErrorMessage('');
    const res = await fetch(`/api/works/${workId}`);
    const data = await res.json();
    if (!res.ok) {
      setErrorMessage(data.error ?? '履歴の取得に失敗しました');
      return;
    }
    const work = data.item as WorkRecord;
    setSelectedWorkId(work.id);
    setForm({
      emotion: work.emotion,
      protagonist: work.protagonist,
      theme: work.theme,
      time: work.time,
      place: work.place,
      situation: work.situation
    });
    setOutput({
      title: work.title,
      poem: work.poem,
      sunoPrompt: work.sunoPrompt,
      imagePrompt: work.imagePrompt,
      shortsScript: work.shortsScript,
      youtubeTitle: work.youtubeTitle
    });
    setSavedMessage('履歴を読み込みました');
  }

  async function onSave() {
    if (!output) return;
    const payload = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...form,
      ...output
    };
    setErrorMessage('');
    const res = await fetch('/api/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) { setSavedMessage('保存しました'); setHistoryRefreshKey((v) => v + 1); } else { setSavedMessage(''); setErrorMessage('保存に失敗しました'); }
  }


  async function onUpdate() {
    if (!output || !selectedWorkId) return;
    setErrorMessage('');
    const payload = { ...form, ...output };
    const res = await fetch(`/api/works/${selectedWorkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setSavedMessage('更新しました');
      setHistoryRefreshKey((v) => v + 1);
    } else {
      setSavedMessage('');
      setErrorMessage('更新に失敗しました');
    }
  }



  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      setHealth(res.ok ? 'ok' : 'ng');
    } catch {
      setHealth('ng');
    }
  }

  function onClearDraft() {
    setSelectedWorkId(null);
    setSavedMessage('');
    setErrorMessage('');
    setOutput(null);
  }

  async function onGenerate() {
    setErrorMessage('');
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setOutput(data.output);
    } else {
      setErrorMessage(data.error ?? '生成に失敗しました');
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-semibold">Nguyễn Minh Hạ Studio</h1>
      <p className="mt-2 text-sm text-slate-300">Emotional Story Music Generator</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <button onClick={checkHealth} className="rounded bg-slate-900 px-2 py-1">Health check</button>
        <span className={health === 'ok' ? 'text-emerald-300' : health === 'ng' ? 'text-red-300' : 'text-slate-400'}>
          {health === 'idle' ? '未確認' : health === 'ok' ? 'API正常' : 'API異常'}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onGenerate} className="rounded bg-slate-700 px-4 py-2 text-sm">{loading ? '生成中...' : 'APIで生成'}</button>
        <button onClick={onSave} className="rounded bg-slate-800 px-4 py-2 text-sm">新規保存</button>
        <button onClick={onUpdate} disabled={!selectedWorkId} className="rounded bg-slate-800 px-4 py-2 text-sm disabled:opacity-40">上書き更新</button>
        <button onClick={onClearDraft} className="rounded bg-slate-900 px-4 py-2 text-sm">選択解除</button>
      </div>
      <p className="mt-2 text-xs text-slate-400">{savedMessage}</p>
      {selectedWorkId && <p className="text-xs text-slate-500">選択中ID: {selectedWorkId}</p>}
      {errorMessage && <p className="mt-1 text-xs text-red-300">{errorMessage}</p>}

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-line bg-panel p-4">
          <h2 className="mb-3 font-medium">感情設定</h2>
          {[
            ['emotion', '感情'],
            ['protagonist', '主人公'],
            ['theme', 'テーマ']
          ].map(([key, label]) => (
            <label key={key} className="mb-3 block text-sm">
              <span className="mb-1 block text-slate-300">{label}</span>
              <input
                className="w-full rounded border border-slate-700 bg-slate-950 p-2"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))}
              />
            </label>
          ))}
        </article>

        <article className="rounded-xl border border-line bg-panel p-4">
          <h2 className="mb-3 font-medium">シーン入力</h2>
          {[
            ['time', '時間帯'],
            ['place', '場所']
          ].map(([key, label]) => (
            <label key={key} className="mb-3 block text-sm">
              <span className="mb-1 block text-slate-300">{label}</span>
              <input
                className="w-full rounded border border-slate-700 bg-slate-950 p-2"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">状況</span>
            <textarea
              className="h-24 w-full rounded border border-slate-700 bg-slate-950 p-2"
              value={form.situation}
              onChange={(e) => setForm((v) => ({ ...v, situation: e.target.value }))}
            />
          </label>
        </article>

        <article className="rounded-xl border border-line bg-panel p-4 text-sm">
          <h2 className="font-medium">生成結果</h2>
          <p className="mt-2"><strong>タイトル</strong><br />{output?.title ?? '未生成'}</p>
          <p className="mt-2 whitespace-pre-wrap"><strong>3行詩</strong><br />{output?.poem ?? '未生成'}</p>
          <p className="mt-2 whitespace-pre-wrap"><strong>Suno Prompt</strong><br />{output?.sunoPrompt ?? '未生成'}</p>
          <p className="mt-2 whitespace-pre-wrap"><strong>ImageFX Prompt</strong><br />{output?.imagePrompt ?? '未生成'}</p>
          <p className="mt-2 whitespace-pre-wrap"><strong>Shorts Script</strong><br />{output?.shortsScript ?? '未生成'}</p>
          <p className="mt-2"><strong>YouTubeタイトル案</strong><br />{output?.youtubeTitle ?? '未生成'}</p>
        </article>
      </section>

      <HistoryPanel onSelect={onSelectHistory} onDeleted={onDeletedHistory} refreshKey={historyRefreshKey} />
    </main>
  );
}

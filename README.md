# Your GitHub Learning Lab Repository for Introducing GitHub

Welcome to **your** repository for your GitHub Learning Lab course. This repository will be used during the different activities that I will be guiding you through. See a word you don't understand? We've included an emoji 📖 next to some key terms. Click on it to see its definition.

Oh! I haven't introduced myself...

I'm the GitHub Learning Lab bot and I'm here to help guide you in your journey to learn and master the various topics covered in this course. I will be using Issue and Pull Request comments to communicate with you. In fact, I already added an issue for you to check out.

![issue tab](https://lab.github.com/public/images/issue_tab.png)

I'll meet you over there, can't wait to get started!

This course is using the :sparkles: open source project [reveal.js](https://github.com/hakimel/reveal.js/). In some cases we’ve made changes to the history so it would behave during class, so head to the original project repo to learn more about the cool people behind this project.


## Nguyễn Minh Hạ Studio MVP

Open `app.html` in your browser to use the emotional story music generator prototype.


## Next Step App (Next.js)

A real app scaffold is now available under `apps/studio`.

Run locally:

```bash
cd apps/studio
npm install
npm run dev
```


### API endpoints (Phase 2 scaffold)
- `POST /api/generate`: returns structured generated output from form inputs.
- `GET /api/works`: lists saved works (in-memory stub).
- `POST /api/works`: saves a work record (Supabase or in-memory fallback).
- `GET /api/works/:id`: fetch one saved work by id.
- `DELETE /api/works/:id`: delete one saved work by id.
- `PATCH /api/works/:id`: update one saved work by id.


### Environment variables (for real AI generation)
Set these in `apps/studio/.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

When Supabase variables are set, `/api/works` uses Supabase REST API; otherwise it falls back to in-memory storage.


If `OPENAI_API_KEY` is missing, the app automatically falls back to deterministic local generation.


### Validation notes
- `/api/generate` validates required fields and max lengths before generation.
- `/api/generate` validates structured output fields and policy checks before returning.
- `/api/works` requires key fields (`id`, `title`, `createdAt`, `emotion`, `poem`) for persistence.


### Supabase setup
1. Open your Supabase SQL editor.
2. Run `apps/studio/supabase-schema.sql`.
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `apps/studio/.env.local`.

You can copy starter env values from `apps/studio/.env.example`.


### History panel supports
- keyword search
- emotion filter
- reload
- delete
- auto refresh after save


### Edit workflow
- Select a saved work from history.
- Modify inputs and regenerate output.
- Click **上書き更新** to persist changes via `PATCH /api/works/:id`.


### Test coverage
- `generator.test.mjs`: deterministic output shape and required prompt anchors
- `validators.test.mjs`: input/output validation success and failure paths
- `route-helpers.test.mjs`: generate/create/get/update/delete helper flows


Note: default test command currently runs generator/validators only; route-helper tests require TS-aware module resolution setup.


### Extended tests
- `npm run test`: baseline deterministic/unit checks (`generator`, `validators`)
- `npm run test:routes`: route-helper CRUD/generation flow checks via tsx
- `npm run test:all`: runs both suites


### Node test runtime note
`apps/studio/package.json` uses `"type": "module"` so Node test runs resolve ESM/TypeScript imports consistently.


### Editing ergonomics
- `選択解除`: clear selected history target and current generated output
- deleting a selected history item automatically clears selection in the editor


### History consistency
- History selection fetches the latest record via `GET /api/works/:id` before loading into the editor.


### Persistence metadata
- Saved works now include `updatedAt` in app payloads and `updated_at` in Supabase rows for clearer edit history.


### Update semantics
- `createdAt` is immutable across PATCH updates.
- `updatedAt` is refreshed on every successful update.


### History sort
- Sort by latest updated, latest created, or emotion (A→Z).


### History pagination
- `GET /api/works` supports `limit` and `offset` query params.
- History panel includes 前へ/次へ paging controls.


### Server-side filters
- `GET /api/works` accepts `emotion` and `query` in addition to `limit`/`offset`.
- History search/filter now executes on the server-side paged endpoint.


### History search UX
- Search input is debounced (250ms) before server request.
- Changing filter/sort resets paging to the first page.


### History filter reset
- `条件クリア` resets query/emotion/sort and returns pagination to first page.


### History error handling
- History list and delete failures are surfaced as inline error messages in the panel.


### History resilience
- On history fetch failure, users can click `再試行` directly in the panel.
- Paging buttons are disabled while loading to prevent duplicate requests.


### History clarity
- History panel shows a live summary of active filter/search/sort conditions.


### Search interaction
- Press `Enter` in history search to apply immediately (without waiting debounce).


### History request consistency
- History list uses a request-sequence guard to ignore stale async responses when filters/pages change rapidly.


### History request cancellation
- In-flight history requests are cancelled with `AbortController` when filters/page change, reducing wasted work and race side-effects.


### Route-helper test scope
- Includes pagination/filter coverage for `handleListWorksPaginated` (limit/offset/emotion/query).


### History cache
- History list responses are cached by query-string key on the client to reduce repeat fetches during paging/filter toggles.
- Cache is cleared on refresh-triggered reloads and filter reset.


### History cache policy
- Client history cache is capped (30 keys) with FIFO/LRU-like eviction to avoid unbounded memory growth.


### History cache invalidation
- History cache is fully invalidated after delete actions and refresh-triggered reloads to avoid stale totals/pages.


### History cache visibility
- History panel now displays current cache key count for quick debugging/verification.


### History cache controls
- `キャッシュクリア` forces cache invalidation + refetch for troubleshooting stale local state.


### History observability
- History panel now shows `最終取得` timestamp to confirm refresh timing.


### History fetch source
- `最終取得` line also shows source (`cache` or `network`) to verify cache behavior quickly.


### History debug meta toggle
- Cache/fetch debug metadata is available via `詳細を表示` toggle to keep default UI clean.


### Loading feedback
- History panel loading text now explicitly indicates network activity (`通信中`).


### History failure counter
- History panel shows `失敗回数` for fetch/delete troubleshooting; resets on success.


### Health endpoint
- `GET /api/health` returns simple readiness metadata for runtime checks.


### Health check button
- Main page includes a `Health check` button that calls `/api/health` and shows API status inline.


### Test script defaults
- `npm run test` now runs both unit and route-helper suites.
- `npm run test:unit` runs generator/validator only.
- `npm run test:routes` runs route-helper integration checks.


### Pagination bounds
- `limit` is clamped to `1..100` and `offset` is clamped to `>=0` in route helper pagination.


### Query normalization
- Whitespace-only `query` is normalized to empty and treated as no-filter.

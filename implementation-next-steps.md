# Nguyễn Minh Hạ Studio - Next Steps (Phase 1.5 → Phase 2)

## Current State
The repository now contains a browser-only MVP (`app.html`) that validates:
- emotional input flow
- scene-to-output generation structure
- local draft persistence (`localStorage`)
- JSON handoff

## Next Implementation Target
Move from browser-only MVP to an application stack based on:
- Next.js
- Tailwind CSS
- OpenAI API
- Supabase

## Incremental Plan

### Step 1: Next.js app scaffold
- Create `apps/studio` using Next.js App Router
- Add dark cinematic base layout and 3-column page
- Port MVP form and output UI from `app.html`

### Step 2: API route for generation
- Add `/api/generate` route
- Send structured input (`emotion`, `time`, `place`, `protagonist`, `theme`, `situation`)
- Return structured output:
  - `title`
  - `poem`
  - `suno_prompt`
  - `image_prompt`
  - `shorts_script`
  - `youtube_title`

### Step 3: Prompt policy module
- Centralize rules in `lib/prompt-policy.ts`
- Required tokens: Vietnamese atmosphere, cinematic, restrained emotion
- Banned style tokens: EDM, hyperpop, aggressive beat, viral slang

### Step 4: Supabase persistence
- Create `work` table schema exactly as spec
- Add save/read endpoints
- Build history panel from DB (not localStorage)

### Step 5: Quality controls
- Add output validators
- Detect direct repetition of explicit emotion words
- Add retry path when policy fails

## Definition of Done for Phase 2
- User can generate with real API
- User can save and reopen works from Supabase
- UI remains cinematic/dark and mobile responsive
- Output follows restrained, visual, non-EDM style

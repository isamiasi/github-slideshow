# Nguyễn Minh Hạ Studio

## Sub-title
**Emotional Story Music Generator**

## 1) App Purpose
Nguyễn Minh Hạ Studio is an **AI-assisted creative system** for producing coherent, emotionally restrained story content themed around Vietnamese technical intern workers in Japan.

It supports end-to-end creation for:
- emotion-driven narrative ideas
- short poetic text
- music prompts
- visual prompts
- YouTube Shorts-ready script fragments

---

## 2) Core Concept
This product is **not** a generic AI music tool.

It is an **Emotional Story Generation System** that connects:
1. emotional intention
2. scene building
3. poetic expression
4. music direction
5. visual direction
6. short-form video packaging

---

## 3) Target Users
### Primary
- AI music creators
- story-style YouTubers
- Shorts creators
- poetic content creators

### Future expansion
- senior creators
- creators focused on foreign worker narratives
- loneliness-themed creators
- ZINE creators

---

## 4) MVP Scope (Minimum Viable Product)
The MVP should **not** fully automate every step.

### Input fields
- emotion
- time of day
- place
- protagonist
- theme

### Output fields
- title
- 3-line poem
- Suno prompt
- ImageFX prompt
- Shorts subtitle/script
- YouTube title idea

---

## 5) Beginner-Friendly Tech Stack
- **Frontend**: Next.js + Tailwind CSS
- **AI processing**: OpenAI API + Codex Agent workflow
- **Database**: Supabase (Phase baseline)
- **Persistence (early stage)**: JSON or SQLite

---

## 6) Screen Layout (MVP)
### Top screen with 3-column layout

#### Left column: Emotion selector
- loneliness
- nostalgia
- hope
- anxiety
- rebirth
- temptation

#### Center column: Scene generation panel
Input:
- time
- place
- situation

Output:
- one-scene narrative text

#### Right column: AI output panel
- poem
- Suno prompt
- Image prompt
- Shorts script

---

## 7) Data Model
### `work` table
| field | type |
|---|---|
| id | UUID |
| title | text |
| emotion | text |
| scene | text |
| poem | text |
| suno_prompt | text |
| image_prompt | text |
| shorts_script | text |
| youtube_title | text |
| created_at | datetime |

---

## 8) AI Prompt Rules
### Required style constraints
- include Vietnamese context or cultural signal
- quiet emotional tone
- avoid over-explaining
- cinematic imagery
- do not repeatedly use explicit words like “loneliness” or “hope”
- preserve emotional aftertaste

### Prohibited style
- EDM-like direction
- flashy expressions
- TikTok “viral tone” slang
- excessive positivity
- obvious “AI-like” wording

---

## 9) Shorts Generation Spec
### Duration
15–30 seconds

### Structure
1. **0–3s**: emotional subtitle hook
2. **3–10s**: visual scene narration
3. **10–15s**: lingering closing + title

---

## 10) Suno Prompt Spec
### Must include
- Vietnamese emotional atmosphere
- cinematic
- restrained emotion
- ambient
- soft piano
- industrial ambience

### Must exclude
- hyperpop
- EDM
- aggressive beat

---

## 11) ImageFX Prompt Spec
### Must include
- realistic photo
- cinematic lighting
- Japanese night scenery
- Vietnamese worker
- subtle melancholy

---

## 12) Future Roadmap
### Phase 2
- Spotify URL management
- YouTube URL management
- play count tracking
- Shorts asset management

### Phase 3
- automatic series generation
- character management
- “Tuấn persona” database
- worldbuilding dictionary

### Phase 4
- one-click production
- full AI-agent orchestration

---

## 13) UI Design Conditions
### Desired atmosphere
- quiet
- cinematic
- dark background
- monochrome
- nighttime feeling

### Avoid
- flashy neon
- EDM visual style
- game-like UI patterns

---

## 14) Codex Implementation Prompt (Ready to Use)
```text
Build a minimal emotional story music generation web app called "Nguyễn Minh Hạ Studio".

Use:
- Next.js
- Tailwind CSS
- Supabase

Main workflow:
1) User selects emotion
2) User inputs scene
3) AI generates:
   - title
   - 3-line poem
   - Suno prompt
   - ImageFX prompt
   - Shorts script

Design style:
- cinematic
- minimal
- emotional
- dark mode
- Japanese night atmosphere

Important:
This is NOT a generic AI music generator.
This app focuses on emotional storytelling inspired by Vietnamese migrant workers in Japan.

Output style must be:
- subtle
- poetic
- cinematic
- emotionally restrained
- visually descriptive
```

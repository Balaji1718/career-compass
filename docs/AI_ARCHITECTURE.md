# AI Architecture & Fallback Strategy

## Core Principle: Deterministic Source of Truth

In Career Compass, **AI never calculates primary numeric match scores or rankings**.
All scores, coverage percentages, and gap categorizations are calculated by the deterministic engine (`skillGapEngine.js`).

```
[ User Recorded Skills ] + [ ESCO Career Requirements ]
                         │
                         ▼
        Deterministic Skill-Gap Engine
  (overallMatchScore, classification, coverage, gaps)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
Deterministic Career Ranking       Optional AI Service
(recommendationService.js)        (OpenRouter -> NVIDIA -> Fallback)
```

---

## Provider Chain & Fallback Order

The AI service executes through an automatic fallback sequence:

1. **OpenRouter (`adapters/openrouter.js`)**:
   - Primary LLM provider adapter.
   - Default model: `meta-llama/llama-3.1-8b-instruct`.
   - Sends strict JSON instruction prompts.

2. **NVIDIA NIM (`adapters/nvidia.js`)**:
   - Secondary LLM provider adapter.
   - Automatically queried if OpenRouter is unconfigured, times out, or fails.

3. **Deterministic Local Fallback (`skillGapEngine.js`)**:
   - Activated automatically if both remote AI providers fail or network times out.
   - Generates formatted recommendations based directly on detected skill gaps.
   - User receives:
     > *"AI assistance is temporarily unavailable. Your core skill analysis is still available."*
   - No stack traces, exceptions, or provider internal details are ever exposed.

---

## Output Validation & Defensive Parsing

Every AI response is validated through Zod schemas before being passed to controllers:
- `careerExplanationSchema`: Ensures `{ summary, strengths[], gaps[], recommendations[] }`.
- `learningRecommendationsSchema`: Ensures structured priority items.
- `roadmapSchema`: Ensures structured stages with title, skill, reason, projectIdeas, and estimatedHours.
- `safeParseJson`: Strips markdown fences (```` ```json ````) and extracts valid JSON objects defensively.
- If an LLM returns invalid JSON or schema violations, it is rejected and triggers the fallback provider instead of trusting corrupt output.

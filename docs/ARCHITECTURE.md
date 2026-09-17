# System Architecture

## Overview

The **AI-Based Skill Gap Analysis and Career Recommendation System** is built on a single-server JavaScript MERN architecture:

```
Browser (React / Vite SPA)
      ↓ (HTTP / REST + HTTP-only Cookie)
Express Server (Port 3000)
  ├── /api/auth/*           (Session-based authentication with bcrypt)
  ├── /api/profile          (User profile management)
  ├── /api/skills           (ESCO skill catalog)
  ├── /api/user-skills      (User's recorded proficiency)
  ├── /api/careers          (ESCO occupational catalog & requirements)
  ├── /api/recommendations  (Deterministic career match ranking)
  ├── /api/analyses         (Deterministic skill-gap evaluation engine)
  ├── /api/roadmaps         (Step-by-step personalized learning roadmaps)
  ├── /api/learning-resources (Verified educational resources)
  ├── AI Service            (OpenRouter primary, NVIDIA fallback, graceful offline fallback)
  └── Single-Port Frontend Serving:
        ├── Development Mode: Vite Dev Middleware (HMR active over same origin)
        └── Production Mode: Express static serving from dist/ + SPA index.html fallback
      ↓
MongoDB Database (Database: skillgap_career_db via Mongoose)
```

---

## Single-Server Architecture

The application runs as a **single unified server** on a single port (default `3000`):

1. **Development (`npm run dev`)**:
   - Express initializes first.
   - Vite is mounted as an internal Express middleware (`vite.middlewares`).
   - The React application is served through Express with full Hot Module Replacement (HMR).
   - API endpoints (`/api/*`) are handled directly by Express without requiring CORS or reverse proxy setups.
   - Nodemon watches backend files and triggers fast restarts.

2. **Production (`npm run build` && `npm start`)**:
   - `npm run build` compiles the React application into `dist/`.
   - `npm start` runs Express in production mode (`NODE_ENV=production`).
   - Express statically serves `dist/` and provides client-side SPA routing fallback for unmatched routes.

---

## Separation of Concerns

### Frontend (`frontend/src/`)
- `api/client.js`: Unified API client using `fetch` with same-origin credentials.
- `context/AuthContext.jsx`: Authentication state machine restoring session on boot.
- `hooks/useAsync.js`: Reusable lifecycle hooks (`useAsync`, `useAction`, `useOnline`).
- `components/`: Clean UI components (`AsyncBoundary`, `ErrorBoundary`, `Layout`, `MatchBadge`, `ProgressBar`, `LevelDots`, `FieldErrors`).
- `pages/`: 11 fully functional pages corresponding to every functional module.
- `styles/global.css`: Design system tokens for typography, surfaces, badges, and grids.

### Backend (`backend/src/`)
- `config/`: Environment configuration (`env.js`), database connector with automatic fallback (`db.js`), and constants (`constants.js`).
- `models/`: Mongoose schemas for all 10 collections.
- `controllers/`: Request handling and response dispatching.
- `services/`: Core business logic:
  - `skillGapEngine.js`: Deterministic scoring and gap categorization.
  - `recommendationService.js`: Deterministic career ranking.
  - `analysisService.js`: Analysis persistence and AI explanation hook.
  - `roadmapService.js`: Learning path construction with resource attachment.
  - `ai/`: Provider adapters (OpenRouter, NVIDIA), structured validators, and fallbacks.
- `middleware/`: Authentication, session validation, ownership enforcement, error handlers.
- `validators/`: Zod request schemas.
- `seeds/`: ESCO v1.2.1 dataset extraction (`extractEsco.js`) and idempotent database seeder (`seed.js`).

---

## ESCO Provenance, Normalization & Application Heuristics

The occupational and skills data source is the official **European Skills, Competences, Qualifications and Occupations (ESCO) v1.2.1** English classification dataset:

1. **Source of Truth**: Raw ESCO CSV files (`occupations_en.csv`, `skills_en.csv`, `occupationSkillRelations_en.csv`, `broaderRelationsSkillPillar_en.csv`, `skillGroups_en.csv`).
2. **Filtering & Normalization**:
   - Occupations are filtered to genuine Information & Communication Technology (ICT) roles using ISCO-08 groups (`25`, `351`, `133`) and token-aware word-boundary regex patterns (e.g., `/\bux\b/i` rather than substring search, preventing "auxiliary" false positives).
   - Non-ICT occupations (audiovisual/camera/boom operators, projectionists, sound technicians, healthcare/nursing, alarm technicians) are strictly excluded.
   - Result: 105 verified ICT careers, 1,100 normalized skills, and 6,206 career-skill relations.
3. **Application Heuristic Mapping**:
   - The raw ESCO dataset specifies only qualitative relationships: `essential` and `optional`.
   - To enable deterministic mathematical calculations, the application applies an explicit heuristic mapping:
     - `essential` → `minimumLevel: 3`, `importance: 5`, `priority: 5`, `isCore: true`
     - `optional` → `minimumLevel: 2`, `importance: 2`, `priority: 2`, `isCore: false`
   - These numbers are **application engineering heuristics**, not official ESCO values. Original provenance is preserved via `source='ESCO'`, `sourceId` (Concept URI), and `sourceVersion='1.2.1'`.
4. **Deterministic Scoring**:
   - All skill matching, coverage percentages, and career rankings are calculated purely mathematically by `skillGapEngine.js`. AI never determines or modifies scores or rankings.

---

## AI Service Architecture & Free Routing

- **Primary Provider**: OpenRouter using the dynamic free router slug `openrouter/free` (`OPENROUTER_MODEL=openrouter/free`).
- **NVIDIA NIM**: Optional fallback adapter. If keys or models are absent or deprecated, the system continues seamlessly without error.
- **Strict Role of AI**: AI is limited exclusively to explanatory narratives, summary generation, and enrichment of roadmaps. AI is **never** permitted to influence numerical skill gap calculations or career rankings.
- **Resilience**: If AI providers are unavailable, time out (20s limit), or return invalid JSON, the system validates output via Zod schemas and falls back gracefully to deterministic rule-based explanations without disrupting core user workflows.

---

## MongoDB Connection & Fallback Policy

- **Configured Connection**: Primary connection is established via `MONGODB_URI` (e.g. MongoDB Atlas cluster).
- **Explicit Fallback**: Governed strictly by `ALLOW_LOCAL_MONGO_FALLBACK=false` (default). If the primary URI is unreachable or authentication fails:
  - If `ALLOW_LOCAL_MONGO_FALLBACK=false`: Connection halts with a classified, credential-safe error message.
  - If `ALLOW_LOCAL_MONGO_FALLBACK=true`: Only in non-production environments, the system attempts fallback to `mongodb://127.0.0.1:27017/skillgap_career_db`.
  - In production (`NODE_ENV=production`), local fallback is permanently disabled regardless of the flag to prevent hidden configuration failures.


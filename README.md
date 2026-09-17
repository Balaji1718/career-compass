# Career Compass: AI-Based Skill Gap Analysis and Career Recommendation System

Career Compass is an AI-assisted career guidance and skill-gap analysis web platform designed for students and early-career software/computing professionals.

The platform provides a structured, deterministic comparison between a user's verified skills and standardized European Skills, Competences, Qualifications and Occupations (ESCO v1.2.1) occupational requirements, complemented by AI-powered explanations and personalized milestone learning roadmaps.

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Main Objective & Goals](#main-objective--goals)
- [Exact Technology Stack](#exact-technology-stack)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [MongoDB Connection & Fallback Policy](#mongodb-connection--fallback-policy)
- [ESCO Dataset Setup, Provenance & Heuristic Mapping](#esco-dataset-setup-provenance--heuristic-mapping)
- [Database Seeding](#database-seeding)
- [Commands Guide](#commands-guide)
- [Testing](#testing)
- [Known Limitations & Resilience](#known-limitations--resilience)

---

## Problem Statement

Students and early-career job seekers often acquire discrete technologies without understanding how those skills map to professional industry expectations. They frequently encounter challenges knowing:
- Which careers best match their existing technical skill set.
- Which critical required skills are missing versus which existing skills need further depth.
- How large their skill gap is across specific roles.
- What structured learning path they should pursue to close these gaps.

Generic career advice lacks objective alignment with standardized occupational taxonomies. Career Compass solves this by combining deterministic mathematical skill-gap analysis against ESCO v1.2.1 classification data with optional, free-capable AI guidance.

---

## Main Objective & Goals

1. **Structured Profiling**: Record technical skills, proficiency levels (Beginner to Expert), and educational backgrounds.
2. **Standardized Career & Skill Knowledge Base**: Maintain 105 strictly verified ICT occupations, 1,100 standardized skills, and 6,206 career-skill requirement mappings.
3. **Deterministic Skill-Gap Engine**: Act as the single source of truth for match scores, coverage percentages, and gap classifications (AI never calculates or alters scores).
4. **Deterministic Recommendations**: Rank suitable careers based purely on verified mathematical skill compatibility.
5. **AI-Assisted Guidance**: Provide rich natural-language explanations and curated learning recommendations via OpenRouter dynamic free routing (`openrouter/free`) with optional NVIDIA fallback and automatic deterministic offline fallback.
6. **Milestone Learning Roadmaps**: Generate step-by-step learning roadmaps with curated, free learning resources and track completion progress.
7. **Single-Port Simplicity**: Run both Express API and Vite React frontend on a single unified port (3000) in both development (HMR) and production.

---

## Exact Technology Stack

- **Frontend**: React 18, Vite 5, JavaScript (ES6+ / JSX) — *Vanilla CSS design system, no Tailwind, no TypeScript*.
- **Backend**: Node.js (>= 18.18.0), Express 4, JavaScript (CommonJS).
- **Database**: MongoDB with Mongoose 8 (Database name: `skillgap_career_db`).
- **Authentication**: Persistent session management with `bcryptjs`, cryptographically signed HTTP-only cookies, and MongoDB TTL session expiration.
- **AI Integration**: Server-side multi-provider adapter supporting OpenRouter free router (primary default) and NVIDIA NIM (optional fallback), with defensive Zod schema validation and graceful offline fallback.
- **Classification Dataset**: ESCO v1.2.1 English Classification CSV export.

---

## Core Features

- **Authentication**: Secure registration, login, logout, and persistent HTTP-only sessions.
- **User Profile**: Comprehensive profile editing (education history, experience level, interests, goals).
- **Skill Management**: Search catalog, add skills, adjust proficiency levels (1–4), review verification status.
- **Career Discovery**: Search, filter, and paginate through 105 IT occupations without truncation, inspect core requirements, preferred skills, and responsibilities.
- **Skill-Gap Analysis**: Run deterministic compatibility evaluations calculating overall match score, skill coverage, matched, weak, and missing skills.
- **Career Recommendations**: Deterministically ranked career suggestions based on user skill overlaps.
- **AI Career Explanations**: Contextualized natural language summaries explaining scores and recommending strategic learning priorities.
- **Personalized Roadmaps**: Actionable multi-stage learning roadmaps with free educational resources and interactive completion toggles.
- **Analysis History**: Audit log of all past analyses with timestamped scores and algorithm versioning.
- **Dashboard**: Centralized overview displaying recorded skills count, top career matches, recent analysis, and roadmap status.

---

## Architecture

Career Compass operates on a **Single-Server Architecture**:

```
Browser (React / Vite SPA)
  ↓ HTTP / Same-origin cookies
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
        ├── Development Mode: Vite Dev Middleware with active HMR
        └── Production Mode: Express static file serving from dist/ + SPA index.html fallback
      ↓
MongoDB Database (skillgap_career_db via Mongoose)
```

---

## Prerequisites

- Node.js version `18.18.0` or newer.
- MongoDB instance (MongoDB Atlas connection string or local MongoDB on `mongodb://127.0.0.1:27017`).
- ESCO v1.2.1 CSV dataset files placed in `data/esco/`.

---

## Environment Configuration

Create `backend/.env` (or copy `.env.example` to `backend/.env`):

```env
NODE_ENV=development
PORT=3000

# MongoDB URI (Atlas or local instance)
MONGODB_URI=mongodb://127.0.0.1:27017/skillgap_career_db
DB_NAME=skillgap_career_db

# Explicit Fallback Control (default: false)
ALLOW_LOCAL_MONGO_FALLBACK=false

# Session signing secret
SESSION_SECRET=your-random-64-char-secret

# AI Provider Configuration
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/free

# NVIDIA NIM (Optional)
NVIDIA_API_KEY=
NVIDIA_MODEL=

AI_TIMEOUT_MS=20000
ESCO_DATA_DIR=./data/esco
```

---

## MongoDB Connection & Fallback Policy

Career Compass does **not** silently switch databases on connection failure:

1. **Explicit Setting (`ALLOW_LOCAL_MONGO_FALLBACK=false` by default)**:
   - If the configured `MONGODB_URI` fails (e.g. invalid Atlas password or IP whitelist blockage), startup fails immediately and logs a clear, classified error message.
2. **Local Fallback (`ALLOW_LOCAL_MONGO_FALLBACK=true`)**:
   - Only attempted in non-production environments when explicitly enabled by the developer.
3. **Production Protection**:
   - In production (`NODE_ENV=production`), local fallback is permanently disabled regardless of the flag to prevent deployment accidents.
4. **Credential Safety**:
   - Logs never print raw MongoDB URIs, passwords, or connection strings.

---

## ESCO Dataset Setup, Provenance & Heuristic Mapping

### Data Source
The taxonomy is sourced directly from the official **European Skills, Competences, Qualifications and Occupations (ESCO) v1.2.1** English classification export.

### Tightened Filtering (Removal of False Positives)
Previous versions included non-ICT roles due to broad ISCO prefixes and raw substring matching (e.g., matching `"auxiliary"` because of `"ux"`). The tightened extraction engine applies:
- Strict ICT ISCO groups (`25`, `351`, `133`).
- Token-aware regex word boundaries (e.g. `/\bux\b/i`).
- Explicit family exclusions (audiovisual/camera/boom operators, projectionists, sound technicians, healthcare/nursing, alarm installers, retail trades).
- Result: **105 clean, legitimate ICT careers** (down from 124 false-positive polluted careers).

### Application Heuristic Mapping
> [!IMPORTANT]
> The raw ESCO dataset specifies only qualitative relationships: `essential` and `optional`. It does **not** provide numeric proficiency scales or importance weights.
>
> Career Compass maps these qualitative indicators into quantitative values for mathematical evaluation:
> - **ESCO Essential** → `minimumLevel: 3` (Advanced), `importance: 5`, `priority: 5`, `isCore: true`
> - **ESCO Optional** → `minimumLevel: 2` (Intermediate), `importance: 2`, `priority: 2`, `isCore: false`
>
> These numbers are **application engineering heuristics**, not official ESCO values. Original source identifiers (`source='ESCO'`, `sourceId` URI, `sourceVersion='1.2.1'`) are preserved for every entity.

To stream, filter, and extract IT-specific occupations and skills:
```bash
npm run esco:extract
```
This produces:
- `backend/src/seeds/careers.json` (105 occupations)
- `backend/src/seeds/skills.json` (1,100 skills)
- `backend/src/seeds/careerSkills.json` (6,206 relationships)

---

## Database Seeding

To seed or update MongoDB with the extracted ESCO catalog and curated learning resources:
```bash
npm run seed
```
The seeding script is completely idempotent; subsequent runs update records in place without creating duplicates.

---

## Commands Guide

| Command | Description |
|---|---|
| `npm install` | Install all dependencies (backend, frontend, dev tooling) |
| `npm run esco:extract` | Extract IT occupations & skills from raw ESCO CSV files |
| `npm run seed` | Idempotently seed ESCO careers, skills, and learning resources into MongoDB |
| `npm test` | Run complete Node.js test suite across all modules |
| `npm run dev` | Start unified single-server development mode with Vite HMR on port 3000 |
| `npm run build` | Compile optimized React frontend bundle into `dist/` |
| `npm start` | Run production Express server serving API and compiled frontend |

---

## Testing

The comprehensive test suite contains **36 individual tests across 9 test files (4 describe suites)**, all executed with Node.js's native test runner (`node --test`), with a 100% pass rate (36 passed, 0 failed):
- **ESCO Filtering & Token Boundary** (`escoFilter.test.js` - 4 tests): Verifies exclusion of audiovisual/nursing/alarm trades, tests that `auxiliary` does not trigger UX matches, and verifies legitimate UX and software roles.
- **ESCO Heuristics** (`escoFilter.test.js`): Validates that essential/optional relations map cleanly to heuristic quantitative levels without false attribution.
- **MongoDB Fallback Control** (`mongoFallback.test.js` - 3 tests): Tests credential masking, verifies that primary connection failure stops startup when `ALLOW_LOCAL_MONGO_FALLBACK=false`, and ensures production mode blocks fallback.
- **AI Configuration & Fallback** (`aiConfig.test.js` - 5 tests): Verifies default `openrouter/free` model, ensures missing NVIDIA key does not crash deterministic functionality, and validates JSON schemas against markdown fences and malformed outputs.
- **AI Structured Validation** (`ai.test.js` - 5 tests): Tests schema validation, markdown code fences, malformed payload rejections, and graceful fallback.
- **Database & Models** (`database.test.js` - 5 tests): Validates user schema normalization, passwordHash omission, required fields, and compound unique/TTL indexes.
- **API & Authentication** (`api.test.js` - 4 tests): Tests password validation, 401 unauthorized protection, session cookie lifecycle, and 404 error responses.
- **Career Discovery & Pagination** (`careerDiscovery.test.js` - 4 tests): Tests query bounds up to 500 items, pagination metadata, and category/search filters.
- **Roadmap Logic** (`roadmap.test.js` - 2 tests): Tests stage completion recalculation, lifecycle status transitions, and empty stage safety.
- **Deterministic Scoring Engine** (`skillGapEngine.test.js` - 4 tests): Tests 100% complete match, 0% match, classification bands, and proportional weak skill scoring.

Run tests:
```bash
npm test
```

---

## Known Limitations & Resilience

1. **Free-Capable AI Routing**: The system uses OpenRouter's free router (`openrouter/free`) as the default configuration. Free model availability and throughput are subject to upstream provider capacity. If the provider times out or returns malformed output, the system seamlessly falls back to local deterministic explanations.
2. **NVIDIA NIM Adapter**: NVIDIA NIM free endpoint configuration is optional. If an active key and supported model are not provided, the application continues gracefully with OpenRouter or deterministic fallbacks.
3. **MongoDB Connectivity**: If a remote Atlas cluster is unreachable, the system fails clearly unless the developer explicitly enables local fallback via `ALLOW_LOCAL_MONGO_FALLBACK=true` for local development.
4. **Deterministic Authority**: AI never generates, adjusts, or influences compatibility scores, skill gap classifications, or career rankings; these remain 100% deterministic and mathematically auditable.

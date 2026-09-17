# Local Setup & Installation Guide

Follow these steps to set up and run the Career Compass project locally.

---

## Prerequisites
- **Node.js**: v18.18.0 or newer (tested on Node v22)
- **MongoDB**: Either local MongoDB server (port 27017) or MongoDB Atlas cluster
- **ESCO v1.2.1 Dataset**: Located in `data/esco/` (already present in project)

---

## Step-by-Step Installation

### 1. Install Dependencies
Run from the project root:
```bash
npm install
```

### 2. Environment Configuration
Create `backend/.env` (and optionally `.env` in the root) by copying `.env.example`:
```bash
cp .env.example backend/.env
```

Configure your environment variables:
```env
NODE_ENV=development
PORT=3000

# MongoDB URI (Atlas or local)
MONGODB_URI=mongodb://127.0.0.1:27017/skillgap_career_db
DB_NAME=skillgap_career_db

# Fallback Flag: Set to true if you want local 127.0.0.1:27017 fallback on Atlas network errors during dev
ALLOW_LOCAL_MONGO_FALLBACK=false

# Session signing secret (64 hex characters)
SESSION_SECRET=your-random-64-character-hex-secret

# AI Provider Configuration (Optional)
# Free-capable dynamic routing via OpenRouter
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/free

# NVIDIA NIM (Optional)
NVIDIA_API_KEY=
NVIDIA_MODEL=

AI_TIMEOUT_MS=20000
ESCO_DATA_DIR=./data/esco
```

### 3. Extract and Process the ESCO Dataset
Extract relevant ICT careers, skills, and relationships from the raw CSV dataset:
```bash
npm run esco:extract
```
This produces:
- `backend/src/seeds/careers.json` (105 verified ICT careers)
- `backend/src/seeds/skills.json` (1,100 standardized skills)
- `backend/src/seeds/careerSkills.json` (6,206 career-skill mappings)

### 4. Seed the Database
Seed the processed ESCO records into MongoDB:
```bash
npm run seed
```
This process is completely idempotent and updates records in place without creating duplicates.

### 5. Run the Test Suite
Verify ESCO filtering, token boundary matching, AI models, schema validation, MongoDB fallback protection, and career discovery:
```bash
npm test
```

### 6. Start the Development Server
Launch the unified single-server application with live Vite HMR:
```bash
npm run dev
```
Open your browser at:
```
http://localhost:3000
```

### 7. Build and Run in Production Mode
Compile the optimized frontend and start Express in production:
```bash
npm run build
npm start
```

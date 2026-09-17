# Database Schema Documentation

Database Name: `skillgap_career_db`  
Technology: **MongoDB** with **Mongoose**

---

## Collections & Indexes

### 1. `users`
Represents registered users.
- `_id`: ObjectId (Primary key)
- `name`: String, required, trim, max 120
- `email`: String, required, unique, lowercase, trim
- `passwordHash`: String, required, `select: false` (never leaked)
- `role`: String, enum: `['user', 'admin']`, default: `'user'`
- `isActive`: Boolean, default: `true`
- `lastLoginAt`: Date
- `createdAt`, `updatedAt`: Timestamps
- **Indexes**: `{ email: 1 }` (unique)

### 2. `profiles`
User profile and educational background.
- `_id`: ObjectId
- `userId`: ObjectId, ref: `'User'`, required, unique
- `phone`: String, trim, max 40
- `location`: String, trim, max 160
- `education`: Array of Subdocuments:
  - `degree`: String
  - `field`: String
  - `institution`: String
  - `graduationYear`: Number
- `experienceLevel`: String, enum: `['student', 'entry', 'junior', 'mid', 'senior', 'lead']`
- `yearsOfExperience`: Number, min: 0, max: 60
- `interests`: Array of String
- `preferredCareerIds`: Array of ObjectId (ref: `'Career'`)
- `preferredDomains`: Array of String
- `careerGoal`: String, max 500
- `bio`: String, max 1000
- **Indexes**: `{ userId: 1 }` (unique)

### 3. `skills`
Standardized skill catalog extracted from ESCO v1.2.1.
- `_id`: ObjectId
- `name`: String, required, max 200
- `slug`: String, required, unique
- `category`: String (`'knowledge'`, `'skill/competence'`)
- `description`: String
- `aliases`: Array of String
- `proficiencyLevels`: Array of String (['Beginner', 'Intermediate', 'Advanced', 'Expert'])
- `isActive`: Boolean, default: `true`
- `source`: String, default: `'ESCO'`
- `sourceId`: String (ESCO URI)
- `sourceVersion`: String (`'1.2.1'`)
- **Indexes**: `{ slug: 1 }` (unique), `{ category: 1 }`, `{ isActive: 1 }`, `{ name: 'text', aliases: 'text' }`

### 4. `careers`
Occupational catalog extracted from ESCO v1.2.1.
- `_id`: ObjectId
- `title`: String, required, max 200
- `slug`: String, required, unique
- `category`: String (e.g. `'Software Development'`, `'Data Science'`)
- `description`: String
- `overview`: String
- `educationRequirements`: Array of String
- `experienceLevels`: Array of String
- `responsibilities`: Array of String
- `source`: String (`'ESCO'`)
- `sourceId`: String (ESCO URI)
- `sourceVersion`: String (`'1.2.1'`)
- `isActive`: Boolean, default: `true`
- **Indexes**: `{ slug: 1 }` (unique), `{ category: 1 }`, `{ isActive: 1 }`, `{ title: 'text', description: 'text' }`

### 5. `careerSkills`
Relationships between careers and their required/preferred skills.
- `_id`: ObjectId
- `careerId`: ObjectId, ref: `'Career'`, required
- `skillId`: ObjectId, ref: `'Skill'`, required
- `requirementType`: String, enum: `['required', 'preferred']`
- `minimumLevel`: Number (1 to 4) — *Application heuristic*
- `importance`: Number (1 to 5) — *Application heuristic*
- `priority`: Number (1 to 5) — *Application heuristic*
- `isCore`: Boolean
- **Indexes**: `{ careerId: 1, skillId: 1 }` (unique), `{ skillId: 1 }`

> [!IMPORTANT]
> **ESCO Heuristic Requirement Mapping Notice:**
> The official raw ESCO `occupationSkillRelations` dataset provides only binary, qualitative relationships: **essential** and **optional**. It does **NOT** provide numerical proficiency scales, importance weights, or learning priorities.
>
> To support deterministic mathematical scoring and gap analysis, Career Compass applies the following transparent **application-level heuristic mapping**:
> - **ESCO Essential Relation**:
>   - `requirementType`: `'required'`
>   - `minimumLevel`: `3` (Advanced operational proficiency on a 1–4 scale)
>   - `importance`: `5` (Maximum critical weighting on a 1–5 scale)
>   - `priority`: `5` (Top learning priority on a 1–5 scale)
>   - `isCore`: `true` (when classified as a skill/competence)
> - **ESCO Optional Relation**:
>   - `requirementType`: `'preferred'`
>   - `minimumLevel`: `2` (Intermediate working proficiency on a 1–4 scale)
>   - `importance`: `2` (Secondary weighting on a 1–5 scale)
>   - `priority`: `2` (Secondary priority on a 1–5 scale)
>   - `isCore`: `false`
>
> These numeric metrics are application engineering heuristics and must **never** be cited as official ESCO attributes. The original source provenance is strictly retained via `source='ESCO'`, `sourceId` (official ESCO Concept URI), and `sourceVersion='1.2.1'`.


### 6. `userSkills`
User's recorded technical and professional skills.
- `_id`: ObjectId
- `userId`: ObjectId, ref: `'User'`, required
- `skillId`: ObjectId, ref: `'Skill'`, required
- `proficiencyLevel`: Number (1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert)
- `source`: String, enum: `['manual', 'resume', 'assessment', 'ai_suggested']`
- `confidence`: Number (0 to 1)
- `yearsOfExperience`: Number
- `evidence`: Array of String
- `verified`: Boolean
- `lastAssessedAt`: Date
- **Indexes**: `{ userId: 1, skillId: 1 }` (unique), `{ userId: 1 }`

### 7. `analyses`
Historical skill-gap evaluation results.
- `_id`: ObjectId
- `userId`: ObjectId, ref: `'User'`, required
- `careerId`: ObjectId, ref: `'Career'`, required
- `careerTitle`: String
- `overallMatchScore`: Number (0 to 100)
- `matchClassification`: String ('Strong Match', 'Moderate Match', 'Partial Match', 'Low Match')
- `skillCoverage`: Number (0 to 100)
- `matchedSkills`: Array of SkillResult
- `weakSkills`: Array of SkillResult
- `missingSkills`: Array of SkillResult
- `strengths`: Array of String
- `recommendations`: Array of String
- `aiSummary`: String
- `aiMetadata`: Object (`provider`, `model`, `generatedAt`, `available`, `reason`)
- `algorithmVersion`: String
- `status`: String (`'pending'`, `'completed'`, `'failed'`)
- **Indexes**: `{ userId: 1, createdAt: -1 }`, `{ careerId: 1 }`

### 8. `learningResources`
Curated educational materials linked to skills.
- `_id`: ObjectId
- `skillId`: ObjectId, ref: `'Skill'`, required
- `title`: String, required
- `description`: String
- `resourceType`: String (`'course'`, `'documentation'`, `'tutorial'`, `'video'`, etc.)
- `url`: String, required
- `provider`: String
- `difficulty`: String (`'beginner'`, `'intermediate'`, `'advanced'`)
- `estimatedHours`: Number
- `isFree`: Boolean
- `language`: String
- `qualityScore`: Number
- `isActive`: Boolean
- **Indexes**: `{ skillId: 1, url: 1 }` (unique), `{ skillId: 1, isActive: 1 }`

### 9. `roadmaps`
Personalized milestone learning paths.
- `_id`: ObjectId
- `userId`: ObjectId, ref: `'User'`, required
- `analysisId`: ObjectId, ref: `'Analysis'`, required
- `careerId`: ObjectId, ref: `'Career'`, required
- `title`: String, required
- `objective`: String
- `stages`: Array of Stages (`stageNumber`, `title`, `skillId`, `skillName`, `priority`, `reason`, `estimatedHours`, `resources[]`, `projects[]`, `completed`)
- `totalEstimatedHours`: Number
- `progressPercentage`: Number (0 to 100)
- `status`: String (`'not_started'`, `'in_progress'`, `'completed'`)
- **Indexes**: `{ userId: 1, createdAt: -1 }`

### 10. `sessions`
Secure server-side user sessions.
- `_id`: ObjectId
- `sessionId`: String, required, unique
- `userId`: ObjectId, ref: `'User'`, required
- `expiresAt`: Date, required
- `lastAccessedAt`: Date
- `userAgent`: String
- **Indexes**: `{ sessionId: 1 }` (unique), `{ userId: 1 }`, `{ expiresAt: 1 }` (TTL: expireAfterSeconds: 0)

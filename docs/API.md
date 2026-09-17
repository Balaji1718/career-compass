# API Reference

All responses follow a consistent envelope structure:

### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-facing message",
    "details": []
  }
}
```

---

## Authentication Endpoints

### `POST /api/auth/register`
- **Auth**: Public
- **Body**: `{ "name": "...", "email": "...", "password": "...", "confirmPassword": "..." }`
- **Response**: `201 Created` with `{ user }` + `Set-Cookie` session header.

### `POST /api/auth/login`
- **Auth**: Public
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK` with `{ user }` + `Set-Cookie` session header.

### `POST /api/auth/logout`
- **Auth**: Authenticated
- **Response**: `200 OK` with `{ loggedOut: true }` + Cleared cookie.

### `GET /api/auth/me`
- **Auth**: Public / Optional session
- **Response**: `200 OK` with `{ user, profile }` (user is null if not authenticated).

---

## Profile Endpoints

### `GET /api/profile`
- **Auth**: Required
- **Response**: `200 OK` with `{ profile, user }`.

### `PUT /api/profile`
- **Auth**: Required
- **Body**: `{ name, phone, location, education, experienceLevel, yearsOfExperience, interests, preferredDomains, careerGoal, bio }`
- **Response**: `200 OK` with updated `{ profile, user }`.

---

## Skills Endpoints

### `GET /api/skills`
- **Auth**: Public / Authenticated
- **Query**: `search`, `category`, `page`, `limit`
- **Response**: `200 OK` with `{ skills }`.

### `GET /api/skills/categories`
- **Auth**: Public
- **Response**: `200 OK` with `{ categories: string[] }`.

### `GET /api/user-skills`
- **Auth**: Required
- **Response**: `200 OK` with `{ userSkills: [] }`.

### `POST /api/user-skills`
- **Auth**: Required
- **Body**: `{ skillId, proficiencyLevel, source, yearsOfExperience, evidence }`
- **Response**: `201 Created` with `{ userSkill }`.

### `PUT /api/user-skills/:id`
- **Auth**: Required
- **Body**: `{ proficiencyLevel, yearsOfExperience, verified }`
- **Response**: `200 OK` with `{ userSkill }`.

### `DELETE /api/user-skills/:id`
- **Auth**: Required
- **Response**: `200 OK` with `{ deleted: true }`.

---

## Careers Endpoints

### `GET /api/careers`
- **Auth**: Public / Authenticated
- **Query**: `search`, `category`, `page`, `limit`
- **Response**: `200 OK` with `{ careers }` (includes match score if user is authenticated).

### `GET /api/careers/categories`
- **Auth**: Public
- **Response**: `200 OK` with `{ categories: string[] }`.

### `GET /api/careers/:id`
- **Auth**: Public / Authenticated
- **Response**: `200 OK` with `{ career, requirements, match }`.

---

## Recommendations Endpoints

### `GET /api/recommendations/careers`
- **Auth**: Required
- **Query**: `limit` (default 10, max 25)
- **Response**: `200 OK` with `{ recommendations, skillCount, algorithmVersion }`.

---

## Analyses Endpoints

### `POST /api/analyses`
- **Auth**: Required
- **Body**: `{ careerId: ObjectId }`
- **Response**: `201 Created` with `{ analysis }`.

### `GET /api/analyses`
- **Auth**: Required
- **Query**: `page`, `limit`
- **Response**: `200 OK` with `{ analyses: [] }`.

### `GET /api/analyses/:id`
- **Auth**: Required
- **Response**: `200 OK` with `{ analysis, roadmap }`.

---

## Roadmaps Endpoints

### `POST /api/roadmaps`
- **Auth**: Required
- **Body**: `{ analysisId: ObjectId, maxStages?: number }`
- **Response**: `201 Created` with `{ roadmap }`.

### `GET /api/roadmaps`
- **Auth**: Required
- **Query**: `page`, `limit`
- **Response**: `200 OK` with `{ roadmaps: [] }`.

### `GET /api/roadmaps/:id`
- **Auth**: Required
- **Response**: `200 OK` with `{ roadmap }`.

### `PUT /api/roadmaps/:id`
- **Auth**: Required
- **Body**: `{ stages: [{ stageNumber: number, completed: boolean }] }`
- **Response**: `200 OK` with `{ roadmap }` (recalculates progress server-side).

---

## Dashboard Endpoint

### `GET /api/dashboard`
- **Auth**: Required
- **Response**: `200 OK` with `{ user, skillCount, topSkills, latestAnalysis, topRecommendations, activeRoadmap, aiConfigured }`.

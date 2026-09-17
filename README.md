# Career Compass

PROJECT NAME:

AI-BASED SKILL GAP ANALYSIS AND CAREER RECOMMENDATION SYSTEM

============================================================

CRITICAL INSTRUCTION — BUILD THE COMPLETE PROJECT IN ONE PASS

============================================================

This is a COMPLETE IMPLEMENTATION request.

I have limited Lovable credits, so do NOT split the implementation into multiple phases, do NOT stop after architecture planning, and do NOT ask me to approve intermediate steps.

Build the complete working application in this single task.

Before coding, internally analyze the entire specification and create the architecture/database/API plan, then implement the complete application in the same task.

Do not respond with only a plan.

The final result must be a working, runnable project.

Do not silently remove requirements.

Do not substitute technologies.

Do not introduce technologies outside this contract unless technically unavoidable; if something is unavoidable, preserve the core stack and explain it in README.md.

============================================================

1. FIXED TECHNOLOGY STACK — ABSOLUTE

============================================================

FRONTEND

---------

React.js

Vite

JavaScript

BACKEND

-------

Node.js

Express.js

JavaScript

DATABASE

--------

MongoDB

Mongoose

CRITICAL LANGUAGE RULE

----------------------

USE JAVASCRIPT ONLY.

TYPESCRIPT IS STRICTLY PROHIBITED.

Never create:

- .ts

- .tsx

- tsconfig.json

- TypeScript interfaces

- TypeScript types

- Type aliases

- Type definitions

Do not convert any existing or newly created file to TypeScript.

Use:

- .js

- .jsx

Only.

Do not use TypeScript-based templates.

============================================================

2. TOP-LEVEL FOLDER STRUCTURE

============================================================

The project MUST contain:

/

├── frontend/

├── backend/

├── docs/

├── .env.example

├── .gitignore

├── package.json

└── README.md

Frontend source code must remain inside:

/frontend

Backend source code must remain inside:

/backend

Documentation must remain inside:

/docs

Do not mix backend and frontend source files.

============================================================

3. SINGLE-SERVER ARCHITECTURE

============================================================

The application MUST operate as a SINGLE SERVER and SINGLE USER-FACING ORIGIN.

Required architecture:

Browser

   ↓

Express Server

   ├── /api/*

   └── React/Vite application

Development:

npm run dev

must start the complete application without requiring:

Terminal 1 → frontend

Terminal 2 → backend

Do not require manually starting two separate servers.

Use Express with Vite integration/middleware in development whenever practical so Vite HMR continues to work.

Frontend changes must use Vite HMR.

Backend JavaScript changes must automatically restart using an appropriate Node development watcher.

Production:

Express must serve the built React application.

Expected production architecture:

Express

├── /api/*

├── frontend assets

└── React SPA fallback

============================================================

4. PROJECT PURPOSE

============================================================

Build an AI-assisted web application that helps students and early-career users understand:

- their current skills

- their skill proficiency

- careers suitable for their profile

- skills required by those careers

- matched skills

- weak skills

- missing skills

- career compatibility

- skill gaps

- recommended skills to learn

- personalized learning roadmap

The application must be useful even when AI is unavailable.

AI is an enhancement layer, not the foundation of the application's deterministic functionality.

============================================================

5. PROBLEM STATEMENT

============================================================

Students and early-career job seekers often know what technologies they have learned but do not clearly understand how those skills align with real career requirements.

They may not know:

- which careers best match their current profile

- which important skills they are missing

- which skills are weak

- which skills should be learned first

- how large their gap is for a particular career

- what learning path they should follow

Many existing career systems provide generic recommendations rather than performing a structured comparison between the user's current skills and standardized career requirements.

This project solves that problem by creating a structured skill/career knowledge base, calculating deterministic career-skill compatibility, identifying skill gaps, and using AI to provide personalized explanations and learning recommendations.

============================================================

6. MAIN OBJECTIVE

============================================================

Develop a web-based AI-assisted career guidance platform that:

1. creates a structured user profile

2. records user skills and proficiency

3. maintains a standardized career and skill database

4. maps careers to required/preferred skills

5. compares user skills against career requirements

6. calculates deterministic skill-gap and career-match scores

7. recommends suitable careers

8. explains the recommendations using AI

9. recommends missing skills to learn

10. generates a personalized learning roadmap

11. stores analysis history

12. functions without mandatory paid services

============================================================

7. CORE FUNCTIONAL MODULES

============================================================

Implement all of the following.

A. Authentication

-----------------

- Registration

- Login

- Logout

- Current authenticated user

- Persistent session restoration

- Protected routes

- Secure password hashing

- Secure session handling

- HTTP-only cookies

- Authentication middleware

Required behavior:

Login

↓

session established

↓

refresh page

↓

still logged in

Close browser

↓

reopen application

↓

restore valid session

Logout

↓

session explicitly terminated

Never store passwords in plain text.

Never expose password hashes to frontend responses.

Do not store authentication secrets in localStorage.

B. User Profile

---------------

Allow users to maintain:

- name

- email

- phone (optional)

- location (optional)

- education

- degree

- specialization/field

- institution

- graduation year

- experience level

- years of experience

- career interests

- preferred career domains

- career goal

- short bio

Education must support multiple education records.

C. Skills

---------

Users must be able to:

- search skills

- add skills

- remove skills

- assign proficiency

- update proficiency

- review skill source

Proficiency levels:

1 = Beginner

2 = Intermediate

3 = Advanced

4 = Expert

User skill sources may include:

- manual

- resume

- assessment

- ai_suggested

AI-suggested skills must never automatically become trusted skills without appropriate user review.

D. Career Discovery

-------------------

Display careers from the structured database.

Allow:

- career search

- career category filtering

- career detail

- required skills

- preferred skills

- education requirements

- experience level

- related careers

E. Skill Gap Analysis

---------------------

This is the primary feature.

User selects a career.

The system compares:

User Skills

VS

Career Required Skills

Determine:

- matched skills

- weak skills

- missing skills

- skill-by-skill match

- overall career match score

- strengths

- priority gaps

The calculation must be deterministic.

AI must NEVER directly decide the numeric match score.

F. Career Recommendations

-------------------------

Provide ranked career recommendations based on deterministic matching.

For example:

1. Full Stack Developer — 86%

2. Frontend Developer — 82%

3. Backend Developer — 78%

These percentages must be produced by application logic.

AI can then explain why those careers are recommended.

Do not allow AI to arbitrarily invent the final ranking.

G. Learning Recommendations

----------------------------

For missing or weak skills:

- identify priority

- explain why the skill matters

- suggest a learning sequence

- suggest projects/practice

- suggest free learning resources

H. Personalized Roadmap

-----------------------

Generate a roadmap based on the skill gaps.

Each roadmap stage should contain:

- stage number

- title

- target skill

- priority

- reason

- estimated hours

- recommended resources

- project/practice suggestions

- completion status

Allow the user to mark roadmap stages complete.

I. Analysis History

-------------------

Store completed analyses.

Users must be able to:

- view previous analyses

- open an analysis

- view score

- view matched skills

- view missing skills

- view recommendations

- view generated roadmap

J. Dashboard

------------

Create a useful dashboard showing:

- current skill count

- strongest skills

- weak skills

- latest career match

- top career recommendations

- current roadmap progress

- recent analyses

============================================================

8. DETERMINISTIC SKILL-GAP ENGINE

============================================================

This is one of the most important requirements.

Do NOT ask the AI to calculate the main score.

Implement the skill-gap engine in normal JavaScript.

Career requirements are defined by careerSkills records containing:

- minimumLevel

- importance

- requirementType

- priority

- isCore

User skill level:

1–4

Conceptual weighted calculation:

For each career skill:

requiredLevel = careerSkills.minimumLevel

userLevel = matching user skill proficiency

If user does not have the skill:

skillMatch = 0

If userLevel >= requiredLevel:

skillMatch = 1

Otherwise:

skillMatch = userLevel / requiredLevel

Weighted score:

sum(skillMatch × importance)

-------------------------------- × 100

sum(importance)

Round to a sensible decimal precision.

Also calculate:

- matched skills

- weak skills

- missing skills

- skill coverage

Classification:

80–100 = Strong Match

60–79 = Moderate Match

40–59 = Partial Match

0–39 = Low Match

Keep these values configurable in one business-logic module.

Do not duplicate scoring formulas throughout the application.

Store an algorithm version with each analysis.

============================================================

9. CAREER RECOMMENDATION ALGORITHM

============================================================

For career recommendations:

1. retrieve active careers

2. retrieve career skill requirements

3. retrieve the user's skills

4. calculate deterministic compatibility score

5. rank careers by score

6. return top recommendations

7. optionally pass those deterministic results to AI for explanation

Do NOT call the AI to determine the primary score.

AI should explain already-calculated results.

============================================================

10. AI ARCHITECTURE

============================================================

NEVER call AI directly from React.

Required:

Frontend

   ↓

Express API

   ↓

AI Service

   ↓

Provider Adapter

   ├── OpenRouter Adapter

   └── NVIDIA Adapter

Create provider-independent AI service functions such as:

- generateCareerExplanation()

- generateLearningRecommendations()

- generateLearningRoadmap()

- analyzeResumeText() if resume functionality is implemented

Application code should not contain provider-specific API calls.

Do NOT scatter OpenRouter/NVIDIA code across controllers or React components.

============================================================

11. AI PROVIDERS

============================================================

The project already has:

OPENROUTER_API_KEY

NVIDIA_API_KEY

available as environment variables.

Never hard-code either key.

Never expose either key to the frontend.

Never use:

VITE_OPENROUTER_API_KEY

VITE_NVIDIA_API_KEY

Private AI keys must remain server-side.

Create configurable provider adapters.

Primary preference:

OpenRouter

Fallback:

NVIDIA

If both fail:

deterministic/non-AI functionality must still work.

Do not make the application unusable because the AI provider is unavailable.

============================================================

12. AI FAILURE HANDLING

============================================================

Gracefully handle:

- timeout

- quota exceeded

- rate limiting

- provider unavailable

- malformed response

- invalid JSON

- empty response

- network failure

- provider authentication failure

Never expose:

- raw provider errors

- stack traces

- internal exception messages

Return user-readable messages such as:

"AI recommendations are temporarily unavailable. Your skill analysis is still available using the built-in matching engine."

============================================================

13. STRUCTURED AI OUTPUT

============================================================

Whenever AI output is used as application data, require structured JSON.

Validate AI output before using it.

Do not trust the model response blindly.

For example:

Career explanation:

{

  "summary": "...",

  "strengths": [],

  "gaps": [],

  "recommendations": []

}

Learning roadmap:

{

  "summary": "...",

  "stages": [

    {

      "title": "...",

      "skill": "...",

      "reason": "...",

      "projectIdeas": [],

      "estimatedHours": 10

    }

  ]

}

If AI returns malformed JSON:

1. attempt safe parsing

2. reject invalid structure

3. use deterministic fallback

4. show a friendly message

5. log server-side safely

Do not display raw AI output when structured output is expected.

============================================================

14. FREE-COST REQUIREMENT

============================================================

Mandatory operating cost target:

₹0

The application must not require a paid service.

Do not introduce:

- paid APIs

- paid databases

- paid authentication

- paid vector databases

- paid resume parsers

- paid email services

as mandatory dependencies.

Any paid provider must remain optional.

The application must remain useful without paid services.

============================================================

15. MONGODB DATABASE

============================================================

Database:

skillgap_career_db

Use Mongoose.

The application database model must contain the following collections:

1. users

2. profiles

3. skills

4. careers

5. careerSkills

6. userSkills

7. analyses

8. learningResources

9. roadmaps

10. sessions

Do not create unrelated collections unless truly necessary.

Create appropriate Mongoose schemas.

Use timestamps where appropriate.

Use references/ObjectId relationships where appropriate.

============================================================

16. USERS COLLECTION

============================================================

Collection:

users

Fields:

_id

name

email

passwordHash

role

isActive

lastLoginAt

createdAt

updatedAt

Rules:

- email required

- email normalized to lowercase

- email unique

- passwordHash required

- role defaults to user

- isActive defaults to true

- never return passwordHash in API responses

Indexes:

email UNIQUE

============================================================

17. PROFILES COLLECTION

============================================================

Collection:

profiles

Fields:

_id

userId

phone

location

education[]

experienceLevel

yearsOfExperience

interests[]

preferredCareerIds[]

preferredDomains[]

careerGoal

bio

createdAt

updatedAt

Education object:

degree

field

institution

graduationYear

Rules:

One profile per user.

Index:

userId UNIQUE

============================================================

18. SKILLS COLLECTION

============================================================

Collection:

skills

Fields:

_id

name

slug

category

description

aliases[]

proficiencyLevels[]

isActive

source

sourceId

sourceVersion

createdAt

updatedAt

Rules:

- name required

- slug required

- slug unique

- source may be ESCO

- preserve original ESCO sourceId

- preserve sourceVersion

Indexes:

slug UNIQUE

category

isActive

============================================================

19. CAREERS COLLECTION

============================================================

Collection:

careers

Fields:

_id

title

slug

category

description

overview

educationRequirements[]

experienceLevels[]

responsibilities[]

relatedCareerIds[]

source

sourceId

sourceVersion

isActive

createdAt

updatedAt

Indexes:

slug UNIQUE

category

isActive

============================================================

20. CAREERS ↔ SKILLS COLLECTION

============================================================

Collection:

careerSkills

Fields:

_id

careerId

skillId

requirementType

minimumLevel

importance

priority

isCore

createdAt

updatedAt

requirementType:

required

preferred

minimumLevel:

1

2

3

4

importance:

1–5

Rules:

A career-skill pair must not be duplicated.

Compound UNIQUE index:

careerId + skillId

Also index:

skillId

============================================================

21. USER SKILLS COLLECTION

============================================================

Collection:

userSkills

Fields:

_id

userId

skillId

proficiencyLevel

source

confidence

yearsOfExperience

evidence[]

verified

lastAssessedAt

createdAt

updatedAt

proficiencyLevel:

1–4

source:

manual

resume

assessment

ai_suggested

Rules:

One user should not have duplicate skill records.

Compound UNIQUE index:

userId + skillId

============================================================

22. ANALYSES COLLECTION

============================================================

Collection:

analyses

Fields:

_id

userId

careerId

overallMatchScore

skillCoverage

matchedSkills[]

weakSkills[]

missingSkills[]

strengths[]

recommendations[]

aiSummary

aiMetadata

algorithmVersion

status

createdAt

updatedAt

The analysis must preserve enough information to reproduce/understand the result later.

aiMetadata may contain:

provider

model

generatedAt

Do not store API keys.

status:

pending

completed

failed

Indexes:

userId + createdAt

careerId

============================================================

23. LEARNING RESOURCES COLLECTION

============================================================

Collection:

learningResources

Fields:

_id

skillId

title

description

resourceType

url

provider

difficulty

estimatedHours

isFree

language

qualityScore

isActive

createdAt

updatedAt

resourceType:

course

documentation

tutorial

video

article

book

practice

project

Resources should prioritize free resources.

Do not fabricate URLs.

============================================================

24. ROADMAPS COLLECTION

============================================================

Collection:

roadmaps

Fields:

_id

userId

analysisId

careerId

title

objective

stages[]

totalEstimatedHours

progressPercentage

status

createdAt

updatedAt

Stage fields:

stageNumber

title

skillId

priority

reason

estimatedHours

resources[]

projects[]

completed

status:

not_started

in_progress

completed

============================================================

25. SESSIONS COLLECTION

============================================================

Collection:

sessions

Fields:

_id

sessionId

userId

expiresAt

createdAt

lastAccessedAt

userAgent

Indexes:

sessionId UNIQUE

userId

expiresAt TTL

Use secure HTTP-only cookies.

============================================================

26. DATABASE RELATIONSHIPS

============================================================

Implement these relationships:

users._id

↓

profiles.userId

users._id

↓

userSkills.userId

skills._id

↓

userSkills.skillId

careers._id

↓

careerSkills.careerId

skills._id

↓

careerSkills.skillId

users._id

↓

analyses.userId

careers._id

↓

analyses.careerId

analyses._id

↓

roadmaps.analysisId

careers._id

↓

roadmaps.careerId

users._id

↓

roadmaps.userId

skills._id

↓

learningResources.skillId

users._id

↓

sessions.userId

============================================================

27. ESCO DATASET INTEGRATION

============================================================

A local ESCO v1.2.1 English CSV classification dataset is provided with the project.

Use that provided dataset as the authoritative master source for the career/skill knowledge base.

Do NOT download another ESCO version.

Do NOT replace the provided data.

Do NOT modify the original source files.

Primary files include:

- occupations_en.csv

- skills_en.csv

- occupationSkillRelations_en.csv

- skillGroups_en.csv

- skillsHierarchy_en.csv

First inspect the actual CSV headers and structure.

Do not guess column names.

Create a data-ingestion/processing pipeline in JavaScript.

Do NOT blindly import the entire ESCO dataset.

Select a practical IT/software-focused subset from the provided ESCO dataset based on actual ESCO data.

Relevant domains can include:

- software development

- web development

- frontend

- backend

- full-stack

- data analysis

- data engineering

- data science

- machine learning

- artificial intelligence

- cloud

- DevOps

- cybersecurity

- testing/QA

- databases

- systems analysis

- business analysis

- UI/UX where supported by actual source data

The actual selected occupations MUST come from the provided ESCO dataset.

Do not invent occupation names that are not supported by the source data.

Do not invent career-skill relationships.

============================================================

28. ESCO → APPLICATION MAPPING

============================================================

Map:

occupations_en.csv

→ careers

skills_en.csv

→ skills

occupationSkillRelations_en.csv

→ careerSkills

Use:

source = "ESCO"

sourceVersion = "1.2.1"

Preserve ESCO identifiers using:

sourceId

Do not discard source identifiers.

Normalize/deduplicate skills where appropriate.

Use aliases and normalized slugs.

The original source files must remain unchanged.

============================================================

29. ESCO SEEDING

============================================================

Create deterministic seed files and a repeatable JavaScript seed process.

Recommended structure:

backend/

└── src/

    └── seeds/

        ├── careers.json

        ├── skills.json

        ├── careerSkills.json

        └── learningResources.json

Create a repeatable command such as:

npm run seed

The seed process must be idempotent.

Running the seed multiple times must NOT create duplicate careers, skills or career-skill mappings.

Use sourceId and/or unique slugs to safely upsert master data.

The seed process should report:

- careers inserted/updated

- skills inserted/updated

- careerSkills inserted/updated

- learningResources inserted/updated

Do not insert normal user accounts through the seed script unless explicitly required for development/testing.

============================================================

30. LEARNING RESOURCE DATA

============================================================

Learning resources are not assumed to come from ESCO.

Create a separate curated set of FREE resources.

Do not invent URLs.

Only use verified/valid URLs available to the agent or already provided by the project.

Resources should prioritize:

- official documentation

- free tutorials

- free courses

- free practice resources

- open educational material

- project-based learning

Set:

isFree = true

for resources that are confirmed free to access.

============================================================

31. RESUME FEATURE

============================================================

Implement resume upload only if it can be completed reliably within the current project constraints.

Accept sensible common formats such as:

PDF

DOCX

Provide:

- file validation

- size validation

- safe error handling

- upload progress/loading state

- empty state

- error state

- retry where appropriate

If reliable local text extraction is supported, extract text server-side.

Then optionally use AI to identify candidate skills.

AI-extracted skills must be presented for user review before being saved as trusted user skills.

Do not make resume parsing a hard dependency for the main application.

The system must work perfectly through manual skill entry even if resume processing is unavailable.

============================================================

32. API ARCHITECTURE

============================================================

Use Express routes/controllers/services/middleware.

Organize approximately as:

backend/src/

├── config/

├── models/

├── controllers/

├── routes/

├── services/

├── middleware/

├── validators/

├── utils/

├── seeds/

└── server.js

Create API endpoints approximately covering:

Authentication:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET  /api/auth/me

Profile:

GET  /api/profile

PUT  /api/profile

Skills:

GET  /api/skills

GET  /api/skills/:id

POST /api/user-skills

PUT  /api/user-skills/:id

DELETE /api/user-skills/:id

Careers:

GET /api/careers

GET /api/careers/:id

Analysis:

POST /api/analyses

GET /api/analyses

GET /api/analyses/:id

Recommendations:

GET /api/recommendations/careers

Roadmaps:

POST /api/roadmaps

GET /api/roadmaps

GET /api/roadmaps/:id

PUT /api/roadmaps/:id

Learning resources:

GET /api/learning-resources

Use appropriate route names if a cleaner equivalent is needed, but preserve the same functional coverage.

============================================================

33. API ERROR FORMAT

============================================================

Use one consistent error structure.

Example:

{

  "success": false,

  "error": {

    "code": "ANALYSIS_FAILED",

    "message": "Unable to complete the skill analysis. Please try again."

  }

}

Success response example:

{

  "success": true,

  "data": {}

}

Never expose raw exceptions or stack traces.

Use centralized error middleware.

============================================================

34. VALIDATION

============================================================

Validate:

- registration input

- login input

- email format

- password requirements

- profile input

- skill IDs

- proficiency levels

- career IDs

- analysis requests

- roadmap requests

- uploaded files

Reject malformed ObjectIds.

Reject invalid enum values.

Reject unauthorized resource access.

============================================================

35. OWNERSHIP AND AUTHORIZATION

============================================================

A user must only be able to access their own:

- profile

- userSkills

- analyses

- roadmaps

- sessions

Do not rely only on frontend route protection.

Enforce ownership in backend authorization.

Never allow:

GET /api/analyses/:id

to return another user's private analysis.

============================================================

36. FRONTEND ROUTES

============================================================

Create a professional responsive React application with routes approximately:

/

 /login

 /register

 /dashboard

 /profile

 /skills

 /careers

 /careers/:id

 /analysis

 /analysis/:id

 /recommendations

 /roadmap

 /roadmap/:id

 /history

 /settings

Implement protected routes where required.

Unauthenticated users should not access protected application pages.

Authenticated users should not unnecessarily return to login during refresh/session restoration.

============================================================

37. FRONTEND PAGES

============================================================

LANDING PAGE

------------

Explain:

- what the platform does

- skill-gap concept

- career recommendation

- personalized roadmap

- CTA to get started

LOGIN

-----

Clean form

Validation

Loading state

Error handling

Success redirect

REGISTER

--------

Name

Email

Password

Confirm password

Validation

Loading

Success

Error

DASHBOARD

---------

Show:

- welcome section

- skill count

- strongest skills

- latest analysis

- top career matches

- gap summary

- roadmap progress

- quick actions

PROFILE

-------

Editable:

- personal information

- education

- experience

- interests

- career goals

SKILLS

------

Allow:

- search

- filter

- add

- edit proficiency

- remove

- review source

CAREERS

-------

Search and category filter.

Career cards should show:

- career title

- category

- brief description

- match score where available

CAREER DETAILS

--------------

Show:

- overview

- required skills

- preferred skills

- education

- responsibilities

- related careers

ANALYSIS PAGE

-------------

Allow user to choose a career and run analysis.

Show:

- overall score

- classification

- strengths

- matched skills

- weak skills

- missing skills

- priority gaps

- recommendation summary

RECOMMENDATIONS

---------------

Show ranked careers.

Each recommendation should include:

- score

- match classification

- strongest matching factors

- major gaps

HISTORY

-------

Show previous analyses with:

- date

- career

- score

- status

ROADMAP

-------

Show:

- overall progress

- stages

- target skills

- hours

- resources

- projects

- completion controls

============================================================

38. ASYNC UX STATE REQUIREMENTS

============================================================

Every asynchronous operation MUST have appropriate states:

IDLE

LOADING

SUCCESS

EMPTY

ERROR

Also:

RETRY where appropriate

OFFLINE handling where appropriate

Examples:

Skills loading:

"Loading your skills..."

Empty:

"You haven't added any skills yet."

Error:

"We couldn't load your skills."

Button:

"Try Again"

Analysis loading:

"Analyzing your skill profile..."

AI unavailable:

"AI assistance is temporarily unavailable. Your deterministic skill analysis is still available."

Never show:

undefined

null

raw exception

stack trace

translation/localization keys

internal API errors

============================================================

39. FRONTEND ERROR BOUNDARY

============================================================

Implement a React error boundary.

If a page/component crashes:

Show a useful recovery screen:

"Something went wrong."

Provide:

Reload / Try Again

Do not expose technical stack traces.

============================================================

40. DESIGN / UI / UX

============================================================

Create a professional academic-project-quality dashboard.

Style should feel like:

Modern

Clean

Professional

Accessible

Responsive

Use consistent:

- typography

- spacing

- buttons

- cards

- forms

- status badges

- progress indicators

- charts where useful

The UI should clearly communicate:

Skill Match

Skill Gap

Career Recommendation

Learning Roadmap

Avoid making the application look like a generic chatbot.

AI should feel like one component of the product rather than the entire product.

============================================================

41. ACCESSIBILITY

============================================================

Use:

- semantic HTML

- keyboard accessibility

- form labels

- visible focus states

- accessible buttons

- appropriate ARIA where needed

- readable contrast

- mobile responsiveness

============================================================

42. SECURITY

============================================================

Never hard-code:

- API keys

- MongoDB credentials

- passwords

- session secrets

- private service credentials

Use:

.env

and provide:

.env.example

with placeholders only.

Update:

.gitignore

to exclude:

.env

.env.local

node_modules

build output

logs

temporary uploads

generated secrets

Use secure HTTP-only cookies.

Use appropriate cookie security in production.

Validate all backend input.

Protect API routes.

Prevent unauthorized resource access.

============================================================

43. ENVIRONMENT VARIABLES

============================================================

Provide .env.example containing:

NODE_ENV=development

PORT=3000

MONGODB_URI=

SESSION_SECRET=

OPENROUTER_API_KEY=

NVIDIA_API_KEY=

If additional variables are genuinely required, add them to .env.example and document them.

Do NOT create frontend public environment variables for private AI keys.

============================================================

44. ROOT PACKAGE SCRIPTS

============================================================

The project MUST support:

npm install

npm run dev

npm run build

Provide a production start command such as:

npm start

The root scripts must make the single-server workflow easy.

Preferred development experience:

npm run dev

starts the complete application.

Do not require:

npm run frontend

npm run backend

as mandatory user steps.

============================================================

45. BACKEND DEVELOPMENT WATCHER

============================================================

Backend changes must automatically restart.

Use an appropriate development watcher such as nodemon or the Node runtime's supported watch mode.

Frontend changes must use Vite HMR.

============================================================

46. DATABASE INITIALIZATION

============================================================

The application must connect to:

MONGODB_URI

through Mongoose.

Do not hard-code the database connection.

Database initialization should be clean and reusable.

Indexes should be created through Mongoose schema configuration or appropriate initialization.

============================================================

47. DOCUMENTATION — MANDATORY

============================================================

Create:

README.md

docs/ARCHITECTURE.md

docs/DATABASE_SCHEMA.md

docs/API.md

docs/LOCAL_SETUP.md

docs/TESTING.md

docs/AI_ARCHITECTURE.md

README.md must include:

- project purpose

- features

- exact stack

- installation

- environment setup

- development command

- production command

- database setup

- seed command

- testing

- known limitations

ARCHITECTURE.md must explain:

Browser

↓

Express

├── API

├── AI service

├── business logic

└── MongoDB/Mongoose

↓

React/Vite

DATABASE_SCHEMA.md must document:

- all collections

- fields

- data types

- required rules

- relationships

- indexes

- timestamps

- ownership

- lifecycle

- seed strategy

- sample documents

API.md must document:

- endpoint

- method

- authentication

- request

- response

- validation

- errors

LOCAL_SETUP.md must document:

- Node version

- npm install

- MongoDB Atlas connection

- environment variables

- npm run dev

- npm run seed

- npm run build

- npm start

TESTING.md must document the test strategy and coverage.

AI_ARCHITECTURE.md must document:

Frontend

→ Express

→ AI Service

→ provider adapters

→ OpenRouter/NVIDIA

→ validation

→ fallback

============================================================

48. TESTING

============================================================

Create appropriate JavaScript tests.

Do not modify tests simply to force them to pass.

Cover:

Authentication:

- registration

- login

- logout

- session persistence

- unauthorized access

Database:

- connection

- model validation

- indexes where practical

API:

- success responses

- validation

- unauthorized access

- ownership protection

- error responses

Business logic:

- skill matching

- weak skill calculation

- missing skill calculation

- career score

- career ranking

Frontend:

- route protection

- loading states

- empty states

- error states

- user interactions

AI:

- provider success

- provider failure

- timeout

- malformed JSON

- empty response

- fallback to another provider

- no-AI fallback

Resume:

- if implemented, test upload validation and failure handling

============================================================

49. NO-AI FALLBACK

============================================================

If OpenRouter and NVIDIA both fail:

The application MUST still allow:

- login

- profile

- skills

- career browsing

- skill-gap calculation

- career ranking

- analysis history

- basic roadmap generation based on deterministic rules

Display:

"AI assistance is temporarily unavailable. Your core skill analysis is still available."

Do not block the complete application because AI is unavailable.

============================================================

50. DETERMINISTIC FALLBACK ROADMAP

============================================================

If AI is unavailable when generating a learning roadmap:

Create a deterministic roadmap from missing/weak skills.

Order by:

1. importance

2. skill gap

3. priority

4. reasonable dependency order where available

Each stage should contain:

- skill

- priority

- reason

- estimated effort

- generic project suggestion

The roadmap must still be useful.

============================================================

51. DATA NORMALIZATION

============================================================

Normalize skill names for matching.

Examples of aliases should resolve consistently when appropriate:

JS

Javascript

ECMAScript

→ JavaScript

Do not create duplicate skill records for the same standardized skill.

Use:

slug

aliases

sourceId

to help normalization.

============================================================

52. PERFORMANCE

============================================================

Avoid unnecessary database queries.

Use:

- appropriate indexes

- lean queries where suitable

- pagination for history/resources/career lists

- controlled payload sizes

Do not load the entire ESCO dataset into memory for normal user requests.

Seed processing may use streaming/chunked processing if necessary.

============================================================

53. SEED SAFETY

============================================================

Seed operations must be safe to rerun.

Do not duplicate:

- careers

- skills

- careerSkills

- learningResources

Use deterministic identifiers/slugs/source IDs for upsert logic.

============================================================

54. FILE MANAGEMENT

============================================================

If resume upload is implemented:

- validate MIME type

- validate extension

- enforce file size limit

- never trust filename

- never expose local server file paths

- clean up temporary files

- do not store sensitive files unnecessarily

- never put uploaded files under frontend public assets

============================================================

55. NO SAMPLE DATA

============================================================

Do NOT use MongoDB sample datasets.

Use:

- provided ESCO dataset

- controlled learning resources

- application-generated user data

============================================================

56. NO FAKE FUNCTIONALITY

============================================================

Do not create fake:

- API success messages

- fake database results

- fake AI responses

- fake career scores

- fake loading that never performs work

- fake "connected" indicators

Every major feature must be connected to real backend logic.

============================================================

57. NO PLACEHOLDER CORE FEATURES

============================================================

Do not leave important features as:

"Coming soon"

or dummy buttons.

The following must actually work:

- registration

- login

- logout

- session restoration

- profile

- skills

- career browsing

- career details

- skill-gap analysis

- career ranking

- analysis history

- roadmap

- AI assistance

- AI fallback

- seed process

============================================================

58. IMPLEMENTATION ORDER

============================================================

Internally follow this order:

1. initialize project structure

2. configure root scripts

3. configure frontend

4. configure backend

5. configure Express + Vite single server

6. configure environment handling

7. configure MongoDB/Mongoose

8. implement schemas

9. implement indexes

10. implement seed pipeline

11. process provided ESCO dataset

12. create master career/skill data

13. implement authentication

14. implement profile

15. implement skill management

16. implement career browsing

17. implement deterministic skill-gap engine

18. implement recommendations

19. implement AI service

20. implement OpenRouter adapter

21. implement NVIDIA adapter

22. implement AI validation/fallback

23. implement roadmap

24. implement analysis history

25. implement frontend screens

26. implement loading/empty/error/offline states

27. implement security middleware

28. implement tests

29. build frontend

30. verify complete application

31. write documentation

All of this must be completed in this single task.

============================================================

59. FINAL VERIFICATION

============================================================

Before considering the task complete, verify:

TECH STACK

----------

React

Vite

JavaScript

Node.js

Express.js

MongoDB

Mongoose

No TypeScript exists.

ARCHITECTURE

------------

One server

One user-facing port

Express API

React frontend

Vite HMR

Backend watcher

DATABASE

--------

skillgap_career_db

All required application collections

Indexes

Validation

Relationships

AUTH

----

Registration

Login

Persistent session

Logout

Ownership protection

AI

--

OpenRouter adapter

NVIDIA adapter

Provider replacement

Structured output

Validation

Timeout handling

Quota handling

Malformed output handling

Fallback

CORE LOGIC

----------

Skill matching

Gap calculation

Career ranking

Deterministic scores

Deterministic fallback

DATA

----

Provided ESCO v1.2.1 dataset

No invented ESCO relationships

Idempotent seed

Traceable source IDs

UX

--

Loading

Success

Empty

Error

Retry

Offline where appropriate

Readable errors

SECURITY

--------

No hard-coded secrets

HTTP-only authentication cookies

Input validation

Protected endpoints

BUILD

-----

npm install

npm run dev

npm run build

npm start

DOCUMENTATION

-------------

README.md

docs/ARCHITECTURE.md

docs/DATABASE_SCHEMA.md

docs/API.md

docs/LOCAL_SETUP.md

docs/TESTING.md

docs/AI_ARCHITECTURE.md

============================================================

60. FINAL REPORT

============================================================

When implementation is complete, provide a concise final report containing:

1. Exact technology stack

2. Exact folder structure

3. Exact MongoDB collections

4. Exact environment variables

5. Authentication flow

6. API structure

7. AI architecture

8. ESCO data-processing strategy

9. Seed command

10. Development command

11. Build command

12. Production start command

13. Tests implemented

14. Known limitations

15. Any requirements that could not be fully implemented

IMPORTANT:

Do NOT claim a feature works unless it is actually implemented.

============================================================

FINAL ABSOLUTE RULES

============================================================

DO NOT:

- switch to TypeScript

- create .ts or .tsx

- create tsconfig.json

- switch MongoDB to PostgreSQL

- switch MongoDB to Firebase/Supabase

- expose AI keys to frontend

- call AI directly from React

- require paid services

- use MongoDB sample data

- invent ESCO relationships

- invent fake API results

- invent fake URLs

- use AI for deterministic score calculation

- remove requirements silently

- require two terminals for normal development

- store plaintext passwords

- store sensitive auth tokens insecurely

- expose raw errors

- expose stack traces

DO:

- use JavaScript only

- use React + Vite

- use Node + Express

- use MongoDB + Mongoose

- use one Express server

- preserve Vite HMR

- use secure persistent authentication

- use deterministic skill-gap logic

- use OpenRouter and NVIDIA through provider adapters

- validate AI output

- implement AI fallback

- process the provided ESCO v1.2.1 dataset

- create repeatable seed scripts

- document everything

- test the important workflows

- keep mandatory cost at ₹0

- make the application genuinely runnable

BUILD THE COMPLETE APPLICATION NOW.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f25fab1-a5b7-4b5e-a460-a1d3a84cb022).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

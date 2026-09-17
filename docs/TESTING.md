# Testing Strategy & Verification Report

The system uses Node.js's native test runner (`node --test`) to execute isolated regression and unit test suites across all core components.

---

## Running Tests

Execute the full suite from the project root:
```bash
npm test
```

---

## Test Suites (36 Passing Tests, 0 Failures)

### 1. `backend/tests/escoFilter.test.js` (4 Tests)
- **False-Positive Exclusion**: Verifies that non-ICT occupations (e.g., *Auxiliary nursing and midwifery vocational teacher*, *Audio-visual technician*, *Boom operator*, *Camera operator*, *Performance rental technician*, *Projectionist*, *Recording studio technician*, *Security alarm technician*, *Sound operator*, *Video technician*, *Broadcast technician*) are rejected by the extraction filter.
- **Token-Aware Boundary Matching**: Tests that short keywords (such as `ux`) use word-boundary regexes rather than raw substrings, preventing accidental matching on words like `auxiliary` while preserving legitimate roles like `UX designer` and `User experience analyst`.
- **Core ICT Preservation**: Confirms that software development, data science, cybersecurity, cloud architecture, and DevOps occupations are retained.
- **Application Heuristics Verification**: Verifies that ESCO `essential`/`optional` relations map deterministically to application-level numeric heuristics (`minimumLevel: 3/2`, `importance: 5/2`, `priority: 5/2`) without falsely attributing these numbers to the official ESCO dataset.

### 2. `backend/tests/aiConfig.test.js` (5 Tests)
- **Free Model Default**: Verifies that OpenRouter's model defaults to `openrouter/free`.
- **Optional Fallback Resilience**: Verifies that the NVIDIA adapter is strictly optional and that missing or deprecated keys/models do not crash the application or prevent deterministic operations.
- **Structured Schema Validation**: Validates conformant JSON schemas against Zod models (`careerExplanationSchema`, `roadmapSchema`).
- **Markdown Code Fence Stripping**: Ensures markdown-wrapped JSON (```` ```json ````) is stripped and parsed safely.
- **Error & Schema Mismatch Handling**: Rejects malformed JSON and schema mismatches gracefully without throwing unhandled exceptions.

### 3. `backend/tests/ai.test.js` (5 Tests)
- **Structured AI Validation**: Tests conformant structure validation for career explanation prompts.
- **Code Block Parsing**: Strips and parses code fences safely.
- **Malformed Rejection**: Correctly flags non-JSON outputs as `malformed`.
- **Missing Required Fields**: Correctly flags incomplete payloads as `invalid_structure`.
- **Graceful Fallback**: Ensures `runStructured` returns safe availability states without throwing unhandled exceptions.

### 4. `backend/tests/mongoFallback.test.js` (3 Tests)
- **Error Classification & Credential Masking**: Verifies that authentication and network errors are classified cleanly without leaking database passwords, connection strings, or full URIs in logs.
- **Fallback Prevention on Primary Failure**: Tests that when `ALLOW_LOCAL_MONGO_FALLBACK=false` (default), primary connection failure halts startup and rejects rather than silently switching databases.
- **Production Guard**: Verifies that local fallback is permanently disabled in production mode (`NODE_ENV=production`) even if the flag were set to true.

### 5. `backend/tests/database.test.js` (5 Tests)
- **Email Normalization**: Verifies lowercase conversion and whitespace trimming on User email.
- **Password Masking**: Ensures `passwordHash` is excluded from JSON serialization.
- **Validation Constraints**: Validates required fields on User and Profile models.
- **TTL Index**: Confirms Session collection defines an `expiresAt` TTL index.
- **Compound Index**: Verifies `CareerSkill` compound unique index on `{ careerId, skillId }`.

### 6. `backend/tests/api.test.js` (4 Tests)
- **Validation Errors**: Tests registration password strength and 422 `VALIDATION_ERROR` response.
- **Unauthorized Guard**: Confirms unauthenticated access to `/api/profile` returns 401.
- **Auth Lifecycle**: Validates registration -> cookie session -> `/api/auth/me` -> logout -> session invalidation.
- **404 Handling**: Verifies standard error shape on nonexistent API routes.

### 7. `backend/tests/careerDiscovery.test.js` (4 Tests)
- **Full Discovery Limits**: Validates that `listQuerySchema` accepts pagination limits up to `500`, allowing discovery of all 105 active careers without artificial truncation.
- **Boundary Validation**: Ensures query limits above 500 or below 1 are rejected.
- **Filter Parameters**: Tests search terms and category filter validation.
- **Pagination Mathematics**: Confirms multi-page calculation in `buildMeta` and safe boundary capping in `parsePagination`.

### 8. `backend/tests/roadmap.test.js` (2 Tests)
- **Progress Recalculation**: Verifies percentage calculation and status transitions (`not_started` -> `in_progress` -> `completed`).
- **Empty Roadmap Safety**: Ensures 0-stage roadmaps return 0% and 0 hours without NaN errors.

### 9. `backend/tests/skillGapEngine.test.js` (4 Tests)
- **100% Complete Match**: Confirms that a candidate with all required skills receives an overall match score of 100% and 'Strong Match' classification.
- **0% Match**: Confirms zero skills yield an overall score of 0% and 'Low Match' classification.
- **Band Classifications**: Tests thresholds across Strong (>=80%), Moderate (60-79%), Partial (40-59%), and Low (<40%).
- **Proportional Weak Skills**: Verifies that skill proficiencies below required thresholds contribute mathematically proportional credit rather than binary failure.

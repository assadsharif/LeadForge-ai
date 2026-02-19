<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0 (MAJOR — full governance redefinition)

Modified Principles:
  - "Spec-Driven Development"        → retained, expanded (Section 2)
  - "Test-First (NON-NEGOTIABLE)"    → retained, expanded (Section 9)
  - "Smallest Viable Diff"           → retained, renamed "Minimal Diff Mandate" (Section 2)
  - "Traceability"                   → retained, expanded (Section 2)
  - "Security by Default"            → retained, expanded (Sections 6, 12)
  - "Simplicity (YAGNI)"             → retained, expanded (Section 2)

Added Sections:
  - 1. Project Identity
  - 3. Technology Lock-In
  - 4. System Architecture Principles
  - 5. Frontend Standards
  - 6. Backend Standards
  - 7. AI Integration Policy
  - 8. Data & Database Principles
  - 10. DevOps & Environment Policy
  - 11. Definition of Done
  - 12. Non-Negotiables

Templates Requiring Updates:
  - .specify/templates/plan-template.md     ✅ reviewed — Constitution Check section aligns
  - .specify/templates/spec-template.md     ✅ reviewed — FR/SC format aligns
  - .specify/templates/tasks-template.md    ✅ reviewed — phase structure aligns
  - CLAUDE.md                               ⚠ pending — references v1.0.0 principles only

Deferred Items:
  - TODO(RATIFICATION_DATE): Original ratification date carried forward from v1.0.0 (2026-02-17)
  - TODO(AUTH_PROVIDER): Auth provider (e.g., Auth.js, Supabase Auth, custom JWT) not yet decided
  - TODO(AI_PROVIDER): Primary AI provider (OpenAI, Anthropic, Bedrock) to be confirmed in spec
-->

# LeadForge-AI Constitution

**Version**: 2.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-19

---

## 1. Project Identity

**Codename**: LeadForge-AI
**System Type**: Full-Stack SaaS — AI-augmented lead capture and management platform
**Target Deployment Model**: Cloud-hosted, containerized, horizontally scalable
**Core Product Vision**: A production-grade SaaS system that captures, qualifies, and processes
leads via AI-powered workflows, exposing a clean REST API backend and a high-fidelity,
accessible frontend. The system is auth-ready from day one and integrates external AI APIs
through isolated service wrappers.

---

## 2. Engineering Philosophy

### 2.1 Spec-First Enforcement

Every feature MUST begin with an approved `spec.md` before any implementation work starts.
No code, schema migration, or API contract is created without a corresponding specification.
Specs define requirements, acceptance criteria, scope boundaries, and priority order.
Skipping this step is not permitted without explicit, recorded user consent.

### 2.2 Production Mindset

This is a production system. All decisions are made under the assumption of real users,
real data, and real consequences. Performance budgets, error handling, and security controls
are first-class concerns, not afterthoughts. Prototyping patterns (hardcoded values, TODO
auth, skipped validation) are not acceptable in merged code.

### 2.3 Minimal Diff Mandate

Every change MUST be the minimum necessary to satisfy the current, stated requirement.
No speculative features. No unrelated refactoring during feature implementation.
No premature abstractions. If the same logic appears three times, evaluate abstraction
only on the third occurrence and only if the abstraction has a clear, bounded interface.

### 2.4 Traceability

All work MUST be traceable across the artifact chain:
specs → plans → tasks → commits → PRs.
Prompt History Records (PHRs) capture every significant interaction.
Architecture Decision Records (ADRs) document every significant architectural decision.
This chain is non-negotiable and is enforced at PR review.

### 2.5 Maintainability Standards

Code is read far more than it is written. Naming MUST be explicit and intention-revealing.
Functions MUST have a single responsibility. Modules MUST have a declared boundary.
Clever code that requires a comment to explain what it does MUST be rewritten to be
self-evident. Comments explain WHY, not WHAT.

### 2.6 Simplicity (YAGNI)

Complexity is added only when current requirements demand it. Design for what is specified,
not for what might be needed. Prefer explicit over implicit. Prefer readable over compact.
Every abstraction MUST justify its existence against a concrete, current requirement.

---

## 3. Technology Lock-In

### 3.1 Declared Stack

**Frontend**:
- Framework: Next.js 14+ with App Router (RSC-first, client components where required)
- Language: TypeScript in strict mode (`strict: true` in `tsconfig.json`)
- UI: React 18+
- Styling: Tailwind CSS (utility-first; no CSS-in-JS, no global CSS overrides)
- State: React built-in state + server state via fetch/SWR/React Query (TBD per spec)
- Forms: React Hook Form + Zod schema validation

**Backend**:
- Framework: FastAPI (Python 3.11+)
- API style: RESTful; async endpoints throughout (`async def` MUST be default)
- Validation: Pydantic v2 schemas for all request/response contracts
- Logging: `structlog` for structured, JSON-formatted logs
- HTTP client: `httpx` (async) for all outbound requests

**Database**:
- Engine: PostgreSQL 15+
- ORM: SQLAlchemy 2.0+ with async sessions (`asyncpg` driver)
- Migrations: Alembic (all schema changes via versioned migration files)

**Infrastructure**:
- Containerization: Docker + Docker Compose for local and CI environments
- Environment management: `.env` files per environment; `python-dotenv` and Next.js
  built-in env handling

### 3.2 Stack Justification

Next.js App Router provides RSC streaming, built-in routing, and first-class TypeScript
support without requiring a separate routing library. FastAPI provides async-native HTTP
with automatic OpenAPI documentation and Pydantic integration. PostgreSQL is the
production-grade relational database with the strongest ecosystem for migrations and ORM
support. SQLAlchemy 2.0 async mode eliminates the N+1 footgun present in synchronous ORM
usage. This stack is chosen for long-term maintainability, not novelty.

### 3.3 Typing and Validation Rules

- TypeScript strict mode is non-negotiable. `any` is forbidden. `unknown` requires
  explicit narrowing before use.
- All API request and response payloads MUST have a corresponding Pydantic schema
  on the backend and a TypeScript interface or Zod schema on the frontend.
- `as` type assertions are permitted only in test code and MUST be commented with
  justification.
- Python type hints are required on all function signatures. `Any` requires explicit
  justification in a comment.

---

## 4. System Architecture Principles

### 4.1 Separation of Concerns

The system is divided into three independent layers that MUST NOT bleed into each other:

- **Presentation Layer** (Next.js components): Rendering, user interaction, form state.
- **API Layer** (FastAPI routers): HTTP contract definition, request validation,
  response serialization. Contains no business logic.
- **Service Layer** (Python service modules): All business logic. Database access
  is isolated here. Services MUST NOT import from routers.

Violation of these boundaries requires documented justification in an ADR.

### 4.2 API Contract Enforcement

All API contracts MUST be defined as OpenAPI-compatible Pydantic schemas before
implementation begins. Schemas live in `backend/schemas/`. Frontend TypeScript types
MUST be derived from or kept in sync with these schemas. Schema drift between frontend
and backend is a critical defect.

### 4.3 Service-Layer Isolation

Service modules are the single point of business logic. They accept typed inputs and
return typed outputs. They do not handle HTTP concerns (status codes, headers).
They are independently testable without HTTP infrastructure. Database sessions are
injected via FastAPI dependency injection; services MUST NOT create their own sessions.

### 4.4 UI and Business Logic Boundaries

React components handle rendering and user interaction only. Business logic MUST NOT
live in components. Data transformation, validation logic, and API orchestration belong
in dedicated hooks or service modules in `frontend/lib/` or `frontend/services/`.
Components consume hooks; hooks consume service modules.

### 4.5 Error Handling Philosophy

Errors are first-class values. Every error path MUST be explicitly handled.
Silent failures are forbidden. The system distinguishes between:

- **Operational errors**: Expected, recoverable (validation failure, not found).
  Return structured error responses with HTTP status codes.
- **Programmer errors**: Unexpected state indicating a bug. Log with full context,
  return a generic 500, do not expose internals.
- **External dependency failures**: AI API unavailable, database unreachable.
  Apply retry/fallback policy per Section 7.

---

## 5. Frontend Standards

### 5.1 Component Architecture

- Components are organized by feature, not by type. `components/ui/` holds shared
  primitives only. Feature-specific components live under `app/<feature>/` or
  `components/<feature>/`.
- Server Components are the default. Client Components (`"use client"`) are introduced
  only when interactivity, browser APIs, or React state is required.
- Component files MUST NOT exceed 200 lines. Extract sub-components or hooks at
  that boundary.
- Props interfaces MUST be explicitly typed. No implicit `any` via prop spreading
  without interface definition.

### 5.2 State Management

- Server state (fetched data) MUST be managed via the Next.js fetch cache, SWR,
  or React Query. Duplicating server state in React state is forbidden.
- Client state is scoped to the smallest necessary component subtree.
- Global client state (if required) uses React Context with a clearly typed interface.
  Redux or Zustand require ADR justification.

### 5.3 Form Validation

All user-facing forms MUST use React Hook Form with Zod schema validation.
Validation MUST run client-side before submission. Server-side validation via Pydantic
is the authoritative source and MUST also be enforced. Client-side validation is a
UX concern, not a security control.

### 5.4 Loading, Error, and Success States

Every data-fetching operation MUST explicitly handle three states:

- **Loading**: A visible loading indicator. Skeleton loaders preferred over spinners
  for content-bearing UI.
- **Error**: A user-readable error message. No raw error objects surfaced to UI.
  Retry affordance provided where applicable.
- **Success**: The resolved content or confirmation feedback.

Omitting any state is a defect. `undefined` data without a loading state is a defect.

### 5.5 Performance

- Images MUST use Next.js `<Image>` component with explicit `width`, `height`,
  and `alt` attributes. Raw `<img>` tags are forbidden outside of specialized wrappers.
- Dynamic imports (`next/dynamic`) MUST be applied to heavy client-side components
  that are not required for the initial render.
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms on a simulated
  mid-range device. These are measured in CI, not just locally.

### 5.6 Accessibility

- All interactive elements MUST be keyboard-navigable.
- All images MUST have descriptive `alt` text. Decorative images use `alt=""`.
- Color contrast MUST meet WCAG 2.1 AA minimum (4.5:1 for normal text).
- Form inputs MUST have associated `<label>` elements.
- Semantic HTML elements (button, nav, main, section) are preferred over `<div>`
  with ARIA roles, unless the semantic element is insufficient.

---

## 6. Backend Standards

### 6.1 Async Requirements

All FastAPI endpoints MUST be declared `async def`. All database operations MUST use
async SQLAlchemy sessions. All outbound HTTP calls MUST use `httpx.AsyncClient`.
Synchronous blocking calls inside async context are a critical defect.

### 6.2 Schema Validation

All incoming request bodies, query parameters, and path parameters MUST be validated
by Pydantic models. Unvalidated user input MUST NOT reach service layer or database
queries. Response models MUST be explicitly declared on all endpoints using
`response_model=`.

### 6.3 Centralized Exception Handling

All exceptions are handled by registered FastAPI exception handlers in `backend/core/exceptions.py`.
Route handlers MUST NOT contain bare `try/except` blocks for general error handling.
Business rule violations raise domain-specific exceptions that the handler maps to HTTP
responses. Unhandled exceptions produce a 500 with a sanitized message and full
structured log.

### 6.4 Logging Requirements

All significant events MUST be logged using `structlog` with the following fields at
minimum: `event`, `level`, `timestamp`, `request_id`, `user_id` (if authenticated).
Log levels MUST be used correctly: `DEBUG` for diagnostic detail, `INFO` for state
transitions, `WARNING` for recoverable anomalies, `ERROR` for failures requiring
attention, `CRITICAL` for system-threatening conditions. `print()` statements are
forbidden in production code.

### 6.5 API Response Consistency

All API responses MUST conform to a declared envelope format:

- Success: `{ "data": <payload>, "meta": { ... } }` for collections;
  direct schema payload for single-resource responses.
- Error: `{ "detail": "<message>", "code": "<error_code>", "field": "<field|null>" }`.

Endpoint-specific response deviations require documented justification.

### 6.6 Rate Limiting and Security Baseline

- All public endpoints MUST be rate-limited. Default: 100 requests/minute per IP.
  AI-backed endpoints: 10 requests/minute per authenticated user.
- CORS configuration MUST explicitly allowlist origins. Wildcard `*` is forbidden
  in non-development environments.
- All inputs MUST be validated before use in SQL queries. SQLAlchemy ORM parameterized
  queries are the only permitted method. Raw SQL with string interpolation is forbidden.
- Authentication headers MUST use `Authorization: Bearer <token>`. Tokens in query
  strings are forbidden.

---

## 7. AI Integration Policy

### 7.1 Service Wrapper Enforcement

All external AI API calls MUST be encapsulated in a dedicated service module under
`backend/services/ai/`. No AI API call is made directly from a route handler or
business logic service. The wrapper exposes a typed Python interface and is the single
point of configuration, retry, and observability for AI operations.

### 7.2 Timeout Handling

All AI API calls MUST have an explicit timeout configured on the HTTP client.
Default timeout: 30 seconds. Endpoints with streaming responses: 60 seconds.
Timeout exceptions MUST be caught at the service wrapper level and converted to a
domain exception with a clear user-facing message.

### 7.3 Retry Strategy

Transient failures (HTTP 429, 503, network timeout) MUST be retried with exponential
backoff: base 1s, multiplier 2, max 3 retries, max delay 8s. Non-transient failures
(HTTP 400, 401, 422) MUST NOT be retried. Retry logic is implemented in the AI service
wrapper using `tenacity` or equivalent. Retry attempts MUST be logged at `WARNING` level.

### 7.4 Fallback Messaging

When an AI operation fails after retries are exhausted, the system MUST return a
structured fallback response rather than propagating the error to the user unmodified.
Fallback responses MUST indicate the failure clearly and provide a next-step affordance
(e.g., try again, contact support). AI failure MUST NOT cause a 500 response to the end user.

### 7.5 Observability

Every AI API call MUST emit: request latency, model/provider used, token counts
(if available), success/failure status, and error code on failure. These are emitted
as structured log fields. Aggregated metrics (success rate, p95 latency, cost per
request) MUST be derivable from logs.

---

## 8. Data & Database Principles

### 8.1 Migration Strategy

All schema changes MUST be applied via Alembic versioned migration files. Direct schema
mutations in production are forbidden. Every migration MUST include a `downgrade()`
function. Migrations MUST be tested in CI before merging. Migration files are checked
into version control and MUST NOT be modified after they have been applied to any
non-development environment.

### 8.2 Schema Evolution Policy

Additive changes (new columns with defaults, new tables) are preferred over destructive
changes (column removal, type changes). Destructive changes require a multi-phase
migration: add new, migrate data, remove old — each phase as a separate migration file.
Column removal MUST be preceded by a deprecation phase in which the column is nullable
and no longer written to.

### 8.3 Transaction Handling

All operations that mutate more than one entity MUST be wrapped in a database transaction.
Partial writes that leave the database in an inconsistent state are a critical defect.
SQLAlchemy async sessions MUST use `async with session.begin()` for explicit transaction
boundaries. Auto-commit mode is disabled.

---

## 9. Testing Standards

### 9.1 Frontend Testing

- Unit tests cover all utility functions in `frontend/lib/` and custom hooks.
- Component tests use React Testing Library. Tests interact via accessible queries
  (role, label, text) — not via CSS selectors or test IDs except as a last resort.
- Integration tests cover critical user flows (form submission, API error states,
  loading states).
- Test toolchain: Vitest + React Testing Library.

### 9.2 Backend Testing

- Unit tests cover all service-layer functions. Services are tested in isolation using
  mocked database sessions and mocked external clients.
- Integration tests cover all API endpoints using FastAPI `TestClient` with a test
  database. Tests assert both success and error paths.
- AI service wrappers MUST have tests covering timeout, retry exhaustion, and fallback
  behavior using mocked HTTP responses.
- Test toolchain: pytest + pytest-asyncio + httpx.

### 9.3 Minimum Acceptable Coverage

- Backend: 80% line coverage for service modules. 100% coverage for security-critical
  paths (auth, input validation, permission checks).
- Frontend: 70% line coverage for `lib/` and `services/` directories.
- Coverage is enforced in CI. PRs that reduce coverage below thresholds are blocked.

### 9.4 Integration Testing Expectations

A full integration test suite MUST cover the primary lead submission workflow end-to-end:
submission → validation → persistence → AI enrichment (mocked) → response. This suite
runs in CI against a Dockerized PostgreSQL instance. It MUST pass before any PR targeting
`main` is merged.

---

## 10. DevOps & Environment Policy

### 10.1 Dockerization Requirements

Both `frontend/` and `backend/` MUST have production-grade `Dockerfile`s with:
- Multi-stage builds (build stage + runtime stage).
- Non-root user at runtime.
- No development dependencies in the final image.
- Explicit `HEALTHCHECK` instruction.

A `docker-compose.yml` at the repository root MUST orchestrate all services for local
development: frontend, backend, PostgreSQL, and any required sidecar services.

### 10.2 Environment Variable Management

- All configuration that varies between environments is delivered via environment variables.
- `.env.example` files MUST exist for each service with all required keys documented
  and placeholder values. `.env` files are gitignored and MUST NOT be committed.
- Secrets (API keys, database passwords, JWT secrets) MUST NOT appear in source code,
  Dockerfiles, or CI configuration in plaintext.
- The backend validates all required environment variables at startup and fails fast
  with a descriptive error if any are missing.

### 10.3 Dev/Production Parity

Local development MUST use the same PostgreSQL version as production. Docker Compose
is the mandated local environment. "Works on my machine" is not an acceptable defect
response. CI uses the same Docker images as local development.

---

## 11. Definition of Done

### 11.1 Conditions Required Before Feature Merge

A feature is considered done when ALL of the following are true:

- [ ] Specification (`spec.md`) was written and approved before implementation began.
- [ ] All acceptance criteria in the spec are verifiably met.
- [ ] All defined tests pass in CI (unit, integration, coverage thresholds met).
- [ ] No TypeScript errors (`tsc --noEmit` exits clean).
- [ ] No linting errors (`eslint`, `ruff`, `mypy` all pass).
- [ ] All three UI states (loading, error, success) are implemented for every
      data-fetching interaction introduced by the feature.
- [ ] API endpoints have declared `response_model` and error responses.
- [ ] No secrets, credentials, or environment-specific values are hardcoded.
- [ ] PHR is created capturing the implementation session.
- [ ] ADR is created for any architecturally significant decision introduced.
- [ ] PR description references the originating spec and task IDs.

### 11.2 What Is NOT Considered Done

- "It works on my machine."
- "Tests will be added later."
- "The error case is an edge case."
- "The TypeScript errors are harmless."
- "I'll refactor it after merge."
- A feature with loading or error states missing from the UI.
- A merged PR without a linked spec.

---

## 12. Non-Negotiables

### 12.1 Forbidden Patterns

The following are explicitly forbidden and constitute critical defects:

- `any` in TypeScript source code (permitted in test files with justification).
- Raw SQL with string interpolation or f-strings.
- Synchronous blocking I/O inside async functions.
- Secrets or API keys hardcoded in source, config, or CI files.
- Direct AI API calls outside the `backend/services/ai/` wrapper.
- Database session creation outside of FastAPI dependency injection.
- Wildcard CORS (`*`) in non-development configuration.
- `print()` statements in production code (use `structlog`).
- Skipping migrations in favor of direct schema mutations.
- Components with mixed business logic and rendering concerns.
- Merging code that reduces CI coverage below defined thresholds.
- Implementation without a prior approved specification.

### 12.2 Anti-Patterns to Avoid

- Prop drilling beyond two levels: introduce context or composition.
- Fat route handlers: route handlers validate and delegate; all logic in services.
- God modules: a single module with more than one bounded responsibility.
- Optimistic typing: assuming data shape without runtime validation at boundaries.
- Swallowing exceptions: `except Exception: pass` or equivalent is never acceptable.
- Magic strings: repeated string literals MUST be extracted to named constants.
- Nested ternaries in JSX: extract to named variables or components.

---

## Quality Gates

- All specs MUST have measurable, testable acceptance criteria.
- All plans MUST reference the spec they implement.
- All tasks MUST be independently testable.
- All code changes MUST pass CI (tests, types, lint) before merge.
- All PRs MUST reference the originating task or spec.
- Constitution violations are CRITICAL and block implementation.
- ADR suggestions are surfaced for significant decisions; creation requires user consent.

---

## Development Workflow

1. **Specify** (`/sp.specify`): Create feature spec from natural language requirement.
2. **Plan** (`/sp.plan`): Generate architecture and implementation plan.
3. **Tasks** (`/sp.tasks`): Break plan into ordered, independently testable tasks.
4. **Implement** (`/sp.implement`): Execute tasks with TDD (red → green → refactor).
5. **Review** (`/sp.git.commit_pr`): Commit, push, and create PR with spec reference.

Each stage validates against the previous. Skipping stages requires explicit,
recorded user consent.

---

## Governance

- This constitution supersedes all other development practices within its scope.
- Amendments require explicit documentation, version increment, and user approval.
- All PRs and reviews MUST verify compliance with these principles.
- Complexity added beyond what requirements demand MUST be justified against
  the Minimal Diff Mandate (Section 2.3).
- CLAUDE.md provides runtime agent guidance and MUST reference this constitution.
- Amendment procedure: edit this file, increment version per semantic versioning rules,
  record change in Sync Impact Report (HTML comment at top of file), obtain user approval.
- Compliance review is expected at the start of each feature specification cycle.

**Version**: 2.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-19

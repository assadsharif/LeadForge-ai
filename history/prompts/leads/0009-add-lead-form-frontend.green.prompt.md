---
id: "0009"
title: Add Lead Form Frontend
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: assadsharif
command: "please continue working"
labels: ["leads","frontend","modal","add-lead","apiPost","tdd","vitest","next.js"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/lib/api/client.ts
  - frontend/src/app/(dashboard)/dashboard/AddLeadModal.tsx
  - frontend/src/app/(dashboard)/dashboard/__tests__/AddLeadModal.test.tsx
  - frontend/src/app/(dashboard)/dashboard/page.tsx
  - frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx
tests:
  - dashboard/__tests__/AddLeadModal.test.tsx::renders heading, name input, email input, and action buttons (new)
  - dashboard/__tests__/AddLeadModal.test.tsx::calls apiPost with correct payload and token, then calls onSuccess (new)
  - dashboard/__tests__/AddLeadModal.test.tsx::shows error alert on 409 duplicate email (new)
  - dashboard/__tests__/AddLeadModal.test.tsx::calls onClose when Cancel is clicked (new)
  - dashboard/__tests__/AddLeadModal.test.tsx::disables submit button while submitting (new)
  - dashboard/__tests__/page.test.tsx::opens Add lead modal when Add lead button is clicked (new)
---

## Prompt

please continue working

## Response snapshot

Assessed project state from PHR history: last completed work was POST /api/v1/leads backend
endpoint. Identified missing piece: no "Add Lead" UI on the frontend despite the endpoint existing.

Implemented the full Add Lead form flow across 5 files:

- **`client.ts`**: Added optional `token?: string` param to `apiPost` — adds `Authorization: Bearer`
  header when provided. Backwards-compatible: existing login form callers unaffected.
- **`AddLeadModal.tsx`** (new): Modal component with controlled Name + Email inputs, `apiPost` call
  with auth token, inline error alert on failure (including 409 detail), `onSuccess`/`onClose`
  callbacks. Spinner while submitting. WCAG: `role="dialog"`, `aria-modal`, `aria-labelledby`,
  `role="alert"`, `htmlFor`/`id` label pairing.
- **`AddLeadModal.test.tsx`** (new): 5 tests covering all behaviors — renders, submits with correct
  payload, 409 error display, cancel, disabled-during-submit.
- **`page.tsx`**: Added `isModalOpen` state, "Add lead" button next to Leads heading, and
  `<AddLeadModal>` conditional render with `onSuccess` re-fetching leads.
- **`page.test.tsx`**: Added `apiPost: vi.fn()` to mock, added "opens modal on Add lead button click"
  test. Fixed hoisted `ApiRequestError` in AddLeadModal tests to have `public readonly detail`
  (not plain `message` param) so `err.detail` resolves correctly.

Failure observed and fixed mid-run: hoisted test class had `message: string` (non-property) so
`err.detail` was `undefined`; fixed to `public readonly detail: string`.

## Outcome

- Impact: Users can now create leads from the dashboard via an "Add lead" modal. On success the
  leads table auto-refreshes. Duplicate email → 409 shown inline. Auth token forwarded on POST.
- Tests: 61/61 frontend tests pass (16 test files). 6 new tests added.
- Files: 3 modified (client.ts, page.tsx, page.test.tsx), 2 new (AddLeadModal.tsx, AddLeadModal.test.tsx)
- Next prompts: DELETE /api/v1/leads/{id} backend + frontend delete button, PATCH /api/v1/leads/{id}, leads detail page, pagination
- Reflection: Hoisted ApiRequestError class must declare constructor params as `public readonly`
  to create instance properties; plain constructor params (non-public) are not accessible as
  `err.propName`. The dashboard page reads token from localStorage at render time for the modal
  prop — consistent with the existing fetchLeads pattern.

## Evaluation notes (flywheel)

- Failure modes observed: Hoisted ApiRequestError class missing `public readonly detail` — `err.detail` was `undefined`, causing empty alert text. Caught by test failure on first run.
- Graders run and results (PASS/FAIL): vitest 61/61 PASS
- Prompt variant (if applicable): resume → assess state → implement next logical feature
- Next experiment: Extract shared hoisted ApiRequestError helper into a test utility to avoid repeated class definitions across test files.

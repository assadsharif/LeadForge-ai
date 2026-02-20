---
id: "0020"
title: RegisterForm aria-live and network error test
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: register-page
branch: main
user: HomePC
command: fix RegisterForm WCAG aria-live + network error test
labels: ["accessibility","aria-live","testing","wcag","register-form"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/auth/RegisterForm.tsx
  - frontend/src/components/auth/__tests__/RegisterForm.test.tsx
tests:
  - src/components/auth/__tests__/RegisterForm.test.tsx (6 tests — all pass)
---

## Prompt

Fix two issues in the RegisterForm component and test file for LeadForge-AI.

**Files:**
- /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend/src/components/auth/RegisterForm.tsx
- /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend/src/components/auth/__tests__/RegisterForm.test.tsx

---

**Issue 1: Field error <p> elements need aria-live for WCAG screen reader announcements**

Current pattern (for each of 4 fields):
```tsx
{errors.fullName && (
  <p id="fullName-error" className={errorClass}>
    {errors.fullName.message}
  </p>
)}
```

Problem: The `<p>` is only in the DOM when there's an error. When it first appears dynamically, screen readers don't announce it. Need `aria-live` on an always-present container.

Fix — for each of the 4 fields, replace the conditional render with an always-present `<p>` that has aria-live:

```tsx
<p
  id="fullName-error"
  className={errorClass}
  aria-live="polite"
  aria-atomic="true"
>
  {errors.fullName?.message ?? ""}
</p>
```

Apply this same pattern to all 4 fields: fullName, email, password, confirmPassword.

---

**Issue 2: Missing test for network error path**

The component shows "Something went wrong. Please try again." when a non-ApiRequestError exception is thrown (e.g., fetch rejects with a network error). This branch is currently untested.

Add this test to the describe block in RegisterForm.test.tsx:

```tsx
it("shows generic error banner on network failure", async () => {
  vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network Error"));

  render(<RegisterForm />);
  await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
  await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
  await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
  await userEvent.type(screen.getByLabelText(/confirm password/i), "s3cur3pass");
  await userEvent.click(screen.getByRole("button", { name: /create account/i }));

  expect(
    await screen.findByText(/something went wrong/i),
  ).toBeInTheDocument();
});
```

After making both changes run the tests and amend the previous commit.

## Response snapshot

Applied both fixes:

1. All 4 field error `<p>` elements converted to always-present nodes with `aria-live="polite"` and `aria-atomic="true"`. The `aria-describedby` on each input was simplified to always reference the error id (no longer conditional). Used optional chaining `errors.fullName?.message ?? ""` so the element renders empty when there is no error.

2. Added 6th test `"shows generic error banner on network failure"` that mocks `global.fetch` to reject with a plain `Error("Network Error")`, triggering the `else` branch in `onSubmit` which sets the generic server error message.

All 6 tests pass. Previous commit amended successfully (commit `0a29fbf`). RegisterForm.tsx is 175 lines (under 200-line limit).

## Outcome

- Impact: WCAG 2.1 SC 4.1.3 compliance for live region announcements; full branch coverage for the generic network-error path in onSubmit
- Tests: 6/6 pass (vitest run, 4830ms)
- Files: RegisterForm.tsx (175 lines), RegisterForm.test.tsx (101 lines)
- Next prompts: Task 10 — Register page shell
- Reflection: Converting conditional error renders to always-present live regions is a clean accessibility pattern; also ensures `aria-describedby` is always valid (non-undefined).

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest run — PASS (6/6)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null

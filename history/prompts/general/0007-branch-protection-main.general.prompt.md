---
id: "0007"
title: Set Up Branch Protection Main
stage: general
date: 2026-02-19
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: assadsharif
command: set up branch protection on main
labels: ["github","branch-protection","ci","governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - none (GitHub API operation, no local files changed)
tests:
  - none
---

## Prompt

set up branch protection on main

## Response snapshot

Applied branch protection rules to assadsharif/LeadForge-ai main branch via
GitHub API (PUT /repos/.../branches/main/protection). All rules confirmed active.

## Outcome

- Impact: main branch is now protected. No direct pushes, no force pushes,
  no deletions. All changes must arrive via PR with 1 approval and passing CI.
- Tests: none
- Files: none (API-only operation)
- Next prompts: /sp.specify for first feature
- Reflection: --field flag failed for nested JSON objects; resolved with --input heredoc.

## Evaluation notes (flywheel)

- Failure modes observed: gh api --field serializes nested objects as strings (422).
  Fix: use --input with JSON heredoc.
- Graders run and results (PASS/FAIL): API returned 200 with all rules confirmed (PASS)
- Prompt variant (if applicable): none
- Next experiment: none

---
id: "0001"
title: LeadForge-AI Constitution v2.0.0
stage: constitution
date: 2026-02-19
surface: agent
model: claude-sonnet-4-6
feature: none
branch: none
user: assadsharif
command: /sp.constitution
labels: ["constitution","governance","sdd","saas","fullstack","next.js","fastapi","postgresql"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

You are a senior software architect operating in strict Spec-Driven Development (SDD) mode.

Your task is to generate a complete `/sp.constitution` document for a production-grade Full-Stack SaaS project.

This is NOT a tutorial project.
This is NOT a demo app.
This must reflect real-world engineering standards.

PROJECT INTENT:
- Frontend: Next.js (App Router), React, TypeScript strict mode, Tailwind CSS, modern component-driven UI, API integration layer with async state handling
- Backend: FastAPI (Python), Async endpoints, Pydantic schemas, Structured logging, RESTful API standards
- Database: PostgreSQL, SQLAlchemy ORM
- System must include: Clean API contracts, Image/file handling capability, External AI API integration readiness, Lead capture or data submission workflow, Auth-ready architecture

Sections required:
1. Project Identity
2. Engineering Philosophy
3. Technology Lock-In
4. System Architecture Principles
5. Frontend Standards
6. Backend Standards
7. AI Integration Policy
8. Data & Database Principles
9. Testing Standards
10. DevOps & Environment Policy
11. Definition of Done
12. Non-Negotiables

## Response snapshot

Generated and wrote `.specify/memory/constitution.md` v2.0.0 (bumped from 1.0.0).
Version bump: MAJOR — backward-incompatible governance redefinition. All six v1.0.0
principles retained and expanded. Twelve new governance sections added covering
stack lock-in, frontend/backend standards, AI integration policy, DoD, and non-negotiables.
Sync Impact Report prepended as HTML comment. Two TODOs deferred: AUTH_PROVIDER and
AI_PROVIDER (to be resolved in first feature spec).

## Outcome

- Impact: Full project governance established for LeadForge-AI SaaS system. All
  engineering decisions, technology choices, testing thresholds, and forbidden patterns
  are now documented and enforceable.
- Tests: none (governance document)
- Files: .specify/memory/constitution.md overwritten with v2.0.0
- Next prompts: /sp.specify for first feature; /sp.adr for auth provider decision;
  /sp.adr for AI provider decision
- Reflection: Constitution is comprehensive and authoritative. Two architectural
  decisions (auth provider, AI provider) left as TODO pending first feature spec — correct
  deferral since premature lock-in would violate YAGNI.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): no unresolved bracket tokens; version matches
  report; dates ISO format; principles declarative and free of vague language (PASS)
- Prompt variant (if applicable): full 12-section SaaS constitution from natural language
- Next experiment: none

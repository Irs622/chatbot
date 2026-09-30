---
name: Bug Report / Defect
description: Report a technical malfunction, data inconsistency, or system error.
title: "[BUG] "
labels: ["bug"]
assignees: []
---

## 1. Problem Description
Provide a clear and objective explanation of the defect or unexpected behavior.

## 2. Environment & Scope
- **Environment**: Production (Vercel Serverless) / Staging / Local Development
- **Affected Components**: (e.g., `lib/db.ts`, `ChatWidget.tsx`, `AnalyticsView.tsx`, API Endpoints)
- **Severity Level**: Critical / High / Medium / Low

## 3. Business & Operational Impact
Describe how this defect impairs business processes, lead capture, data integrity, or user experience.

## 4. Steps to Reproduce
1. Navigate to '...'
2. Trigger action '...'
3. Observe unexpected behavior: '...'

## 5. Expected vs Actual Behavior
- **Expected**: Describe what should occur according to system specifications.
- **Actual**: Describe what currently occurs.

## 6. Proposed Technical Remediation
Outline the recommended architectural or code-level resolution.

## 7. Verification Checklist
- [ ] Defect resolved across target runtime environments.
- [ ] Regression testing executed via automated test suite (`npm run test:report`).
- [ ] Production build verified (`npx tsc --noEmit`).

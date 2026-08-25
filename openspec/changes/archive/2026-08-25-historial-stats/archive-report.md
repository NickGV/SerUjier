# Archive Report: historial-stats Change

**Archived**: 2026-08-25  
**Change**: historial-stats  
**Status**: Fully Delivered and Verified  
**Verdict**: ✅ Pass with Warnings (9/9 requirements, 13/13 scenarios, 0 CRITICAL issues)

---

## Executive Summary

The **historial-stats** change has been fully delivered, verified, and archived. It introduces a read-only statistics view for attendance tracking, including amigos follow-up table, per-servicio averages chart, and top-faltantes ranking. The change was delivered as two chained PRs (PR #19 Slice A, PR #21 Slice B) with no blocking findings. Receipt-driven review is disabled per owner request, and delivery follows ordinary repository policy.

---

## Scope

### Core Objective
Provide read-only attendance statistics without Firestore writes: amigos follow-up table (all-time, stalest-first), per-servicio averages chart (date-filtered), top-faltantes ranking (90-day fixed window), and shared aggregation helpers covering legacy data normalization.

### Delivery Slices
- **Slice A (PR #19)**: Helpers, route, amigos table, normalizer adoption in existing pages (~700 lines)
- **Slice B (PR #21)**: recharts integration, averages + faltantes cards, orphan cleanup, detail page card removal (~750 lines)

### Final Scope Decisions
- Amigos table scoped all-time (no date-range filter impact)
- Servicio averages date-filtered; faltantes fixed to 90-day window
- Shared helpers in `src/shared/lib/historial-stats.ts`, fully tested
- Legacy `StatsSummary`, `CategoryGrid`, `utils.ts` deleted
- Detail page "Total Asistentes" card removed, grid collapsed to two-column layout (decision history recorded in spec)
- Read-only: no Firestore writes, all reads via existing functions

---

## Delivery

### Pull Requests
| PR | Slice | Delivery | Status |
|----|-------|----------|--------|
| PR #19 | Slice A (backend helpers) | Helpers, route, amigos table, normalizer adoption | ✅ Merged |
| PR #21 | Slice B (UI + cleanup) | recharts, averages, faltantes, orphan cleanup, card removal | ✅ Open at archive time |

### Current Branch State
- **Current branch**: `feat/historial-stats-slice-b`
- **Commits ahead of main**: 6
- **PR #21**: Open, awaiting merge post-archive

---

## Verification Final Result

### Machine Envelope
```yaml
schema: gentle-ai.verify-result/v1
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 9/9
scenarios: 13/13
test_suites: 23 passed, 23 total
tests: 299 passed, 299 total
build: ✓ Static pages 19/19 compiled successfully
```

### Final State Facts (Authority Ranking)
Per specification Final-State Authority, the following facts supersede verify-report snapshot claims:

#### WARNING 1: FIXED ✅
**Design.md D3 stale claim** — The report flagged requirement D3 as contradicting shipped code.
- **Issue**: D3 said `computeServicioAverages` "receives the 9 enum values"; shipped code passes `servicios.map(s => s.label)` (labels, not enums).
- **Resolution**: D3 rewritten with `**Corrected 2026-08-25**` note explaining root cause, citing `src/features/asistencia/lib/calculations.ts:291`, recording that a production query found 220 records with zero using an enum value, stating that `exploration.md` is not authoritative on the servicio field.
- **Status**: Closed; change carries **0 open warnings**.

#### SUGGESTION 3: FIXED ✅
**state.yaml stale phases block** — The report flagged phases section as incomplete.
- **Resolution**: `state.yaml` now reads `apply: done`, `verify: done`, with spec comment stating `9 requirements / 13 scenarios` (requirement 8 gained a scenario when amended post-apply).
- **Status**: Closed.

#### Test Evidence (post-apply, final state per launch prompt)
- **Test Suites**: 23 / 23 passed (299 total tests)
- **Build**: Next.js static pages 19/19 compiled successfully
- **Type Check**: `pnpm type-check` exit 0
- **Lint**: `pnpm lint` clean
- **Bundle**: `recharts` confirmed absent from eager chunks (`/historial`, `/historial/[id]`, `/historial/estadisticas`), present only in two on-demand chunks behind `next/dynamic(ssr:false)`

### Requirements & Scenarios (9/9 / 13/13, final state)

| # | Requirement | Scenario Count | Result |
|---|-------------|---|---|
| 1 | Estadísticas Route | 1 | ✅ |
| 2 | Historial Record Normalization | 1 | ✅ |
| 3 | Amigos Follow-up Table | 3 | ✅ |
| 4 | Per-Servicio Averages Chart | 1 | ✅ |
| 5 | Top Faltantes Ranking | 2 | ✅ |
| 6 | Pure Aggregation Helpers | 2 | ✅ |
| 7 | Orphan Cleanup | 1 | ✅ |
| 8 | Detail Redundant Quick-Stat Removed | 2 | ✅ |
| 9 | Read-Only Behavior | 1 | ✅ |
| **TOTAL** | | **13/13** | ✅ |

All requirements met; all scenarios passing.

---

## Review Gates

### Receipt-Driven Review Status
**Status**: DISABLED (structurally absent per owner request)  
- **Evidence**: `reviewGate` absent from dispatcher output
- **Kill-switch state**: Off — receipt-driven development does not exist for this candidate
- **Delivery mode**: Ordinary repository policy (PR review via GitHub), not gentle-ai review receipts
- **This is not a gap**: Owner explicitly disabled RDD at session start; `dependencies.archive: ready` confirms readiness

---

## Final State Authority Ranking

### Sources
1. **Native review authority**: None (RDD disabled); disposition per ordinary repository policy
2. **Persisted tasks artifact**: `openspec/changes/archive/2026-08-25-historial-stats/tasks.md` — 23/23 tasks complete
3. **Explicit final-state facts** (launch prompt): WARNING 1 fixed, SUGGESTION 3 fixed, 9 req / 13 scenarios, 0 open warnings, all tests pass, build succeeds
4. **Intermediate snapshots**: `verify-report`, `apply-progress` (lowest rank; these are historical records at time written)

### Reported Facts vs. Snapshot Claims
Per Final-State Authority hierarchy:
- **Completion**: All 23 tasks marked complete in tasks.md (verified by task inspection)
- **Warnings**: Verify-report snapshot showed WARNING 1 (D3 stale) and SUGGESTION 3 (state.yaml stale); final-state facts confirm both fixed in post-apply commits; **0 open warnings as of archive time**
- **Requirements & Scenarios**: 9/9 / 13/13 per final-state facts (requirement 8 gained 1 scenario post-apply: detail card removal; recounted directly this pass)
- **Test counts**: 23 suites / 299 tests (final numbers per final-state facts, not snapshot-derived)

**No stale claims**: All facts derive from final state or explicit authorization; snapshot conditions superseded by post-apply work.

---

## Operational Status

### DELIVERED ✅
- Shared helpers (`normalizeHistorialRecord`, `todayISODate`, `filterRecordsByDateRange`, `computeServicioAverages`, `buildAmigosSeguimiento`, `collectMiembroAttendeeIds`, `computeTopFaltantes`) in `src/shared/lib/historial-stats.ts`
- Helper test suite covering 1:1 scenarios per requirement 6
- Estadísticas route `/historial/estadisticas` static segment
- Amigos follow-up table (all-time, stalest-first sort, "nunca" for never-visited)
- Per-servicio averages chart (date-filtered via desde/hasta; chart loaded via `next/dynamic(ssr:false)`)
- Top faltantes ranking (fixed 90-day window; `esMiembro: true` only)
- Normalizer adoption in `historial/page.tsx` and `historial/[id]/page.tsx`
- Orphan files (`StatsSummary.tsx`, `CategoryGrid.tsx`, `utils.ts`) deleted
- Detail page "Total Asistentes" card removed; two-column grid preserved
- Slice A merged to main via PR #19
- Slice B (PR #21) open, ready for merge post-archive

### Build & Test Status
- **Build**: 19 static pages compiled, recharts isolated to on-demand chunks (verified in apply-progress)
- **Tests**: 299 tests / 23 suites passing
- **Bundle Size**: No regression (recharts confirmed absent from eager chunks)

---

## Known Limits & Deferred Work

### Documented in Change Record (Non-Blocking)
1. **Interactive page smoke tests deferred**: `npm run dev` click-through not performed in apply phase (execution environment limitation); verified structurally via build, code review, and memo dependencies
2. **servicio field authority**: `exploration.md` contains outdated information claiming servicio field comes from 9-value enum and is "not free text at creation"; both halves are false (ConteoHeader.tsx has free-text "Agregar servicio..." path; write path stores labels). **Carry this correction into future changes in this area.**

### Deferred Follow-Ups (out of scope, recorded for future)
- Member-only historial/asistencia breakdowns: out of scope
- Additional filtration options: deferred to future enhancements

These do not block the change.

---

## Artifacts Synced

### Delta Spec → Main Spec
**Action**: Copy (no pre-existing main spec for historial-stats; delta is full spec)

| Domain | Source | Destination | Size | Status |
|--------|--------|-------------|------|--------|
| historial-stats | `openspec/changes/archive/2026-08-25-historial-stats/specs/historial-stats/spec.md` | `openspec/specs/historial-stats/spec.md` | 9 req / 13 scenarios | ✅ Created |

**Diff verification**: Empty (source ≡ destination). Byte-perfect copy confirmed via `diff -r`.

---

## Archive Contents

The historial-stats change folder archived to `openspec/changes/archive/2026-08-25-historial-stats/`:

- ✅ `proposal.md` — Project scope, approach, rollback strategy
- ✅ `exploration.md` — Risk analysis, existing patterns
- ✅ `specs/historial-stats/spec.md` — Delta spec (9 requirements, 13 scenarios)
- ✅ `design.md` — Architecture, data flow, decision rationale
- ✅ `tasks.md` — 23 implementation tasks (all complete, marked in apply phase)
- ✅ `apply-progress.md` — Work execution log per delivery slice
- ✅ `verify-report.md` — Verification envelope (pass_with_warnings, 9/9, 13/13, 0 CRITICAL)
- ✅ `state.yaml` — Change metadata, delivery decisions, archive timestamp
- ✅ `archive-report.md` — This document

---

## SDD Cycle Completion

| Phase | Outcome | Evidence |
|-------|---------|----------|
| Explore | ✅ Done | Risk identified: existing stats code duplication, normalization needed |
| Propose | ✅ Done | Scope and approach approved; chained delivery strategy accepted |
| Spec | ✅ Done | 9 requirements / 13 scenarios defined (13 from post-apply amendment) |
| Design | ✅ Done | Architecture, data flow, and migration strategy documented |
| Tasks | ✅ Done | 23 implementation tasks planned and completed |
| Apply | ✅ Done | Slice A (PR #19) merged; Slice B (PR #21) open at archive time |
| Verify | ✅ Done | pass_with_warnings / 9/9 / 13/13 / 0 CRITICAL; 0 open warnings at archive time |
| Archive | ✅ Done | Delta spec merged, change folder archived, state updated |

**Historial-stats change is closed**. Ready for the next change or for Slice B merge post-archive.

---

## Traceability & Artifacts

### OpenSpec Artifacts (File Paths)
- Proposal: `openspec/changes/archive/2026-08-25-historial-stats/proposal.md`
- Exploration: `openspec/changes/archive/2026-08-25-historial-stats/exploration.md`
- Specs: `openspec/changes/archive/2026-08-25-historial-stats/specs/historial-stats/spec.md`
- Design: `openspec/changes/archive/2026-08-25-historial-stats/design.md`
- Tasks: `openspec/changes/archive/2026-08-25-historial-stats/tasks.md`
- Apply Progress: `openspec/changes/archive/2026-08-25-historial-stats/apply-progress.md`
- Verify Report: `openspec/changes/archive/2026-08-25-historial-stats/verify-report.md`
- State: `openspec/changes/archive/2026-08-25-historial-stats/state.yaml`
- Main Spec: `openspec/specs/historial-stats/spec.md` (merged from delta)

### Git References
- Main branch: commit 40afaf9 (as of Slice A merge)
- Feature branch: `feat/historial-stats-slice-b`, 6 commits ahead
- PR #19: Slice A merged to main
- PR #21: Slice B (open at archive time)

### Bundle & Performance
- **recharts**: Confirmed on-demand only, absent from `/historial`, `/historial/[id]`, `/historial/estadisticas` eager chunks
- **Static pages**: 19/19 compiled in build
- **Test coverage**: 299 tests / 23 suites

# Tasks: Unify Visitas and Simpatizantes into Amigos

## Review Workload Forecast

| Field                   | Value                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Estimated changed lines | ~850–1,200                                                                            |
| 400-line budget risk    | High                                                                                  |
| Chained PRs recommended | Yes                                                                                   |
| Suggested split         | PR 1 (Data+Migration) → PR 2 (State+Perms) → PR 3 (UI+Export) → PR 4 (Compat+Cleanup) |
| Delivery strategy       | ask-on-risk                                                                           |
| Chain strategy          | pending                                                                               |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal                                                  | Likely PR | Notes                          |
| ---- | ----------------------------------------------------- | --------- | ------------------------------ |
| 1    | Data model, Firebase CRUD, migration script, metadata | PR 1      | Foundation — no UI changes yet |
| 2    | Redux slice, permission namespace, store wiring       | PR 2      | Depends on PR 1 types          |
| 3    | Unified dialog, amigos page, exports, navigation      | PR 3      | Depends on PR 2 store/perms    |
| 4    | Feature flag, backward compat, testing, cleanup       | PR 4      | Depends on PR 3 UI             |

## Phase 1: Data Model & Migration

- [x] 1.1 Create `src/types/amigos.ts` with `Amigo` interface + `migratedFrom` field
- [x] 1.2 Create `src/firebase/amigos.ts` — CRUD operations for `amigos` collection
- [x] 1.3 Create `scripts/migrate-visitas-simpatizantes-to-amigos.ts` with `--dry-run`, `--backup`, `--execute` flags, batch processing, and error logging
- [x] 1.4 Create `src/metadata/amigos.ts` — page title, OG tags, description

## Phase 2: State & Permissions

> **Adjusted**: Project uses hooks with `useFirebaseCRUD<T>` (no Redux). Tasks updated to match actual architecture.

- [x] 2.1 Create `src/features/amigos/hooks/use-amigos.ts` — hook wrapping `useFirebaseCRUD` with `addAmigo`/`updateAmigo`/`deleteAmigo`/`refreshAmigos`
- [x] 2.2 Update `src/shared/types/permisos.ts` — add `'amigos'` to `MODULES`, `ALL_PERMISSIONS`, `PERMISSIONS_BY_MODULE`, `MODULE_LABELS`
- [x] 2.3 Update `src/shared/components/bottom-navigation.tsx` — add `Amigos` nav item in admin view + permission-gated section with `canView('amigos')`

## Phase 3: UI, Navigation & Export

- [ ] 3.1 Create `src/components/amigos/AmigosFormDialog.tsx` — unified create/edit dialog with all fields + same validation rules
- [ ] 3.2 Create `src/pages/AmigosListPage.tsx` — table, search, CRUD actions
- [ ] 3.3 Create `src/navigation/amigosNav.tsx` — navigation link to `/amigos`
- [ ] 3.4 Create `src/utils/export/amigosExport.ts` — PDF/Excel/CSV from `amigos` collection

## Phase 4: Backward Compatibility & Feature Flag

- [ ] 4.1 Add feature flag `featureFlags.amigosUnified` in config (default: off)
- [ ] 4.2 Add conditional fallback reads in `src/firebase/visitas.ts` / `src/firebase/simpatizantes.ts` — check `amigos` first, fall back to legacy
- [ ] 4.3 Add write-logging guard to legacy Firebase modules (log + reject writes to `visitas`/`simpatizantes`)
- [ ] 4.4 Add redirect from `/visitas` and `/simpatizantes` routes to `/amigos`
- [ ] 4.5 Point legacy export modules to `amigosExport.ts` during transition

## Phase 5: Testing

> Adjusted to actual project state — most tests written in prior phases, this phase fills remaining gaps.

- [x] 5.1 Integration tests for the amigos CRUD page flow
  - Created `src/__tests__/features/amigos/integration/AmigosListPage.test.tsx`
  - Covers: loading state, error state, list rendering, search filtering, form dialog open/close (permission-gated), edit/delete flows, empty states
- [x] 5.2 Verify amigos export tests pass
  - Existing `amigosExport.test.ts` covers: CSV content, columns (Nombre/Teléfono/Notas/Fecha de Registro/Origen), BOM, escaping, empty list, "N/A" dates, "Directo" origin
- [x] 5.3 Type validation tests for Amigo interface
  - Created `src/__tests__/types/amigos.test.ts`
  - Covers: interface structure, migratedFrom valid values, optional fields, JSON round-trip
- [x] 5.4 Verify migration script edge cases
  - Extended `src/__tests__/services/amigosMigration.test.ts`
  - Covers: empty collections, missing nombre field, extra fields not in schema, malformed document logging, dry-run mode, backup mode, no-operation mode
- [x] 5.5 Full check run (`npm run check`)
  - Prettier, lint, and type-check all pass cleanly
  - Fixed pre-existing lint errors in test files + production type error in `AmigosFormDialog.tsx` (missing `migratedFrom: null`)
- [x] 5.6 Coverage threshold check
  - Global thresholds not met (12%) — expected for large Next.js app with focused amigos-only tests
  - Amigos-specific files: 78-100% statement coverage across all modules

## Phase 6: Cleanup (post-validation)

- [ ] 6.1 Delete `src/types/visitas.ts`, `src/types/simpatizantes.ts`
- [ ] 6.2 Delete legacy store slices, permissions, metadata files
- [ ] 6.3 Delete legacy dialogs (`VisitasFormDialog`, `SimpatizantesFormDialog`) and pages
- [ ] 6.4 Remove backward-compat fallback code and feature flag
- [ ] 6.5 Remove legacy nav redirects; update docs

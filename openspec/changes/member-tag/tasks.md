# Tasks: Membership flag (`esMiembro`) for Miembros

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 750–800 (752 calculated: +662 added, +90 deleted) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Slice A (types/CRUD/migration) → PR 2: Slice B (UI/filter/tests) |
| Delivery strategy | single-pr (override required) |
| Chain strategy | pending (user decision) |

**Plain-text guard lines:**

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Consolidate types + CRUD + field + migration infrastructure | PR 1 (Slice A) | `npm run build && npm test` | `node scripts/migrate-miembro-tag.ts --dry-run` (verify no errors; compare counts with database; do NOT execute) | Revert all A tasks. `esMiembro` becomes an ignored Firestore field. Read paths still default it to `false` via `normalizeMiembro`. No rollback to data. |
| 2 | Extract filter logic + add UI components (Switch/Badge) + integrate pages + add filter tests | PR 2 (Slice B) | `npm test -- miembros-filters.test.ts && npm run build` | N/A: UI smoke test in develop branch after PR 1 lands; page-level RTL coverage deferred per design. | Revert B tasks. Pages fall back to Slice A backend (field exists, `normalizeMiembro` works, no UI for toggle/filter). |

---

## Phase 1: Type Consolidation (Slice A Foundation)

- [x] 1.1 Add `esMiembro: boolean` field to `Miembro` interface in `src/shared/types/index.ts`
- [x] 1.2 Create `MiembroInput = Pick<Miembro, 'nombre' | 'telefono' | 'categoria' | 'esMiembro' | 'notas' | 'fechaRegistro'>` type export in `src/shared/types/index.ts` (explicit write contract; defeats index-signature omission error per D1)
- [x] 1.3 Identify and remove duplicate `Miembro` declarations from: `src/features/asistencia/types/index.ts`, `src/app/(dashboard)/miembros/[id]/page.tsx`, `src/app/(dashboard)/historial/[id]/page.tsx` (verify exactly one canonical source remains)

## Phase 2: CRUD Module Consolidation (Slice A Foundation)

- [x] 2.1 Export `normalizeMiembro(id: string, data: Record<string, unknown>): Miembro` from `src/shared/firebase/miembros.ts` — pure function defaulting missing/non-boolean `esMiembro` to `false` (D2; mirrors `cleanDataForFirebase` pattern)
- [x] 2.2 Update all read paths in `src/shared/firebase/miembros.ts` (e.g., `fetchMiembros()`, `getMiembroById()`) to map results through `normalizeMiembro()`
- [x] 2.3 Update write-function signatures in `src/shared/firebase/miembros.ts` (`addMiembro`, `updateMiembro`) to accept `MiembroInput` instead of `Omit<Miembro, 'id'>` (D1)
- [x] 2.4 Remove five miembros CRUD functions from `src/shared/lib/utils.ts` (~90 lines): `fetchMiembros`, `addMiembro`, `updateMiembro`, `deleteMiembro`, `getMiembroById`

## Phase 3: Consumer Repointing (Slice A)

- [x] 3.1 Update `src/app/(dashboard)/miembros/page.tsx`: repoint CRUD import from `@/shared/lib/utils` to `@/shared/firebase/miembros`; initialize add-dialog state with `esMiembro: false` on new record
- [x] 3.2 Update `src/app/(dashboard)/miembros/[id]/page.tsx`: remove local `Miembro` declaration, import from `@/shared/types`; repoint CRUD import; guard `new Date(miembro.fechaRegistro)` at lines ~290 and ~325 with optional-chaining fallback (e.g., `miembro.fechaRegistro ? new Date(miembro.fechaRegistro) : null`)
- [x] 3.3 Update `src/app/(dashboard)/historial/[id]/page.tsx`: remove local `Miembro` declaration, import from `@/shared/types`; repoint `fetchMiembros` import from `@/shared/lib/utils` to `@/shared/firebase/miembros`
- [x] 3.4 Update `src/features/asistencia/types/index.ts`: replace `Miembro` declaration with type alias `export type MiembroExtended = Miembro` and import `Miembro` from `@/shared/types` (safe annotation + compile-time guard)

## Phase 4: Migration Service (Slice A)

- [x] 4.1 Create `src/services/miembroTagMigration.ts`: pure `transformMiembroDocument(doc: Record<string, unknown>)` → `{ data: Record<string, unknown>; changed: boolean }` function that sets `esMiembro = true` for `categoria: hermano|hermana`, `false` for `categoria: nino|adolescente|other`, skipping documents already carrying a boolean `esMiembro` (idempotent per spec scenario)
- [x] 4.2 Create `scripts/migrate-miembro-tag.ts`: admin CLI runner with `--dry-run` (default) and `--execute` flags; reads in batches of 500; reports before/after counts; requires explicit `--execute` to mutate Firestore (mirrors `migrate-visitas-simpatizantes-to-amigos.ts` precedent)
- [x] 4.3 Document in migration runner: mandatory `node scripts/backup-firestore.js` before execution; rollback via `node scripts/restore-firestore.js`

## Phase 5: Backend Unit Tests (Slice A)

- [x] 5.1 Create `src/__tests__/firebase/miembros.test.ts`: unit tests for `normalizeMiembro()` covering absent field, `null`, `false`, `true`, non-boolean value → all default to `false` as per D2; no Firestore mock (mirrors amigos test pattern)
- [x] 5.2 Create `src/__tests__/services/miembroTagMigration.test.ts`: unit tests for `transformMiembroDocument()` covering hermano/hermana→true, nino/adolescente→false, idempotency (documents already carrying boolean preserved), dry-run vs execute logic using in-memory dependencies
- [x] 5.3 Run `npm run type-check` and `npm run build` — verify write paths carry `MiembroInput` (D1 guard); build succeeds with consolidated types

## Phase 6: Filter Extraction & UI Foundation (Slice B)

- [x] 6.1 Create `src/shared/lib/miembros-filters.ts`: export `type MembershipFilter = 'todos' | 'miembros' | 'no-miembros'` and pure function `filterMiembros(rows: Miembro[], search?: string, categoria?: string, membership: MembershipFilter = 'todos'): Miembro[]` combining categoria and membership filters (mirrors `sort-utils.ts` structure)
- [x] 6.2 Create `src/shared/ui/switch.tsx`: shadcn Switch component mirroring checkbox, wrapping `@radix-ui/react-switch` (see 6.3 for dependency install)
- [x] 6.3 Install `@radix-ui/react-switch` dependency via `npm install` (shadcn prerequisite); verify lockfile updates

## Phase 7: UI Integration (Slice B)

- [x] 7.1 Update `src/app/(dashboard)/miembros/page.tsx`: add membership `<Select>` control (options: "Todos", "Miembros", "No miembros") beside categoria filter; apply `filterMiembros()` to combined filter state; add `<Badge variant="secondary">Miembro</Badge>` to table rows where `esMiembro === true`; update edit dialog to include `<Switch>` for "Miembro" toggle bound to `esMiembro` field
- [x] 7.2 Update `src/app/(dashboard)/miembros/[id]/page.tsx`: add `<Badge>Miembro</Badge>` display on detail view if `esMiembro === true`; add `<Switch>` for "Miembro" toggle in edit form, updating `esMiembro` on save via `updateMiembro()`

## Phase 8: UI Unit Tests (Slice B)

- [x] 8.1 Create `src/__tests__/lib/miembros-filters.test.ts`: table-driven test cases covering all three membership filter values (`todos`, `miembros`, `no-miembros`) × three categoria values (`hermano`, `nino`, `adolescente`) on plain fixtures (12+ cases; no Firestore mock)
- [x] 8.2 Run `npm run build` and `npm test` — verify all tests pass; no page-level RTL smoke tests (deferred per design; filter logic is pure and tested separately)

---

## Review follow-ups (slice B)

Approved fixes from the gentle-ai review of Slice A, implemented alongside Slice B:

- [x] FIX-1 `src/services/miembroTagMigration.ts`: dry-run branch now returns `success: errors.length === 0` (matching the execute branch) instead of an unconditional `true`, so `scripts/migrate-miembro-tag.ts` exits 1 when a dry run hits an unreadable document. Added test `dry-run reports success: false when a document is unreadable`.
- [x] FIX-2a `src/services/miembroTagMigration.ts`: the batch update payload is now a minimal `{ esMiembro }` object derived per document instead of the whole transformed record, so a concurrent edit to other fields is never reverted by the migration. `transformMiembroDocument`'s public shape and idempotency semantics are unchanged. Added test `writes only the esMiembro field per document, not the whole record`.
- [x] FIX-2b `src/services/miembroTagMigration.ts`: each `writeBatch` call inside `runMiembroTagMigration` is now wrapped in try/catch; a failing batch records its documents' ids into `errors` and later batches still run instead of the whole run aborting unreported. `totalUpdated` now reflects only successful writes. Added test `records a failing batch and still runs later batches`.
- No changes were needed in `scripts/migrate-miembro-tag.ts`: it already forwards `result.success` to the process exit code and passes through `document.data` verbatim, so both fixes are fully contained in the service.

---

## Notes

- **Slice boundary**: Slice A contains no UI presentation changes; Slice B contains no Firestore or type changes. Clean separation permits independent PR review and rollback.
- **Decision point**: Review Workload Forecast shows 750–800 estimated changed lines, exceeding the custom 800-line budget threshold. User MUST decide chain strategy before `sdd-apply` proceeds: **stacked-to-main** (each PR merges to main in order; fast iteration) vs **feature-branch-chain** (accumulate on tracker branch; better rollback control).
- **Migration safety**: `--dry-run` is mandatory first step. `--execute` requires explicit flag and prior backup. Idempotency handles partial success gracefully (unmigrated docs read as false).
- **Backwards compatibility**: If Slice A ships alone (rare), new records default to `esMiembro: false` (same as backfilled default). If Slice B ships alone (not recommended), UI has no toggle — documents stay with field values set by Slice A.

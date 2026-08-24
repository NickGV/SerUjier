# Exploration: Member tag / membership classification for the Miembros collection

> Phase: sdd-explore | Change: member-tag | Date: 2026-08-21
> Note: one finding from the exploration sub-agent ("corrupted CRUD file") was refuted by orchestrator verification; see Corrections section.

## Problem Statement

The "Miembros" tab lists people who are NOT all actual church members:
- Children (niños) appear under Miembros but are not members.
- Some adolescents (adolescentes) ARE members, others are not yet classified as "hermanos" (full members).

The app needs a "member" classification on people in the `miembros` collection, independent of their `categoria` (life-stage bucket). A prior saved feature request also notes a possible future need for MULTIPLE tags per person (e.g., a "joven" who is also a "hermano").

## Current State

- Firestore collection `miembros` stores people under a single required field `categoria: 'hermano' | 'hermana' | 'nino' | 'adolescente'` (`src/shared/types/index.ts:30-38`, type `Miembro`). There is no membership flag; `categoria` is overloaded to mean both "life-stage bucket" and (incorrectly, per the problem statement) "membership status".
- The Miembros feature has NOT been migrated to the modern feature-folder pattern used by `amigos`/`he-restauracion`. `src/features/miembros/hooks/use-miembros.ts` (a `useFirebaseCRUD`-based hook) exists but is dead code — only its own barrel `index.ts` references it (verified). The real UI (`src/app/(dashboard)/miembros/page.tsx` and `[id]/page.tsx`) are monolithic page components that call CRUD functions from `src/shared/lib/utils.ts` directly.
- The `Miembro` shape is duplicated across 4 files (verified): `src/shared/types/index.ts`, `src/features/asistencia/types/index.ts`, `src/app/(dashboard)/historial/[id]/page.tsx` (local interface), `src/app/(dashboard)/miembros/[id]/page.tsx` (local interface).
- TWO parallel CRUD implementations exist for the same collection (verified): `src/shared/lib/utils.ts` (fetch/add/update/delete/getById — used by the miembros pages) and `src/shared/firebase/miembros.ts` (same five functions — re-exported via `src/shared/firebase/index.ts`, consumed by the attendance flow, e.g. `ConteoPage.tsx` imports `fetchMiembros` from `@/shared/firebase`).
- Attendance/counting (`src/features/asistencia/**`) and historial stats (`src/app/(dashboard)/historial/page.tsx`) are keyed ENTIRELY by `categoria` (`hermano/hermana/nino/adolescente`) plus separate collections/counters for `amigos`, `heRestauracion`, `hermanosVisitas`. `asistencia/utils/helpers.ts`, `MiembrosDialog.tsx`, `use-conteo-counters.ts`, and `conteo-calculations.ts` all filter/aggregate solely on `m.categoria` — none read a membership flag. A new member tag is additive and does not require touching the counting/attendance/historial pipeline unless the business later wants member-only breakdowns.
- No existing "tags" precedent on `Miembro`. Closest precedents: `Permission[]` on `User` built from a `MODULES`/`ALL_PERMISSIONS` const-array (`shared/types/permisos.ts`), and `Amigo.migratedFrom: 'visitas' | 'simpatizantes' | null` (nullable provenance tag).
- `firestore.rules` has no field-level schema validation (`miembros/{miembroId}` only checks `request.auth != null`), so adding a field needs no rules change; existing documents will simply lack the new field until backfilled or defaulted at read-time.
- Migration precedent: `scripts/migrate-visitas-simpatizantes-to-amigos.ts` + `src/services/amigosMigration.ts` (pure, dependency-injected, unit-tested transform/validate logic) + `scripts/backup-firestore.js`/`restore-firestore.js`. This is the established pattern for any backfill this feature would need.
- Testing: `src/__tests__/` mirrors `src/` per feature. `amigos` has full coverage (hooks, components, integration, services, firebase). `miembros` has zero test files.

## Corrections (orchestrator-verified)

- The exploration sub-agent reported `src/shared/firebase/miembros.ts` as "corrupted/non-compiling TypeScript". This is FALSE: the file was read in full and is valid, complete TypeScript (five well-formed async functions). The recent `npm run build` fix commit also implies the project compiles. The real (verified) concern is DUPLICATION: two parallel CRUD modules for the same collection, plus 4 duplicated `Miembro` type declarations.

## Affected Surface

- `src/shared/types/index.ts` — `Miembro` interface / `miembroCategoria` type; source-of-truth location for the new field.
- `src/shared/lib/utils.ts` — miembros CRUD used by the pages; inline `Miembro`-shaped parameter types.
- `src/shared/firebase/miembros.ts` — parallel CRUD module for the same collection (valid code, duplicated responsibility).
- `src/app/(dashboard)/miembros/page.tsx` — list, stats grid, category filter (`filtroCategoria`), add/edit dialogs.
- `src/app/(dashboard)/miembros/[id]/page.tsx` — detail view + local duplicated `Miembro` interface + edit dialog.
- `src/features/miembros/hooks/use-miembros.ts` — dead hook; only relevant if this feature is migrated to the modern pattern.
- `src/features/asistencia/types/index.ts` (`MiembroExtended`), `components/MiembrosDialog.tsx`, `utils/helpers.ts` — filter only by `categoria` today; unaffected unless member-only attendance breakdowns are requested later.
- `src/app/(dashboard)/historial/page.tsx` and `historial/[id]/page.tsx` — aggregate by `categoria`, not membership; unaffected under the same condition.
- `firestore.rules` — no change needed.
- Potential new `src/services/miembroTagMigration.ts` + `scripts/migrate-miembro-tag.ts` — only if a backfill is chosen for existing documents.
- `src/__tests__/` — no existing miembros tests to extend; new suite needed from scratch (mirror `amigos` layout).

## Approaches

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| 1. Boolean flag `esMiembro: boolean` | Matches the concrete ask exactly; simplest UI (switch) and filter (`todos\|miembros\|no-miembros`); smallest type-surface change | Doesn't represent the noted future multi-tag need; a second tag later needs another ad-hoc field or a migration | Low |
| 2. Tags array `tags: MiembroTag[]` (today only `'miembro'`), mirroring the `Permission[]`/`MODULES` const-array precedent | Forward-compatible with the stated multi-tag need without a future breaking migration; reuses an established codebase idiom | Larger surface for a feature that today needs one value; filter/stat logic needs `.includes()` | Medium (Low if UI stays a single switch) |
| 3. Derive from `categoria` (`hermano`/`hermana` => member) | Zero data-model change, zero migration | FAILS the explicit requirement — some adolescentes already ARE members while others aren't, so a pure derivation can't represent per-person overrides. Rejected. | N/A |

## Recommendation

Start with the boolean flag (`esMiembro: boolean`, default `false`) as the concrete, low-risk fix — do not derive it from `categoria`. A later, additive generalization to `tags: MiembroTag[]` (mirroring `permisos.ts`) remains compatible if a second simultaneous tag becomes a concrete requirement. This trade-off must be confirmed with the product owner in sdd-propose, not decided here.

sdd-propose should also explicitly scope whether to consolidate the two duplicate CRUD implementations and the 4 duplicated `Miembro` type declarations as part of this change, or defer — adding a field to a type duplicated across 4 locations raises inconsistency risk either way.

## Risks

- `Miembro` shape duplicated across 4 files — high chance of an incomplete/inconsistent rollout if any is missed.
- Two parallel CRUD modules for the `miembros` collection — a new field's write path must cover both or consolidate them.
- `miembros` feature has zero test coverage today; needs a decision on whether this change also seeds first-time tests.
- Existing Firestore `miembros` documents will lack the new field — decide default-at-read (`?? false`) vs one-time backfill script.
- Member-only attendance/historial breakdowns would require wiring the new field into `asistencia/utils/helpers.ts`, `use-conteo-counters.ts`, `conteo-calculations.ts`, and `historial/page.tsx` — explicitly out of scope for the stated ask; recorded as deferred, not forgotten.

## Ready for Proposal

Yes — scope is well understood. Open product decisions for sdd-propose:
1. Data model: boolean `esMiembro` vs tags array.
2. Scope: consolidate duplicated CRUD/types in this change or defer.
3. Legacy documents: default-at-read vs backfill script.
4. Tests: seed the first miembros test suite in this change or not.

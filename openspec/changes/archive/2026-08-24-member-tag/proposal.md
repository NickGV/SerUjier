# Proposal: Membership flag (`esMiembro`) for Miembros

## Intent

Not everyone in the `miembros` collection is a church member: niños never are, only some adolescentes are. `categoria` is overloaded as life-stage bucket *and* membership status, so the app cannot answer "who is a member". Add an explicit flag — after removing the duplication that would otherwise make the rollout inconsistent.

## Scope

### In Scope

- `esMiembro: boolean` (default `false`) on `Miembro`; `categoria` keeps life-stage meaning only.
- One type source: drop duplicate `Miembro` in `features/asistencia/types`, `historial/[id]`, `miembros/[id]`; all import `shared/types`.
- One CRUD module: `shared/firebase/miembros.ts` canonical (matches documented architecture); miembros functions leave `shared/lib/utils.ts`, pages repoint.
- UI (Spanish copy): "Miembro" switch in add/edit dialogs; shadcn Badge on member rows; filter `todos | miembros | no miembros` beside the categoria filter; status view/edit on the detail page.
- Backfill: `services/miembroTagMigration.ts` (pure transform) + `scripts/migrate-miembro-tag.ts`.
- First `miembros` tests (mirror `amigos`): field default, filter behavior, transform.

### Out of Scope

- `tags[]` multi-tag model — additive later, non-breaking.
- Feature-folder migration; `features/miembros/hooks/use-miembros.ts` stays dead code.
- Member-only asistencia / conteo / historial breakdowns.
- `firestore.rules` field validation.

## Capabilities

### New Capabilities

- `miembros`: member registry — record fields including membership status, CRUD, list filtering, legacy backfill.

### Modified Capabilities

- None (`openspec/specs/` is empty).

## Approach

Read-tolerant plus backfill: the canonical type declares `esMiembro: boolean`, read paths default legacy documents to `false`, writes always set it. Consolidation lands **before** the field so it is added once instead of four times. The pure transform sits in `src/services/` mirroring `amigosMigration.ts` — unit-testable without Firestore.

## Migration / Backfill

1. `scripts/backup-firestore.js` first — mandatory.
2. `scripts/migrate-miembro-tag.ts`: `hermano|hermana → true`, `nino|adolescente → false`.
3. Idempotent: documents already carrying the field are skipped.
4. Adolescent members corrected manually in the UI afterwards (low volume, expected).
5. Not-yet-backfilled documents read as non-members, so mid-migration state stays consistent.

Requires Firestore admin credentials, same as existing migrations.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `shared/types/index.ts` | Modified | `esMiembro` on canonical `Miembro` |
| `shared/firebase/miembros.ts` | Modified | canonical CRUD; reads/writes field |
| `shared/lib/utils.ts` | Removed | duplicate miembros CRUD deleted |
| `miembros/page.tsx` | Modified | badge, filter, dialog switch |
| `miembros/[id]/page.tsx` | Modified | local type removed; status view/edit |
| `features/asistencia/types`, `historial/[id]/page.tsx` | Modified | duplicate types removed |
| `services/miembroTagMigration.ts`, `scripts/migrate-miembro-tag.ts` | New | backfill transform + runner |
| `src/__tests__/` (miembros) | New | first coverage |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CRUD consolidation breaks attendance (`ConteoPage` imports `fetchMiembros`) | Med | keep identical signatures; `npm run build` + `npm test` gate |
| Backfill mislabels adolescentes | High (by design) | documented manual correction; flag is UI-editable |
| Consolidation + tests exceed the 800-line review budget (projected ~700–820) | Med | if `sdd-tasks` projects over: slice A = types/CRUD/field/migration, slice B = list badge, filter, detail UI + UI tests |
| `[key: string]: unknown` on `Miembro` hides a missed write path | Med | explicit default + write-path test |

## Rollback Plan

- **Code**: revert the PR (slice B then A). `esMiembro` becomes an ignored extra Firestore field — no reverted read path requires it.
- **Data**: `scripts/restore-firestore.js` from the pre-migration backup; only one field was mutated, so blast radius is one field.
- **Partial failure**: a half-finished backfill is a consistent conservative UI state, not an outage.

## Open Questions (confirm before sdd-spec)

1. Add a "miembros" count to the stats grid, or keep it categoria-only?
2. Does the list default to `todos` or open filtered to `miembros`?
3. May any authenticated user toggle membership, or directiva/admin only?

## Success Criteria

- [ ] `Miembro` declared in exactly one file.
- [ ] No miembros CRUD left in `shared/lib/utils.ts`.
- [ ] Niño and non-member adolescente show no badge; an adolescente toggled to member does.
- [ ] Filter correct for all three values, combinable with the categoria filter.
- [ ] Backfill idempotent; backup restorable.
- [ ] `npm test` and `npm run build` pass; miembros coverage exists where there was none.

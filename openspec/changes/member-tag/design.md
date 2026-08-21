# Design: Membership flag (`esMiembro`) for Miembros

## Technical Approach

Consolidate first, then add the field, then extract filtering. One `Miembro` declaration and one CRUD
module mean the field is added once; an explicit read boundary defaults legacy documents to `false`;
an explicit write type turns a missed write path into a `tsc` error. Filtering moves to a pure helper
so membership behavior is testable without rendering the 733-line page. Pages stay monolithic — every
edit is local.

## Architecture Decisions

**D1 — Write contract `MiembroInput`, not `Omit<Miembro, 'id'>`.** `Miembro` carries
`[key: string]: unknown`, so `keyof Miembro` is `string | number` and `Omit<Miembro, 'id'>` collapses
into an index-signature-only type — `addMiembro({ foo: 1 })` compiles today. An explicit `Pick`
defeats the index signature, so "forgot `esMiembro`" fails type-check. *Rejected*: keeping `Omit`
(zero write safety); deleting the index signature (breaks dynamic indexing in `asistencia` types,
out of scope).

**D2 — One exported pure read boundary.** `normalizeMiembro` is exported and unit-tested directly,
mirroring `cleanDataForFirebase` in `firebase/amigos`, whose test uses no Firestore mock.
*Rejected*: `?? false` at each usage (6+ sites, drifts); a Firestore converter (new abstraction for
one field).

**D3 — `shared/firebase/miembros.ts` is canonical; the `utils.ts` copies are deleted.** It matches
the documented architecture and `ConteoPage`, which already imports from `@/shared/firebase`.
`fetchMiembros(): Promise<Miembro[]>` and `getMiembroById(id): Promise<Miembro>` keep their
signatures, so attendance is untouched. **Discovered in design**: `historial/[id]/page.tsx:8` also
imports `fetchMiembros` from `@/shared/lib/utils` — three consumers to repoint, not two.

**D4 — Filter extracted, markup edited in place.** `shared/lib/miembros-filters.ts` (pure, mirrors
`sort-utils.ts`) replaces the inline `.filter()` at near-zero net lines and makes the three filter
values testable combined with the categoria filter. Badge, Switch and Select markup stay inline.

## Data Flow

```
Firestore doc (legacy: field absent)
  → normalizeMiembro()   single default: missing/non-boolean → false
  → filterMiembros(search, categoria, membership) → rows + Badge
  → Switch (add/edit dialog) → MiembroInput → addMiembro/updateMiembro → Firestore
scripts/migrate-miembro-tag.ts → miembroTagMigration (admin SDK, one-time) → Firestore
```

## File Changes

Slice A never touches presentation, slice B never touches persistence — a clean split if the
tasks-phase forecast triggers the proposal's two-slice fallback.

| File | Action | Description | Slice |
|---|---|---|---|
| `src/shared/types/index.ts` | Modify | `esMiembro: boolean`; add `MiembroInput` | A |
| `src/shared/firebase/miembros.ts` | Modify | export `normalizeMiembro`, reads map through it, write signatures use `MiembroInput` | A |
| `src/shared/lib/utils.ts` | Modify | delete the five miembros functions (~90 lines) | A |
| `src/app/(dashboard)/miembros/page.tsx` | Modify | repoint CRUD import; `esMiembro: false` in add-dialog state | A |
| `src/app/(dashboard)/miembros/[id]/page.tsx` | Modify | drop local `Miembro`, repoint CRUD, guard `fechaRegistro` at lines 290/325 (optional in the shared type) | A |
| `src/app/(dashboard)/historial/[id]/page.tsx` | Modify | drop local `Miembro`; repoint `fetchMiembros` | A |
| `src/features/asistencia/types/index.ts` | Modify | `MiembroExtended = Miembro` alias — only an annotation and `as`-cast target, so safe | A |
| `src/services/miembroTagMigration.ts` | Create | pure transform + dependency-injected runner | A |
| `scripts/migrate-miembro-tag.ts` | Create | admin runner; `--dry-run` default, `--execute` explicit | A |
| `src/__tests__/firebase/miembros.test.ts`, `src/__tests__/services/miembroTagMigration.test.ts` | Create | read default, transform, idempotency | A |
| `src/shared/lib/miembros-filters.ts` | Create | `MembershipFilter` + pure `filterMiembros` | B |
| `src/shared/ui/switch.tsx` (+ `@radix-ui/react-switch`) | Create | shadcn Switch mirroring `checkbox.tsx` | B |
| both miembros pages | Modify | Switch, row Badge, membership Select beside categoria, detail view/edit | B |
| `src/__tests__/lib/miembros-filters.test.ts` | Create | three filter values × categoria | B |

## Interfaces / Contracts

```ts
// src/shared/types/index.ts
export interface Miembro { /* ...existing... */ esMiembro: boolean; [key: string]: unknown }
export type MiembroInput = Pick<Miembro,
  'nombre' | 'telefono' | 'categoria' | 'esMiembro' | 'notas' | 'fechaRegistro'>; // see D1

// src/shared/firebase/miembros.ts — see D2
export function normalizeMiembro(id: string, data: Record<string, unknown>): Miembro {
  return { ...data, id, esMiembro: data.esMiembro === true } as Miembro;
}

export type MembershipFilter = 'todos' | 'miembros' | 'no-miembros';
export function deriveEsMiembro(categoria: unknown): boolean; // hermano|hermana → true, else false
export function transformMiembroDocument(doc: Record<string, unknown>):
  { data: Record<string, unknown>; changed: boolean }; // existing boolean preserved
```

`chunkArray` is imported from `@/services/amigosMigration`, not duplicated. UI copy is Spanish
(`Miembro`, `Todos | Miembros | No miembros`); identifiers and comments are English.

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Unit | `normalizeMiembro`: absent, `null`, `false`, `true`, non-boolean | direct calls on raw records, no Firestore mock (amigos precedent) |
| Unit | membership × categoria × search | table-driven cases on plain fixtures |
| Unit | derive, idempotency, dry-run vs execute | in-memory deps, mirroring `amigosMigration.test.ts` |
| Types | every write path carries `esMiembro` | `npm run type-check` — the gate that compensates for the index signature (D1) |
| Manual | Badge, Switch, filter render | `npm run build` + smoke; no RTL page test (would need mocking `@/shared/firebase` and `use-permisos`) |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or
process-integration boundary. `scripts/migrate-miembro-tag.ts` is a manually invoked admin data
script following the `migrate-visitas-simpatizantes-to-amigos.ts` precedent; its safety is covered
below.

## Migration / Rollout

`node scripts/backup-firestore.js` is mandatory and gates execution. `--dry-run` (the default when
no flag is passed) reports counts and writes nothing. `--execute` updates only documents lacking a
boolean `esMiembro`, in batches of 500. Adolescente members are corrected afterwards in the UI.
Rollback is `scripts/restore-firestore.js`; a partial backfill is a consistent conservative state
because unmigrated documents read as `false` (D2). If slice A ships alone, new records get
`esMiembro: false` until slice B adds the Switch — same conservative default, no hidden derivation
policy inside a page.

## Open Questions

- [ ] Slice B adds `@radix-ui/react-switch` (install + lockfile churn). Zero-dependency fallback:
      the installed `Checkbox` — but that deviates from the locked "Switch" UI decision.
- [ ] Page-level RTL coverage deliberately deferred; the extracted pure helpers carry the logic.

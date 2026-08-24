# Delta for Miembros

## ADDED Requirements

### Requirement: Membership Field on Miembro

`Miembro` MUST declare `esMiembro: boolean`, defaulting to `false`. `categoria` (`hermano|hermana|nino|adolescente`) MUST keep life-stage meaning only and MUST NOT be read as membership status.

#### Scenario: New record without toggling membership

- GIVEN a user creates a miembro without enabling "Miembro"
- WHEN the record is saved
- THEN `esMiembro` MUST persist as `false`

#### Scenario: Legacy document missing the field

- GIVEN a Firestore `miembros` document with no `esMiembro` field
- WHEN the app reads the record
- THEN the UI MUST treat it as `esMiembro: false`

### Requirement: Single Type Source of Truth

The canonical `Miembro` type MUST be declared exactly once, in `src/shared/types/index.ts`. Duplicates in `features/asistencia/types`, `historial/[id]/page.tsx`, and `miembros/[id]/page.tsx` MUST be removed and MUST import from `shared/types` instead.

#### Scenario: Exactly one declaration

- GIVEN the codebase after this change
- WHEN searching for `Miembro` declarations
- THEN exactly one MUST exist, in `shared/types/index.ts`

#### Scenario: Build succeeds after consolidation

- GIVEN all four former locations now import the shared type
- WHEN `npm run build` runs
- THEN it MUST succeed with no type errors

### Requirement: Single CRUD Module

Miembros CRUD (fetch/add/update/delete/getById) MUST live exclusively in `src/shared/firebase/miembros.ts`. The duplicate MUST be removed from `shared/lib/utils.ts`. Existing exported signatures MUST NOT change.

#### Scenario: Attendance flow keeps working

- GIVEN `ConteoPage.tsx` imports `fetchMiembros` from `@/shared/firebase`
- WHEN the consolidation lands
- THEN `fetchMiembros` behavior and signature MUST remain unchanged

#### Scenario: Miembros pages use the canonical module

- GIVEN `miembros/page.tsx` and `miembros/[id]/page.tsx` after consolidation
- WHEN they perform CRUD
- THEN they MUST call `shared/firebase/miembros.ts`; `shared/lib/utils.ts` MUST contain no miembros CRUD

### Requirement: Legacy Data Backfill

A one-time, manual script MUST set `esMiembro` on existing `miembros` documents: `hermano|hermana` -> `true`; `nino|adolescente` -> `false`. It MUST be idempotent (skip documents already carrying the field) and MUST run only after a Firestore backup.

#### Scenario: First run backfills a legacy document

- GIVEN a document with `categoria: hermano` and no `esMiembro` field
- WHEN the backfill script runs
- THEN the document MUST be updated to `esMiembro: true`

#### Scenario: Idempotent re-run

- GIVEN a document that already has `esMiembro` set
- WHEN the backfill script runs again
- THEN its value MUST remain unchanged

### Requirement: Membership Toggle in Add/Edit Dialog

The miembros add/edit dialog MUST expose a Spanish "Miembro" switch bound to `esMiembro`. Saving MUST require no permission beyond existing miembro edit access.

#### Scenario: Toggling membership on an adolescente

- GIVEN a user edits an adolescente miembro
- WHEN they enable "Miembro" and save
- THEN `esMiembro` MUST persist as `true` and `categoria` MUST remain `adolescente`

### Requirement: Member Badge on List and Detail

The miembros list rows and detail page MUST show a Badge when `esMiembro` is `true`, and none when `false`. The attendance `MiembrosDialog` MUST NOT show this badge.

#### Scenario: Niño shows no badge

- GIVEN a miembro with `categoria: nino`
- WHEN the miembros list renders
- THEN no member badge MUST appear for that row

#### Scenario: Toggled adolescente shows badge

- GIVEN an adolescente miembro with `esMiembro: true`
- WHEN the list or detail page renders
- THEN the member badge MUST appear

### Requirement: Membership Filter

The miembros list MUST offer a membership filter (`todos | miembros | no miembros`) beside the categoria filter, combinable with it, defaulting to `todos`.

#### Scenario: Filter narrows to members only

- GIVEN miembros with mixed `esMiembro` values
- WHEN the user selects `miembros`
- THEN only records with `esMiembro: true` MUST be shown

#### Scenario: Combined with categoria filter

- GIVEN categoria `adolescente` and membership `miembros` are both active
- WHEN the list renders
- THEN only adolescente members MUST be shown

### Requirement: Stats Grid Unchanged

The miembros stats grid MUST keep aggregating by `categoria` only; this change MUST NOT add a membership count.

#### Scenario: Stats grid after the change

- GIVEN the miembros page after this change
- WHEN the stats grid renders
- THEN counts MUST match the prior categoria-only breakdown, with no member/non-member count added

### Requirement: First Miembros Test Coverage

This change MUST add the first `src/__tests__` coverage for `miembros`, mirroring `amigos`: field default, filter behavior, and the backfill transform.

#### Scenario: Test suite passes

- GIVEN the miembros test suite added by this change
- WHEN `npm test` runs
- THEN tests for field default, filter behavior, and migration transform MUST pass

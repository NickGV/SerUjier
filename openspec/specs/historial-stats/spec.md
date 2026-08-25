# Historial Stats Specification

## Purpose

Read-only attendance statistics for `historial`: stale amigos, servicio health, and members who keep missing — no Firestore writes.

## ADDED Requirements

### Requirement: Estadísticas Route

The system MUST expose the stats view at the static segment `historial/estadisticas/`, coexisting with `historial/[id]` and reachable via an entry link from the list page. Chart and aggregation code MUST NOT appear in the list page's build chunk.

#### Scenario: Reaching the view without growing the list bundle

- GIVEN a user on the historial list
- WHEN they follow the Estadísticas link and `npm run build` runs
- THEN the stats view renders in its own bundle, and the list chunk contains no `recharts` import or aggregation code

### Requirement: Historial Record Normalization

The system MUST provide one shared `normalizeHistorialRecord` resolving the legacy `simpatizantes` → `amigos` fallback. Both `historial/page.tsx` and `historial/[id]/page.tsx` MUST adopt it, dropping their inline `??` chains; no third normalization implementation MUST exist.

#### Scenario: Legacy record normalized and counted

- GIVEN a raw record with `simpatizantes` (no `amigos`) and `simpatizantesAsistieron`
- WHEN `normalizeHistorialRecord` processes it
- THEN `amigos` and `amigosAsistieron` are populated from the legacy fields and counted correctly downstream

### Requirement: Amigos Follow-up Table

The system MUST render one all-time table listing every amigo once, with last attended fecha + servicio and days since, sorted stalest-first. Amigos never visited MUST appear in the same table, sorted last, shown as "nunca", and this table MUST NOT be scoped by the date-range filter.

#### Scenario: Amigo with a recorded visit

- GIVEN an amigo who attended on multiple dates
- WHEN the table is built
- THEN they appear once with their latest fecha, servicio, and days-since-visit

#### Scenario: Amigo never visited

- GIVEN an amigo with zero appearances in any historial record
- WHEN the table is built
- THEN they appear in the same table, sorted last, showing "nunca"

#### Scenario: Date-range filter has no effect

- GIVEN a desde/hasta range is set in the stats view
- WHEN the table renders
- THEN it still reflects each amigo's true all-time last visit

### Requirement: Per-Servicio Averages Chart

For each of the 9 `servicio` enum values (dominical, oracion, dorcas, evangelismo, misionero, jovenes, intercesion, obra-social, alabanza), the system MUST compute average `total` and record count, scoped to the selected desde/hasta range, and render a recharts bar chart loaded via `next/dynamic(ssr:false)`.

#### Scenario: Servicio type with zero records shows no NaN, scoped by range

- GIVEN no record has `servicio: "obra-social"` within the active desde/hasta range
- WHEN averages are computed
- THEN that entry renders an empty state (never `NaN`), and only records inside the range contributed

### Requirement: Top Faltantes Ranking

The system MUST rank `esMiembro: true` miembros by services missed within a fixed last-90-days window, counting a miss for ANY servicio type in that window; this ranking MUST NOT be scoped by the date-range filter.

#### Scenario: Non-member excluded

- GIVEN an attendee with `esMiembro: false` or absent
- WHEN the ranking is computed
- THEN they do not appear in it

#### Scenario: Records outside the 90-day window excluded

- GIVEN a record dated over 90 days ago
- WHEN the ranking is computed
- THEN it does not contribute, even under an active date-range filter

### Requirement: Pure Aggregation Helpers

The system MUST implement the amigos follow-up, per-servicio averages, and top-faltantes computations as pure, framework-free functions in `src/shared/lib/historial-stats.ts`, each with a 1:1 test file under `src/__tests__/lib/`.

#### Scenario: Tests cover each helper

- WHEN `src/__tests__/lib/` is inspected
- THEN a test file exercises each exported function, including a legacy-normalization case and an empty-input case

### Requirement: Orphaned Stats Code Removed

The system MUST delete `src/features/historial/components/historial/{StatsSummary,CategoryGrid,utils}`, since nothing imports them and no third parallel stats implementation MUST be introduced.

#### Scenario: Dead files removed

- WHEN the repository is inspected after this change
- THEN those three files no longer exist

### Requirement: Historial Detail Redundant Quick-Stat Removed

The `historial/[id]` quick-stat card labeled "Total Asistentes" rendered `allMembers.length` (total registered miembros), which did not match its label. Correcting the value to that record's own attendee count made it an exact duplicate of the adjacent "Asistentes" card, so the system MUST remove the card instead and render the remaining quick stats as a two-column grid.

> Decision history: this requirement originally read "Historial Detail Quick-Stat Label Fix" and mandated repointing the value to `asistentes.length`. That fix was implemented in slice B and immediately produced two cards showing an identical number under near-identical labels. The owner reviewed the result on 2026-08-25 and chose removal over relabeling, since the "Asistentes" card already carries that figure.

#### Scenario: Duplicate card is gone

- GIVEN the historial detail view for any record
- WHEN the quick-stat row renders
- THEN exactly two cards appear, "Asistentes" and "Faltantes", and no card labeled "Total Asistentes" exists

#### Scenario: No attendee count is lost

- GIVEN a record with a known attendee total
- WHEN the quick-stat row renders
- THEN the "Asistentes" card still shows that record's own attendee count

### Requirement: Read-Only Behavior

The system MUST NOT write, migrate, or modify any Firestore document, field, or rule to deliver this feature; it MUST only read via `fetchHistorial()`, `fetchMiembros()`, and `fetchAmigos()`.

#### Scenario: No writes introduced

- WHEN the stats view's code path is inspected
- THEN it contains no Firestore write, update, or delete call

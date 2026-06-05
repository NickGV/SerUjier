# Design: Unify Visitas and Simpatizantes Categories

## Technical Approach

Merge the structurally identical 'visitas' and 'simpatizantes' entities into a unified 'amigos' entity to eliminate code duplication. This involves creating a unified data model, migrating existing data, updating permission checks, consolidating UI components, and unifying state management while maintaining backward compatibility during transition.

## Architecture Decisions

### Decision: Unified Data Model Approach

**Choice**: Create a single 'amigos' Firestore collection with a 'migrated_from' field to track origin
**Alternatives considered**:

1. Keep separate collections but unify in application layer (rejected: still duplicates Firestore reads/writes)
2. Use collection groups with unified security rules (rejected: complex, overkill for this use case)
3. Create view/entity abstraction layer (rejected: adds unnecessary complexity)
   **Rationale**: Direct migration to unified collection simplifies queries, maintains data integrity, and provides clean separation from legacy data while allowing backward compatibility reads.

### Decision: Permission System Granularity

**Choice**: Map existing visitas._ and simpatizantes._ permissions 1:1 to amigos.\* equivalents
**Alternatives considered**:

1. Create new broader permissions (amigos:read, amigos:write) (rejected: loses granularity, over-permissioning)
2. Implement role-based access control (rejected: significant scope creep beyond change)
   **Rationale**: Preserves existing security model exactly while changing only the namespace, minimizing risk and testing burden.

### Decision: UI Component Strategy

**Choice**: Create new amigos dialog that supersedes both visitas and simpatizantes dialogs
**Alternatives considered**:

1. Conditional rendering in existing dialogs based on entity type (rejected: complex props, harder to maintain)
2. Higher-order component wrapping shared logic (rejected: still maintains two similar components)
   **Rationale**: Clean slate approach eliminates conditional complexity and ensures consistent UI/UX.

### Decision: State Management Pattern

**Choice**: Replace separate visitas/simpatizantes slices with unified amigos slice in Redux store
**Alternatives considered**:

1. Keep separate slices but create combined selectors (rejected: doesn't eliminate duplicate state/logic)
2. Use React Context instead of Redux (rejected: would require larger refactor beyond scope)
   **Rationale**: Direct replacement maintains existing store patterns while eliminating duplication.

## Data Flow

```
User Action → Amigos Service Layer → Firestore (amigos collection)
                                   ↖               ↗
Legacy Read Fallback ← Visitas/Simpatizantes Collections (read-only during transition)
                                   ↓
Migration Script (one-time) → Visitas/Simpatizantes Collections → Amigos Collection
                                   ↓
Export Pipeline ← Amigos State Selector
                                   ↓
UI Components ← Amigos State (Redux)
                                   ↓
Permission Middleware ← Amigos.* Namespace Checks
```

## File Changes

| File                                                       | Action | Description                                                                                  |
| ---------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `src/types/amigos.ts`                                      | Create | Unified Amigos type definition with all fields from visitas/simpatizantes plus migrated_from |
| `src/types/visitas.ts`                                     | Delete | Remove redundant type (after validation period)                                              |
| `src/types/simpatizantes.ts`                               | Delete | Remove redundant type (after validation period)                                              |
| `src/firebase/amigos.ts`                                   | Create | CRUD operations for amigos collection                                                        |
| `src/firebase/visitas.ts`                                  | Modify | Add backward-compatible read functions (transition period)                                   |
| `src/firebase/simpatizantes.ts`                            | Modify | Add backward-compatible read functions (transition period)                                   |
| `src/permissions/amigos.ts`                                | Create | Permission checking functions using amigos.\* namespace                                      |
| `src/permissions/visitas.ts`                               | Delete | Remove after validation period                                                               |
| `src/permissions/simpatizantes.ts`                         | Delete | Remove after validation period                                                               |
| `src/components/amigos/AmigosFormDialog.tsx`               | Create | Unified dialog for create/edit operations                                                    |
| `src/components/visitas/VisitasFormDialog.tsx`             | Delete | Remove after validation period                                                               |
| `src/components/simpatizantes/SimpatizantesFormDialog.tsx` | Delete | Remove after validation period                                                               |
| `src/store/amigosSlice.ts`                                 | Create | Unified Redux slice for amigos state management                                              |
| `src/store/visitasSlice.ts`                                | Delete | Remove after validation period                                                               |
| `src/store/simpatizantesSlice.ts`                          | Delete | Remove after validation period                                                               |
| `src/utils/export/amigosExport.ts`                         | Create | Export functions processing amigos data                                                      |
| `src/utils/export/visitasExport.ts`                        | Modify | Point to amigos export (transition)                                                          |
| `src/utils/export/simpatizantesExport.ts`                  | Modify | Point to amigos export (transition)                                                          |
| `src/pages/AmigosListPage.tsx`                             | Create | Unified management page                                                                      |
| `src/pages/VisitasListPage.tsx`                            | Delete | Remove after validation period                                                               |
| `src/pages/SimpatizantesListPage.tsx`                      | Delete | Remove after validation period                                                               |
| `src/navigation/amigosNav.tsx`                             | Create | Navigation item for amigos                                                                   |
| `src/navigation/visitasNav.tsx`                            | Modify | Redirect to amigos (transition)                                                              |
| `src/navigation/simpatizantesNav.tsx`                      | Modify | Redirect to amigos (transition)                                                              |
| `scripts/migrate-visitas-simpatizantes-to-amigos.ts`       | Create | Data migration script with dry-run/backup capabilities                                       |
| `src/metadata/amigos.ts`                                   | Create | Metadata definitions for amigos entity                                                       |
| `src/metadata/visitas.ts`                                  | Delete | Remove after validation period                                                               |
| `src/metadata/simpatizantes.ts`                            | Delete | Remove after validation period                                                               |

## Interfaces / Contracts

### Amigos Type Definition

```typescript
export interface Amigo {
  id: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  fechaNacimiento: string | null; // ISO date string
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  codigoPostal: string | null;
  fechaIngreso: string | null; // ISO date string
  estado: 'activo' | 'inactivo' | 'pendiente';
  observaciones: string | null;
  migratedFrom: 'visitas' | 'simpatizantes' | null; // Tracks origin for migration
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

### Permission Contract

```typescript
// Before (examples)
const canCreateVisitas = user.permissions.includes('visitas:create');
const canEditSimpatizantes = user.permissions.includes('simpatizantes:edit');

// After (equivalent functionality)
const canCreateAmigo = user.permissions.includes('amigos:create');
const canEditAmigo = user.permissions.includes('amigos:edit');
```

### Export Function Signature

```typescript
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  fields?: string[]; // Specific fields to include (null for all)
  filters?: Record<string, any>; // Query filters
  includeHeaders: boolean;
}

export const exportAmigosData = async (
  options: ExportOptions
): Promise<Blob> => {
  // Implementation processes amigos collection data
};
```

## Testing Strategy

| Layer       | What to Test                                                                      | Approach                                                            |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Unit        | Amigos type validation, permission functions, export formatting                   | Jest tests with mock data covering edge cases                       |
| Integration | Firestore read/write operations, migration script, state updates                  | Firebase emulator suite with test data collections                  |
| Component   | Amigos dialog rendering, form validation, loading states                          | React Testing Library with user interaction simulation              |
| E2E         | Full user journeys: create/view/edit/delete amigo, export data, permission checks | Cypress tests against staging environment                           |
| Migration   | Data integrity, count preservation, backward compatibility                        | Script tested with production data snapshot in isolated environment |

## Migration / Rollout

### Migration Script Approach

1. **Pre-migration**: Backup visitas and simpatizantes collections
2. **Dry-run mode**: Validate script logic without writing data
3. **Execution**:
   - Read all documents from visitas collection
   - Read all documents from simpatizantes collection
   - For each document, create amigo document with migratedFrom field set
   - Preserve all original fields and timestamps
   - Log progress and errors to console/output file
4. **Validation**:
   - Verify amigos count = visitas count + simpatizantes count
   - Spot-check sample records for field fidelity
   - Confirm no writes to legacy collections during migration
5. **Post-migration**:
   - Enable amigos-only writes via feature flag
   - Maintain legacy read fallback for 2 weeks
   - Remove legacy code after validation period

### Backward Compatibility Mechanism

- During transition period (2 weeks post-migration):
  - New writes go exclusively to amigos collection
  - Reads first check amigos collection, fall back to visitas/simpatizantes
  - Direct writes to legacy collections are logged and rejected
  - Feature flag controls transition mode
- After validation period:
  - Legacy collections marked as deprecated
  - Legacy read fallback removed
  - Legacy collections may be archived or deleted

### Rollout Phases

1. **Development**: Implement amigos infrastructure behind feature flag
2. **Staging**: Test migration script with anonymized data copy
3. **Production**:
   - Week 1: Deploy amigos code with feature flag OFF (legacy only)
   - Week 2: Run migration script during low-traffic period
   - Week 3: Enable feature flag (amigos-only writes, legacy read fallback)
   - Week 4: Monitor, validate, then remove legacy code

## Open Questions

- [ ] What is the expected volume of visitas/simpatizantes records to determine migration timing and resource allocation?
- [ ] Should the migratedFrom field be indexed for queries that need to filter by origin?
- [ ] Are there any existing reports or analytics that depend on the distinction between visitas and simpatizantes that need updating?
- [ ] What is the precise list of permission strings used in the codebase for visitas:_ and simpatizantes:_ to ensure complete mapping?
- [ ] Should we maintain the ability to distinguish migrated records in the UI for audit purposes during transition?
- [ ] Are there any third-party integrations or webhooks that expect visitas/simpatizantes data format that need updating?

## Assumptions

1. Firestore instance has sufficient read/write capacity for migration operation during off-peak hours
2. All visitas and simpatizantes documents conform to expected schema (no major data inconsistencies)
3. Current permission system uses string-based permission checking (visitas:_, simpatizantes:_)
4. No active development is occurring on visitas/simpatizantes features during migration window
5. Application can tolerate brief inconsistency window during migration cutover
6. Export formats (PDF/Excel/CSV) column order and formatting can remain identical post-migration
7. UI routing parameters and query strings don't contain hardcoded references to visitas/simpatizantes
8. Testing environment has access to representative data subset for validation
9. Team capacity available for 2-week transition period monitoring and support
10. No legal/compliance requirements mandate preserving visitas/simpatizantes distinction in historical data

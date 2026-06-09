# Proposal: Unify Visitas and Simpatizantes Categories

## Intent

Eliminate code duplication between structurally identical 'visitas' and 'simpatizantes' categories by merging them into a single 'amigos' category, reducing maintenance overhead and improving consistency.

## Scope

### In Scope

- Unify data model: Replace separate visitas/simpatizantes types with single amigos type
- Migrate historical data: Move visitas and simpatizantes Firestore documents to amigos collection
- Update permissions: Consolidate simpatizantes._ and visitas._ permissions into amigos.\*
- Consolidate UI: Merge visitas dialog and simpatizantes dialog into single amigos dialog
- Unify state management: Replace separate counts/arrays with unified amigos state
- Update export functionality: Modify PDF/Excel/CSV exports to use amigos data
- Update navigation and metadata: Refactor references to use amigos instead of visitas/simpatizantes

### Out of Scope

- Changes to other entity types (hermanos, etc.)
- Major UI redesign beyond consolidation of dialogs
- Changes to authentication system

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- visitas: Requirements changing - entity type will be deprecated
- simpatizantes: Requirements changing - entity type will be deprecated
- amigos: New capability representing unified entity type (will inherit requirements from both)

## Approach

Full merge strategy with backward compatibility during transition:

1. Create unified amigos data model and Firestore collection
2. Implement data migration script to move existing visitas and simpatizantes records
3. Update permission system to use amigos._ instead of visitas._ and simpatizantes.\*
4. Consolidate UI components into single amigos dialog
5. Unify state management in application stores
6. Update export functionality to process amigos data
7. Update navigation and metadata references
8. Maintain read compatibility with old records during transition period
9. Remove legacy visitas and simpatizantes code after validation

## Affected Areas

| Area              | Impact   | Description                                          |
| ----------------- | -------- | ---------------------------------------------------- |
| src/types/        | Modified | Replace visitas/simpatizantes types with amigos type |
| src/firebase/     | Modified | Update CRUD operations for amigos collection         |
| src/permissions/  | Modified | Consolidate permission checks                        |
| src/components/   | Modified | Merge visitas/simpatizantes dialogs                  |
| src/store/        | Modified | Unify state management                               |
| src/utils/export/ | Modified | Update export functions                              |
| src/navigation/   | Modified | Update navigation references                         |
| src/metadata/     | Modified | Update metadata references                           |
| scripts/          | New      | Add data migration script                            |

## Risks

| Risk                              | Likelihood | Mitigation                                                             |
| --------------------------------- | ---------- | ---------------------------------------------------------------------- |
| Data migration errors             | Medium     | Implement dry-run capability, backup before migration, validate counts |
| Permission system inconsistencies | Low        | Comprehensive testing of all permission scenarios                      |
| Historical report discrepancies   | Low        | Maintain backward compatibility for reading old records temporarily    |
| UI regression in dialogs          | Low        | Component testing with both data sources                               |
| Export format changes             | Low        | Validate output matches expected formats                               |

## Rollback Plan

1. Preserve original visitas and simpatizantes Firestore collections during migration
2. Keep legacy code in place behind feature flag until migration validated
3. If issues detected, revert feature flag and restore from backups
4. Fix migration script and retry after addressing root cause

## Dependencies

- Firestore database access
- Current user authentication system

## Success Criteria

- [ ] All visitas and simpatizantes data successfully migrated to amigos collection
- [ ] All permission checks using amigos.\* instead of legacy types
- [ ] UI components use single amigos dialog
- [ ] State management uses unified amigos state
- [ ] Export functionality processes amigos data correctly
- [ ] Navigation and metadata references updated
- [ ] Application functionality verified with both historical and new data
- [ ] Legacy visitas and simpatizantes code removed after validation period

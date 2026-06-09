# Delta for Amigos

## ADDED Requirements

### Requirement: Unified Amigos Entity

The system MUST provide a unified 'amigos' entity combining 'visitas' and 'simpatizantes' functionality with identical fields.

#### Scenario: Create amigo record

- GIVEN user on amigos management page
- WHEN submitting valid amigos form
- THEN record created in 'amigos' collection with all fields
- AND user sees success message

#### Scenario: Amigo inherits fields

- GIVEN record existed in 'visitas' or 'simpatizantes'
- WHEN migration script runs
- THEN record copied to 'amigos' with all fields preserved
- AND record includes 'migrated_from' source field

### Requirement: Firestore Data Migration

The system MUST migrate existing visitas/simpatizantes records to amigos collection preserving all data.

#### Scenario: Migration runs successfully

- GIVEN existing records in visitas/simpatizantes
- WHEN migration script executes
- THEN all records copied to amigos
- AND amigos count = visitas count + simpatizantes count
- AND original collections unchanged (rollback safety)

#### Scenario: Migration handles empty collections

- GIVEN either collection empty
- WHEN migration runs
- THEN script completes without errors
- AND amigos contains only non-empty collection records

#### Scenario: Migration preserves data types

- GIVEN visita with mixed data types (string, number, boolean, null)
- WHEN migration processes record
- THEN amigo record has identical field values/types
- AND null values preserved as null

### Requirement: Permission System Update

The system MUST replace all 'visitas._' and 'simpatizantes._' permission checks with 'amigos.\*' equivalents maintaining same granularity.

#### Scenario: Permission check uses amigos namespace

- GIVEN user with 'amigos:create' permission
- WHEN attempting to create amigo record
- THEN action allowed
- AND same user would have been allowed with 'visitas:create' or 'simpatizantes:create'

#### Scenario: Permission denial for insufficient access

- GIVEN user without amigos permissions
- WHEN attempting to update amigo record
- THEN action denied with appropriate error
- AND denial behavior matches visitas/simpatizantes permissions

### Requirement: Unified UI Dialog

The system MUST replace separate visitas/simpatizantes dialogs with single amigos dialog supporting create/edit with same field layout.

#### Scenario: Amigo dialog displays correct fields

- GIVEN user opens amigos dialog to create record
- WHEN dialog renders
- THEN all fields from previous dialogs present
- AND field labels/placeholders match originals
- AND dialog uses same validation rules

#### Scenario: Dialog loads existing amigo data

- GIVEN existing amigo record
- WHEN user opens edit dialog
- THEN dialog pre-populated with record's field values
- AND user can modify/save changes
- AND saved changes persist to amigos collection

### Requirement: Unified State Management

The system MUST replace separate visitas/simpatizantes state with unified amigos state providing same selectors/actions.

#### Scenario: Amigos state returns combined count

- GIVEN 5 amigo records in collection
- WHEN amigos state count selector called
- THEN returns 5
- AND matches sum of separate visitas/simpatizantes counts

#### Scenario: Amigos state loading behavior

- GIVEN amigos data fetch in progress
- WHEN amigos state loading selector checked
- THEN returns true
- AND matches combined loading state of previous fetches

### Requirement: Export Functionality Update

The system MUST modify all export functions (PDF, Excel, CSV) to process amigos data maintaining same format/structure.

#### Scenario: Excel export includes amigo data

- GIVEN amigo records in collection
- WHEN user exports to Excel
- THEN generated file contains sheet with all amigo records
- AND each record appears as row with same column structure as previous exports
- AND export includes all fields present in amigo records

#### Scenario: CSV export handles special characters

- GIVEN amigo record with fields containing commas, quotes, newlines
- WHEN user exports to CSV
- THEN output properly escaped and parsable
- AND data integrity maintained

### Requirement: Navigation and Metadata Updates

The system MUST update all navigation links, page routes, and metadata references to use 'amigos' maintaining same URL structure/titles.

#### Scenario: Amigos page accessible via navigation

- GIVEN user viewing main dashboard
- WHEN user clicks 'Amigos' navigation item
- THEN browser navigates to '/amigos' page
- AND page title is 'Amigos'
- AND page loads amigos management interface

#### Scenario: Metadata reflects amigos entity

- GIVEN amigos page loaded
- WHEN page metadata inspected
- THEN title contains 'Amigos'
- AND description references unified amigos entity
- AND Open Graph tags updated accordingly

### Requirement: Backward Compatibility During Transition

The system MUST maintain read-only access to visitas/simpatizantes during transition, allowing new records only in amigos, logging legacy write attempts.

#### Scenario: Legacy collections remain readable

- GIVEN record exists in visitas collection (not migrated)
- WHEN user attempts to view record through amigos interface
- THEN record displayed correctly
- AND system reads from visitas collection as fallback

#### Scenario: Writes go only to amigos collection

- GIVEN transition period active
- WHEN user creates new amigo record
- THEN record created in amigos collection
- AND no new records created in visitas/simpatizantes collections
- AND any attempt to write directly to legacy collections logged

### Requirement: Performance and Scalability

The system MUST ensure unified amigos entity does not degrade performance; query performance equivalent to or better than combined visitas/simpatizantes queries.

#### Scenario: Amigos query performance meets benchmark

- GIVEN collection with 10,000 amigo records
- WHEN query for all amigos executed
- THEN query completes within 2 seconds
- AND performance equal to or better than querying 10,000 visitas + 10,000 simpatizantes separately

#### Scenario: Indexing optimized for common queries

- GIVEN amigos collection has indexes on frequently queried fields
- WHEN filtered query executed
- THEN query uses index and returns results efficiently
- AND index configuration matches combined indexing strategy of previous collections

### Requirement: Error Handling and Logging

The system MUST provide meaningful error messages for amigos-related operations, logging errors with context for debugging while avoiding sensitive data exposure.

#### Scenario: Migration error logged with context

- GIVEN migration script encounters malformed record
- WHEN error occurs
- THEN error logged with record ID and collection name
- AND migration continues processing other records
- AND error does not crash migration process

#### Scenario: User-facing error messages clear

- GIVEN validation error when creating amigo
- WHEN form submission fails
- THEN user sees specific error message indicating failed validation field
- AND message does not expose internal system details

## MODIFIED Requirements

## REMOVED Requirements

### Requirement: Visitas Entity

(Reason: Replaced by unified amigos entity to eliminate code duplication)

### Requirement: Simpatizantes Entity

(Reason: Replaced by unified amigos entity to eliminate code duplication)

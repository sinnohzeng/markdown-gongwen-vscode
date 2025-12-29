---
uuid: ST1
workflow_node: ST1
artifact_type: Stakeholder Analysis
status: draft
dependencies: [PO1]
next_node: BN1
created_date: null
last_updated: null
---

# Stakeholder Analysis

## Metadata

- **UUID:** ST1
- **Workflow Node:** ST1
- **Status:** draft | active | complete
- **Dependencies:** PO1 (Problem Definition)
- **Next Node:** BN1 (Goals & Success Criteria)

---

## Stakeholder Identification Matrix

<!-- AI_INSTRUCTION: Identify all key stakeholders. Generate UUID for each stakeholder. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 3, MAX_ITEMS: 20 -->
<!-- SCHEMA: {uuid: string, name: string, role: string, organization: string} -->

| UUID | Stakeholder | Role | Organization |
|------|-------------|------|--------------|
| `ST1-SHK-001` | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: string, OPTIONAL, MAX_LENGTH: 50 --> |
| `ST1-SHK-002` | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: string, OPTIONAL, MAX_LENGTH: 50 --> |

<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-SHK-{SEQUENCE} -->

---

## Power/Interest Classification

<!-- AI_INSTRUCTION: Classify each stakeholder by power and interest level. Map to engagement strategy based on power/interest quadrant. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 3, MAX_ITEMS: 20 -->
<!-- SCHEMA: {uuid: string (references ST1-SHK-XXX), power: enum[High|Medium|Low], interest: enum[High|Medium|Low], engagement: enum[Manage Closely|Keep Satisfied|Keep Informed|Monitor]} -->

| Stakeholder UUID | Power | Interest | Engagement Strategy |
|------------------|-------|----------|---------------------|
| `ST1-SHK-001` | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: enum[Manage Closely|Keep Satisfied|Keep Informed|Monitor], REQUIRED --> |
| `ST1-SHK-002` | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: enum[Manage Closely|Keep Satisfied|Keep Informed|Monitor], REQUIRED --> |

**Engagement Strategy Mapping:**
- **Manage Closely** (High Power, High Interest): Engage frequently, involve in decisions
- **Keep Satisfied** (High Power, Low Interest): Keep informed, minimal engagement
- **Keep Informed** (Low Power, High Interest): Regular updates, seek feedback
- **Monitor** (Low Power, Low Interest): Minimal engagement, periodic check-ins

---

## User Personas

<!-- AI_INSTRUCTION: Define key user personas with goals, pain points, and behaviors. Generate UUID for each persona. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 2, MAX_ITEMS: 8 -->
<!-- SCHEMA: {uuid: string, name: string, role: string, goals: array[string], pain_points: array[string]} -->

### Persona 1: `ST1-PER-001`
<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-PER-{SEQUENCE} -->

- **Name:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 -->
- **Role:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 -->
- **Goals:**
  - <!-- TYPE: string, REQUIRED, MAX_LENGTH: 150 -->
  - <!-- TYPE: string, REQUIRED, MAX_LENGTH: 150 -->
- **Pain Points:**
  - <!-- TYPE: string, REQUIRED, MAX_LENGTH: 150 -->
  - <!-- TYPE: string, REQUIRED, MAX_LENGTH: 150 -->

### Persona 2: `ST1-PER-002`
<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-PER-{SEQUENCE} -->

- **Name:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 -->
- **Role:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 -->
- **Goals:**
  - <!-- TYPE: string, REQUIRED, MAX_LENGTH: 150 -->
- **Pain Points:**
  - <!-- TYPE: string, REQUIRED, MAX_LENGTH: 150 -->

---

## RBAC Role Map

<!-- AI_INSTRUCTION: Define role-based access control roles with permissions. Generate UUID for each role. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 2, MAX_ITEMS: 10 -->
<!-- SCHEMA: {uuid: string, role: string, permissions: array[string]} -->

| UUID | Role | Permissions |
|------|------|-------------|
| `ST1-RBAC-001` | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: array[string], REQUIRED, MIN_ITEMS: 1, MAX_ITEMS: 10 --> |
| `ST1-RBAC-002` | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: array[string], REQUIRED, MIN_ITEMS: 1, MAX_ITEMS: 10 --> |

<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-RBAC-{SEQUENCE} -->

---

## Validation Checklist

<!-- AI_INSTRUCTION: Verify all items are complete before marking status as "complete" -->

- [ ] Stakeholder identification matrix includes all key stakeholders
- [ ] Power/interest classification completed for all stakeholders
- [ ] Engagement strategy mapped for each stakeholder
- [ ] User personas are defined with goals and pain points
- [ ] RBAC roles are mapped with permissions
- [ ] All UUIDs generated and unique
- [ ] Dependencies on PO1 are satisfied
- [ ] Status updated to "complete"

---

**Next Steps:** [BN1] Goals & Success Criteria

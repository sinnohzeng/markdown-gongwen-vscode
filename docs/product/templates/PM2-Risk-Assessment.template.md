---
uuid: PM2
workflow_node: PM2
artifact_type: Risk Assessment
status: draft
dependencies: [BH1]
next_node: RD2
created_date: null
last_updated: null
---

# Risk Assessment

## Metadata

- **UUID:** PM2
- **Workflow Node:** PM2
- **Status:** draft | active | complete
- **Dependencies:** BH1 (System Behavior Model)
- **Next Node:** RD2 (Requirements Model)

---

## Risk Register

<!-- AI_INSTRUCTION: Identify and document all project risks. Generate UUID for each risk. Classify by probability and impact. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 3, MAX_ITEMS: 30 -->
<!-- SCHEMA: {uuid: string, risk: string, category: string, probability: enum[High|Medium|Low], impact: enum[High|Medium|Low], risk_score: string, description: string} -->

| UUID | Risk | Category | Probability | Impact | Risk Score | Description |
|------|------|-----------|-------------|--------|------------|-------------|
| `PM2-RISK-001` | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 100 --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 20, EXAMPLE: High --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 300 --> |
| `PM2-RISK-002` | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 100 --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: enum[High|Medium|Low], REQUIRED --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 20, EXAMPLE: Medium --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 300 --> |

**Risk Score Calculation:** Probability × Impact (High=3, Medium=2, Low=1)

<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-RISK-{SEQUENCE} -->

---

## Risk Response Planning

<!-- AI_INSTRUCTION: Define response strategies for each identified risk. Generate UUID for each response plan. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 3, MAX_ITEMS: 30 -->
<!-- SCHEMA: {uuid: string, risk_uuid: string (references PM2-RISK-XXX), response_strategy: enum[Avoid|Mitigate|Transfer|Accept], response_plan: string, owner: string, status: enum[Open|In Progress|Closed]} -->

| UUID | Risk UUID | Response Strategy | Response Plan | Owner | Status |
|------|-----------|-------------------|---------------|-------|--------|
| `PM2-RESP-001` | <!-- TYPE: string, REQUIRED, FORMAT: PM2-RISK-XXX --> | <!-- TYPE: enum[Avoid|Mitigate|Transfer|Accept], REQUIRED --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 500 --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: enum[Open|In Progress|Closed], REQUIRED --> |
| `PM2-RESP-002` | <!-- TYPE: string, REQUIRED, FORMAT: PM2-RISK-XXX --> | <!-- TYPE: enum[Avoid|Mitigate|Transfer|Accept], REQUIRED --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 500 --> | <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 --> | <!-- TYPE: enum[Open|In Progress|Closed], REQUIRED --> |

**Response Strategy Definitions:**
- **Avoid:** Eliminate the risk by changing the approach
- **Mitigate:** Reduce probability or impact of the risk
- **Transfer:** Shift risk to another party (e.g., insurance, outsourcing)
- **Accept:** Acknowledge the risk and proceed (for low-impact risks)

<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-RESP-{SEQUENCE} -->

---

## Mitigation Strategies

<!-- AI_INSTRUCTION: Define detailed mitigation strategies for risks that are being mitigated. Generate UUID for each mitigation strategy. -->

<!-- TYPE: array[object], REQUIRED, MIN_ITEMS: 2, MAX_ITEMS: 20 -->
<!-- SCHEMA: {uuid: string, risk_uuid: string (references PM2-RISK-XXX), mitigation_action: string, timeline: string, resources: string, success_criteria: string} -->

### Mitigation Strategy 1: `PM2-MIT-001`
<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-MIT-{SEQUENCE} -->

- **Risk UUID:** <!-- TYPE: string, REQUIRED, FORMAT: PM2-RISK-XXX -->
- **Mitigation Action:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 500 -->
- **Timeline:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 100 -->
- **Resources Required:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 200 -->
- **Success Criteria:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 300 -->

### Mitigation Strategy 2: `PM2-MIT-002`
<!-- TYPE: uuid, REQUIRED, FORMAT: {ARTIFACT_UUID}-MIT-{SEQUENCE} -->

- **Risk UUID:** <!-- TYPE: string, REQUIRED, FORMAT: PM2-RISK-XXX -->
- **Mitigation Action:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 500 -->
- **Timeline:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 100 -->
- **Resources Required:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 200 -->
- **Success Criteria:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 300 -->

---

## Risk Monitoring & Review

<!-- AI_INSTRUCTION: Define risk monitoring schedule and review process. -->

- **Review Frequency:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50, EXAMPLE: Weekly -->
- **Review Owner:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 50 -->
- **Escalation Criteria:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 300 -->
- **Reporting Format:** <!-- TYPE: string, REQUIRED, MAX_LENGTH: 200 -->

---

## Validation Checklist

<!-- AI_INSTRUCTION: Verify all items are complete before marking status as "complete" -->

- [ ] Risk register includes all identified risks with probability and impact
- [ ] Risk scores calculated for all risks
- [ ] Response strategy defined for each risk
- [ ] Mitigation strategies detailed for risks being mitigated
- [ ] Risk owners assigned
- [ ] Monitoring and review process defined
- [ ] All UUIDs generated and unique
- [ ] Dependencies on BH1 are satisfied
- [ ] Status updated to "complete"

---

**Next Steps:** [RD2] Requirements Model

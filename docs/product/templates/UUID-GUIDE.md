# UUID Format Guide

## Purpose

UUIDs provide unique, traceable references for all problems, solutions, and artifacts created during the workflow. This enables:
- Cross-referencing between documents
- Traceability from problem to solution
- Automated validation and linking
- Historical tracking

## UUID Format

### Workflow Node UUIDs (from stages.csv)

Workflow nodes use the format from `stages.csv`:
- **Format**: `{CATEGORY}{NUMBER}`
- **Examples**: `PO1`, `ST1`, `BN1`, `BH1`, `DM1`, `DE1`, `AR1`, `SC1`, `RD1`, `RD2`

### Sub-Item UUIDs (within artifacts)

For referenceable items within artifacts:
```
{ARTIFACT_UUID}-{TYPE}-{SEQUENCE}
```

### Components

1. **ARTIFACT_UUID**: The parent artifact UUID from stages.csv (e.g., `PO1`, `ST1`, `BH1`)
2. **TYPE**: Abbreviation for the item type (see Type Codes below)
3. **SEQUENCE**: 3-digit zero-padded sequence number (001, 002, 003...)

### Examples

**Workflow Nodes:**
- `PO1` - Problem Definition (Root Cause Analysis)
- `ST1` - Stakeholder Analysis
- `BH1` - System Behavior Model
- `RD1` - Release Planning

**Sub-Items:**
- `PO1-PROB-001` - Problem #1 in artifact PO1
- `PO1-RCA-001` - Root Cause Analysis #1 in artifact PO1
- `PO2-PP-001` - Pain Point #1 in artifact PO2
- `PO2-MET-001` - Metric #1 in artifact PO2

## Type Codes

| Code | Type | Description |
|------|------|-------------|
| `PROB` | Problem | Problem statement |
| `RCA` | Root Cause | Root cause analysis |
| `CF` | Contributing Factor | Contributing factor to root cause |
| `EVD` | Evidence | Evidence supporting analysis |
| `SOL` | Solution | Solution direction |
| `PP` | Pain Point | Pain point in current state |
| `MET` | Metric | Baseline or target metric |
| `CON` | Constraint | Technical/business/regulatory constraint |
| `STA` | Stakeholder | Stakeholder |
| `GOAL` | Goal | Goal or objective |
| `KPI` | KPI | Key performance indicator |
| `UC` | Use Case | Use case |
| `BR` | Business Rule | Business rule |
| `REQ` | Requirement | Functional/non-functional requirement |
| `RISK` | Risk | Risk item |
| `THR` | Threat | Security threat |

## Generation Rules

1. **Start sequence at 001** for each type within an artifact
2. **Increment sequentially** (001, 002, 003...)
3. **Do not reuse** deleted UUIDs (keep sequence continuous)
4. **Reference format**: Use backticks for UUIDs in markdown: `` `PO1-PROB-001` ``
5. **Cross-references**: Link UUIDs using format: `[PO1-PROB-001](PO1-Root-Cause-Analysis.md#problem-statement)`

## AI Agent Instructions

When generating UUIDs:
1. Check existing UUIDs in the artifact to determine next sequence
2. Use the correct TYPE code for the item
3. Format as `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE}`
4. Include UUID in the item's metadata/header
5. Use UUID in cross-references to other documents

## Validation

**Workflow Node UUIDs:**
- Must match pattern: `^[A-Z]{2}\d+$` (e.g., `PO1`, `ST1`, `BH1`)
- Must align with `stages.csv` UUID format
- Each UUID must be unique within the repository

**Sub-Item UUIDs:**
- Must match pattern: `^[A-Z0-9]+-[A-Z]+-\d{3}$`
- Each UUID must be unique within the repository
- Sequence numbers must be continuous (no gaps)
- Type codes must be from the approved list

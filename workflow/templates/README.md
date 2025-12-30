# Artifact Templates

AI-native templates for workflow artifacts. Optimized for AI agent parsing, validation, and completion using the "Minimal YAML + Visual Markdown" strategy.

## Template Format Strategy

**YAML-First** for all structured data. Separate Markdown templates for diagrams when needed.

- **YAML templates** (`.template.yaml`): All structured data, metadata, and content
- **Diagram templates** (`.template.md`): Visual diagrams only (Mermaid, etc.)

## Strategy: Minimal YAML + Visual Markdown

### Core Principles

1. **YAML-First**: All structured data in YAML (machine-readable)
2. **Referencing**: UUID-based cross-links instead of duplication
3. **Mermaid Diagrams**: Visual complexity instead of long texts
4. **Separation**: YAML for data, Markdown only for diagrams

### Format Structure

```
Artifact = {
  metadata: YAML Frontmatter (structured),
  content: {
    data: YAML Sections (structured),
    diagrams: Mermaid Code Blocks (separate .md file)
  }
}
```

## UUID System

All referenceable items (problems, pain points, metrics, etc.) must have UUIDs for traceability. See [UUID-GUIDE.md](./UUID-GUIDE.md) for format and generation rules.

## Usage

Templates are referenced in `workflow.yaml` under each node's `outputs[].template` field.

## Template Naming Convention

**YAML Templates:**
`{INDEX}-{SHORTNAME}-{Description}.template.yaml`

Example: `01-PO-Problem-Definition.template.yaml`

**Format:**
- `{INDEX}`: Two-digit zero-padded index (00-16)
- `{SHORTNAME}`: Short identifier (START, PO, ST, BN, BH, PM, DM, DE, AR, SC, RD, DEV, REL, BL)
- `{Description}`: Human-readable description (kebab-case)

**Diagram Templates:**
`diagram.template.md` (shared template for all diagrams)

## AI-Native Features

### 1. Pure YAML Structure
- All structured data in YAML format (no Markdown frontmatter)
- Machine-readable and parseable
- Type-safe with inline comments for constraints

### 2. Type Hints (YAML Comments)
- `# TYPE: string|number|array|object, REQUIRED|OPTIONAL`
- Field constraints (MAX_LENGTH, MIN_ITEMS, MAX_ITEMS)
- Enum values for constrained choices
- Schema definitions in comments

### 3. AI Instructions (YAML Comments)
- `# AI_INSTRUCTION: ...` comments guide AI agents
- Clear guidance on what to fill in each section
- Methodology references (e.g., "ask why 5 times")

### 4. Validation Schema
- Inline validation rules in comments
- Schema definitions for complex objects
- Validation checklists in YAML structure

### 5. Examples (YAML Comments)
- `# EXAMPLE: ...` provides concrete examples
- Shows expected format and detail level
- Helps AI understand context

### 6. Diagram Separation
- Mermaid diagram code stored in YAML fields
- Separate `diagram.template.md` for visual rendering
- Clean separation of data and visualization

## Template Guidelines

- **YAML-Only**: All structured data in pure YAML format
- **AI-Native**: Include type hints and AI instructions in comments
- **Concise**: Keep templates focused and well-structured
- **Validatable**: Include validation rules and checklists
- **Actionable**: Include next steps/references
- **Machine-readable**: Consistent YAML formatting for parsing
- **Diagram Separation**: Use separate diagram templates for visuals

## AI Agent Usage

AI agents should:
1. Read YAML template to understand structure
2. Follow `# AI_INSTRUCTION` comments
3. Respect `# TYPE` constraints
4. Use `# EXAMPLE` comments as reference
5. Generate YAML artifact with all structured data
6. If diagram needed: Extract `mermaid_diagram` field and use `diagram.template.md`
7. Complete validation checklist before marking complete
8. Update status in metadata when done

## Diagram Generation

When a YAML template contains a `mermaid_diagram` field:

1. Extract the diagram code from the YAML field
2. Use `diagram.template.md` to create the visual representation
3. Save as separate Markdown file (e.g., `01-PO-Problem-Definition-diagram.md`)
4. Keep diagram file minimal - just title and diagram code

## Available Templates

### Priority 1 (Critical)
- `00-START-Project-Initiation.template.yaml`
- `01-PO-Problem-Definition.template.yaml`
- `02-ST-Stakeholder-Analysis.template.yaml`
- `03-BN-Goals-Success-Criteria.template.yaml`

### Priority 2 (Important)
- `04-BH-System-Behavior-Model.template.yaml`
- `11-RD-Requirements-Model.template.yaml`
- `12-RD-Release-Planning.template.yaml`

### Priority 3 (Architecture)
- `07-DM-Data-Model.template.yaml`
- `08-DE-Design-Model.template.yaml`
- `09-AR-Architecture-Model.template.yaml`
- `10-SC-Security-Model.template.yaml`

### Priority 4 (Management)
- `05-PM-Resource-Planning.template.yaml`
- `06-PM-Risk-Assessment.template.yaml`

### Shared Templates
- `diagram.template.md` - Diagram generation template
- `UUID-GUIDE.md` - UUID format and generation guide

## Reference

- **Workflow Definition**: [workflow.yaml](../workflow.yaml)
- **Meta-Analyse**: [meta-analyse.md](../meta-analyse.md)
- **Old Templates (Archive)**: [templates_md_yaml/](../templates_md_yaml/)

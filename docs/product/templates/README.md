# Artifact Templates

AI-native templates for workflow artifacts. Optimized for AI agent parsing, validation, and completion.

## UUID System

All referenceable items (problems, pain points, metrics, etc.) must have UUIDs for traceability. See [UUID-GUIDE.md](./UUID-GUIDE.md) for format and generation rules.

## Usage

Templates are referenced in `workflow.yaml` under each node's `outputs[].template` field.

## Template Naming Convention

`[UUID]-[Artifact-Name].template.md`

Example: `PO1-Root-Cause-Analysis.template.md`

## AI-Native Features

### 1. YAML Frontmatter
- Structured metadata (UUID, workflow_node, dependencies)
- Machine-readable status tracking
- Clear node relationships

### 2. Type Hints
- `<!-- TYPE: string|number|array|object, REQUIRED|OPTIONAL -->`
- Field constraints (MAX_LENGTH, MIN_ITEMS, MAX_ITEMS)
- Enum values for constrained choices

### 3. AI Instructions
- `<!-- AI_INSTRUCTION: ... -->` blocks guide AI agents
- Clear guidance on what to fill in each section
- Methodology references (e.g., "ask why 5 times")

### 4. Validation Schema
- Inline validation rules
- Schema definitions for complex objects
- Validation checklists at end of template

### 5. Examples
- `<!-- EXAMPLE: ... -->` provides concrete examples
- Shows expected format and detail level
- Helps AI understand context

### 6. Structured Placeholders
- Clear placeholders with type information
- Required vs optional fields
- Format specifications (dates, enums, etc.)

## Template Guidelines

- **AI-Native**: Include YAML frontmatter, type hints, and instructions
- **Concise**: Keep templates short and focused
- **Structured**: Use clear sections with typed placeholders
- **Validatable**: Include validation rules and checklists
- **Actionable**: Include next steps/references
- **Machine-readable**: Consistent formatting for parsing

## AI Agent Usage

AI agents should:
1. Read YAML frontmatter to understand context
2. Follow `AI_INSTRUCTION` comments
3. Respect `TYPE` constraints
4. Use `EXAMPLE` comments as reference
5. Complete validation checklist before marking complete
6. Update status in frontmatter when done

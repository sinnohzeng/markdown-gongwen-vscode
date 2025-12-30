# AI Agents Workflow Guide

## 1. Golden Rules (Critical Protocols)

1. **Never skip dependency checks** — Ensure all `dependencies` are `complete` before executing any node.
2. **Check the human input requirement** — If `requires_human_input: true`, always pause, await user approval, and capture input before proceeding.
3. **Always generate UUIDs first** — Sub-item UUIDs must follow `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE:03d}`.
4. **No duplication, use references** — All cross-node links must be via `{uuid}` fields, never by duplicating content.
5. **YAML-only for artifacts** — Templates may include type hints, but generated files must exclude Markdown frontmatter or in-file examples.
6. **Validate before marking complete** — Run all validators: `validate-artifact`, `validate-uuids`, `validate-mermaid`, `validate-references`, and `validate-minimalism`.

**⚠️ When `requires_human_input: true`, execution MUST pause and wait for explicit approval before continuing (see `WORKFLOW-EXECUTION.md`).**

---

## 2. Command Palette & Node Lifecycle

**Workflow Verification:**
```bash
python workflow/scripts/verify-workflow.py              # Quick validation of the workflow
python workflow/scripts/verify-workflow.py --verbose    # Detailed step-by-step output
```

**Node Execution Flow:**
```bash
# Special: 00-START node
#   REQUIRED: Input an initial problem statement/project context before workflow can begin (free text)
#   Example: "Problem: Users experience X. Context: Y. Goal: Z."

# All nodes:
# 1. Check all dependencies are 'complete'
# 2. If requires_human_input: pause and await approval/user input
# 3. Load template: workflow/templates/{INDEX}-{SHORTNAME}-{Description}.template.yaml
# 4. Fill using # AI_INSTRUCTION comments (START node uses the provided context for charter)
# 5. Generate UUIDs for all new sub-items
# 6. Extract any mermaid_diagram; generate/update diagram.md
# 7. Run all 5 validators
# 8. Save artifact; update status to 'complete'
```

**Artifact Validation:**
```bash
# For a single artifact:
python workflow/scripts/validation/validate-artifact.py workflow/01-PO-Problem-Definition.yaml
python workflow/scripts/validation/validate-uuids.py workflow/01-PO-Problem-Definition.yaml
python workflow/scripts/validation/validate-mermaid.py workflow/01-PO-Problem-Definition.yaml
python workflow/scripts/validation/validate-references.py workflow/01-PO-Problem-Definition.yaml --check-exists
python workflow/scripts/validation/validate-minimalism.py workflow/01-PO-Problem-Definition.yaml --threshold 10

# Validate all artifacts:
for file in workflow/*.yaml; do
    python workflow/scripts/validation/validate-artifact.py "$file" &&
    python workflow/scripts/validation/validate-uuids.py "$file" &&
    python workflow/scripts/validation/validate-mermaid.py "$file" &&
    python workflow/scripts/validation/validate-references.py "$file" --check-exists &&
    python workflow/scripts/validation/validate-minimalism.py "$file" --threshold 10
done
```

**Diagram Generation:**
```bash
python workflow/scripts/generate-mermaid.py > workflow/PROCESS_WORKFLOW.md
```

---

## 3. Tech Stack

- **YAML**: 1.2 (workflow/templates, all artifacts)
- **Python**: 3.7+ (validators, CI logic)
- **Node.js**: 20+ (workflow scripts)
- **JSON Schema**: Draft-07 (artifact/UUID/schema validation)
- **Mermaid**: Latest (diagram rendering/generation)

---

## 4. Directory Structure

```
workflow/
├── workflow.yaml                # Source of truth: all nodes, dependencies, outputs
├── templates/                   # YAML artifact templates
│   ├── diagram.template.md      # Mermaid diagram template
│   └── UUID-GUIDE.md            # UUID format rules/reference
├── schemas/                     # JSON Schemas for validation
│   ├── base-artifact-schema.json
│   ├── uuid-schema.json
│   └── mermaid-schema.json
└── *.yaml                       # Generated artifact outputs (00-START, 01-PO, 02-ST, etc.)
workflow/scripts/
├── validation/                  # Validation scripts (artifact, UUID, Mermaid, references, minimalism)
```

---

## 5. Quick Reference

- **Template Format**: `{INDEX}-{SHORTNAME}-{Description}.template.yaml`  
  _(e.g., `01-PO-Problem-Definition.template.yaml`)_
- **Artifact Format**: `{INDEX}-{SHORTNAME}-{Description}.yaml`
- **UUID Pattern**: Nodes: `^\d{2}-[A-Z]{2,}$`  
   _(Examples: `01-PO`, `02-ST`, `00-START`)_  
   Sub-items: `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE:03d}`
- **Status Values**: `draft` → `active` → `complete`
- **See Also**: `workflow/templates/README.md`, `workflow/templates/UUID-GUIDE.md`, `workflow/workflow.yaml`


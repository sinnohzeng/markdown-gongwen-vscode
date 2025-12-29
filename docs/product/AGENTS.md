# AI Agents Workflow Guide

## 1. Project Signature

AI-native software development lifecycle workflow system. YAML-driven templates generate structured artifacts from problem definition through stable release. All artifacts are version-controlled, UUID-tracked, and validation-driven.

## 2. Tech Stack

- **Python**: 3.7+ (validation scripts)
- **Node.js**: 20+ (workflow scripts)
- **YAML**: 1.2 (workflow & templates)
- **JSON Schema**: Draft-07 (artifact validation)
- **Mermaid**: Latest (diagram generation)

## 3. The Golden Rules

1. **Never skip dependency checks** – Verify all `dependencies` are `complete` before executing a node
2. **Always generate UUIDs first** – Sub-item UUIDs must follow `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE:03d}` format
3. **YAML-only for artifacts** – No Markdown frontmatter, no Type Hints/Examples in generated files (templates only)
4. **Validate before marking complete** – Run all validators (`validate-artifact`, `validate-uuids`, `validate-mermaid`, `validate-references`, `validate-minimalism`)
5. **Use UUID references, never duplicate** – Cross-reference with `{uuid}` fields instead of copying content

## 4. Directory Map

```
docs/product/
├── workflow.yaml              # Source of truth - defines all nodes, dependencies, outputs
├── templates/                  # YAML templates: {UUID}-{Name}.template.yaml
│   ├── diagram.template.md     # Mermaid diagram template
│   └── UUID-GUIDE.md          # UUID format reference
├── schemas/                    # JSON Schema validation
│   ├── base-artifact-schema.json
│   ├── uuid-schema.json
│   └── mermaid-schema.json
└── *.yaml                      # Generated artifacts (PO1, ST1, BH1, etc.)

scripts/
├── validation/                 # Artifact validators
│   ├── validate-artifact.py   # Schema validation
│   ├── validate-uuids.py      # UUID format & uniqueness
│   ├── validate-mermaid.py    # Mermaid syntax
│   ├── validate-references.py # Cross-reference integrity
│   └── validate-minimalism.py # Redundancy detection
```

## 5. Command Palette

### Workflow Verification
```bash
python scripts/verify-workflow.py              # Quick check
python scripts/verify-workflow.py --verbose    # Detailed output
```

### Artifact Validation
```bash
# Single artifact
python scripts/validation/validate-artifact.py docs/product/PO1-Problem-Definition.yaml
python scripts/validation/validate-uuids.py docs/product/PO1-Problem-Definition.yaml
python scripts/validation/validate-mermaid.py docs/product/PO1-Problem-Definition.yaml
python scripts/validation/validate-references.py docs/product/PO1-Problem-Definition.yaml --check-exists
python scripts/validation/validate-minimalism.py docs/product/PO1-Problem-Definition.yaml --threshold 10

# All artifacts
for file in docs/product/*.yaml; do
    python scripts/validation/validate-artifact.py "$file" &&
    python scripts/validation/validate-uuids.py "$file" &&
    python scripts/validation/validate-mermaid.py "$file" &&
    python scripts/validation/validate-references.py "$file" --check-exists &&
    python scripts/validation/validate-minimalism.py "$file" --threshold 10
done
```

### Diagram Generation
```bash
python scripts/generate-mermaid.py > docs/product/PROCESS_WORKFLOW.md
```

### Node Execution Flow
```bash
# 1. Check dependencies (verify all are complete)
# 2. Load template: docs/product/templates/{UUID}-{Name}.template.yaml
# 3. Fill YAML following # AI_INSTRUCTION comments
# 4. Generate UUIDs for sub-items
# 5. Extract mermaid_diagram → generate diagram.md file
# 6. Validate (all 5 validators)
# 7. Save artifact → update status: complete
```

---

## Quick Reference

**Template Format**: `{UUID}-{Name}.template.yaml` (e.g., `PO1-Problem-Definition.template.yaml`)  
**Artifact Format**: `{UUID}-{Name}.yaml` (e.g., `PO1-Problem-Definition.yaml`)  
**UUID Pattern**: Workflow nodes `^[A-Z]{2}\d+$|^START$`, Sub-items `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE:03d}`  
**Status Values**: `draft` → `active` → `complete`

**See Also**: `templates/README.md`, `templates/UUID-GUIDE.md`, `workflow.yaml`

# Workflow Generation Scripts

## generate-mermaid.py

Generates a Mermaid flowchart diagram from `workflow.yaml`.

### Usage

```bash
# Generate Mermaid diagram and save to PROCESS_WORKFLOW.md
# Run from project root:
python3 workflow/scripts/generate-mermaid.py > workflow/PROCESS_WORKFLOW.md

# Or view output directly
python3 workflow/scripts/generate-mermaid.py
```

### Requirements

- Python 3.6+
- PyYAML (`pip install pyyaml`)

### How it works

1. Reads `workflow/workflow.yaml` (source of truth)
2. Parses nodes, containers, and edges
3. Generates Mermaid syntax with:
   - Numbered nodes (1-16)
   - Role-based containers (subgraphs)
   - Flow connections
   - Activity bullet points

---

## verify-workflow.py

Verifies the integrity of `workflow.yaml` and all template files. Checks for:
- Template paths exist and are valid
- Dependencies reference valid nodes
- Edges reference valid nodes
- Template frontmatter matches workflow nodes
- Cross-references are valid
- UUID consistency
- Orphaned templates

### Usage

```bash
# Quick verification (summary only)
# Run from project root:
python3 workflow/scripts/verify-workflow.py

# Verbose output (detailed checks)
python3 workflow/scripts/verify-workflow.py --verbose

# Custom paths
python3 workflow/scripts/verify-workflow.py --workflow path/to/workflow.yaml --templates path/to/templates
```

### Requirements

- Python 3.6+
- PyYAML (`pip install pyyaml`)

### Exit Codes

- `0`: All checks passed
- `1`: Critical issues found

### What it checks

1. **Template Paths**: All template files referenced in workflow.yaml exist
2. **Dependencies**: All node dependencies reference valid nodes
3. **Edges**: All workflow edges reference valid nodes
4. **Template Frontmatter**: UUID, dependencies, and next_node match workflow nodes
5. **Next Steps**: "Next Steps" references in templates are valid
6. **UUID Consistency**: All node UUIDs match their node IDs
7. **Orphaned Templates**: Templates not referenced in workflow

---

## Workflow Structure

- **Source of Truth**: `workflow/workflow.yaml`
- **Generated Output**: `workflow/PROCESS_WORKFLOW.md` (Mermaid diagram)
- **Templates**: `workflow/templates/*.template.md`
- **Scripts**: 
  - `workflow/scripts/generate-mermaid.py` - Generate workflow diagram
  - `workflow/scripts/verify-workflow.py` - Verify workflow integrity

The YAML file contains all workflow metadata (dependencies, outputs, done criteria, automation) while the Mermaid diagram provides visual representation.

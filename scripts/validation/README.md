# Artifact Validation Tools

Validation scripts for ensuring artifact quality and compliance with the "Minimal YAML + Visual Markdown" strategy.

## Available Validators

### 1. validate-artifact.py

Validates YAML artifacts against JSON Schema.

```bash
python validate-artifact.py <artifact.yaml> [--schema <schema.json>]
```

**Example:**
```bash
python validate-artifact.py docs/product/PO1-Problem-Definition.yaml
python validate-artifact.py docs/product/ST1-Stakeholder-Analysis.yaml --schema docs/product/schemas/base-artifact-schema.json
```

### 2. validate-mermaid.py

Validates Mermaid diagram syntax in YAML artifacts.

```bash
python validate-mermaid.py <artifact.yaml> [--field <field.path>]
```

**Example:**
```bash
python validate-mermaid.py docs/product/PO1-Problem-Definition.yaml
python validate-mermaid.py docs/product/BH1-System-Behavior-Model.yaml --field process_flows[0].mermaid_diagram
```

### 3. validate-uuids.py

Validates UUID formats and uniqueness in artifacts.

```bash
python validate-uuids.py <artifact.yaml>
```

**Example:**
```bash
python validate-uuids.py docs/product/PO1-Problem-Definition.yaml
```

### 4. validate-references.py

Validates UUID cross-references in artifacts.

```bash
python validate-references.py <artifact.yaml> [--check-exists]
```

**Example:**
```bash
python validate-references.py docs/product/RD2-Requirements-Model.yaml
python validate-references.py docs/product/RD2-Requirements-Model.yaml --check-exists
```

### 5. validate-minimalism.py

Detects redundancy in artifacts (minimalism checker).

```bash
python validate-minimalism.py <artifact.yaml> [--threshold <percentage>]
```

**Example:**
```bash
python validate-minimalism.py docs/product/PO1-Problem-Definition.yaml
python validate-minimalism.py docs/product/PO1-Problem-Definition.yaml --threshold 5
```

## Requirements

- Python 3.7+
- PyYAML (`pip install pyyaml`)
- jsonschema (`pip install jsonschema`)

## Usage

### Validate All Artifacts

```bash
# Validate all artifacts in docs/product/
for file in docs/product/*.yaml; do
    python validate-artifact.py "$file"
    python validate-uuids.py "$file"
    python validate-references.py "$file" --check-exists
    python validate-minimalism.py "$file"
done
```

### Validate Single Artifact

```bash
artifact="docs/product/PO1-Problem-Definition.yaml"

python validate-artifact.py "$artifact"
python validate-mermaid.py "$artifact"
python validate-uuids.py "$artifact"
python validate-references.py "$artifact" --check-exists
python validate-minimalism.py "$artifact" --threshold 10
```

## Exit Codes

- `0`: Validation passed
- `1`: Validation failed

## Integration

These validators can be integrated into CI/CD pipelines to ensure artifact quality before commits or deployments.

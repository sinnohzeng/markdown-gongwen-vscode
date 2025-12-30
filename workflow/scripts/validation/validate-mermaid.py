#!/usr/bin/env python3
"""
Validate Mermaid diagram syntax in YAML artifacts.

Usage:
    python validate-mermaid.py <artifact.yaml> [--field <field.path>]
"""

import sys
import yaml
import re
from pathlib import Path

def load_yaml(file_path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def get_nested_value(data, path):
    """Get nested value from dict using dot notation."""
    keys = path.split('.')
    value = data
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return None
    return value

def extract_mermaid_diagrams(data, path=""):
    """Recursively extract all mermaid_diagram fields."""
    diagrams = []
    
    if isinstance(data, dict):
        if 'mermaid_diagram' in data:
            diagrams.append((f"{path}.mermaid_diagram" if path else "mermaid_diagram", data['mermaid_diagram']))
        for key, value in data.items():
            new_path = f"{path}.{key}" if path else key
            diagrams.extend(extract_mermaid_diagrams(value, new_path))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            new_path = f"{path}[{i}]" if path else f"[{i}]"
            diagrams.extend(extract_mermaid_diagrams(item, new_path))
    
    return diagrams

def validate_mermaid_syntax(diagram_code):
    """Basic Mermaid syntax validation."""
    if not diagram_code or not isinstance(diagram_code, str):
        return False, "Diagram code is empty or not a string"
    
    # Check for common Mermaid diagram types
    valid_types = [
        'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
        'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'gitGraph', 'journey'
    ]
    
    first_line = diagram_code.strip().split('\n')[0].strip()
    has_valid_type = any(first_line.startswith(t) for t in valid_types)
    
    if not has_valid_type:
        return False, f"Invalid Mermaid diagram type. First line: {first_line}"
    
    # Basic syntax checks
    if 'flowchart' in first_line or 'graph' in first_line:
        # Check for basic node definitions
        if not re.search(r'[A-Z][A-Za-z0-9]*\[', diagram_code):
            return False, "Flowchart/graph should contain node definitions"
    
    return True, "Valid Mermaid syntax"

def validate_artifact_mermaid(artifact_path, field_path=None):
    """Validate Mermaid diagrams in artifact."""
    artifact = load_yaml(artifact_path)
    
    if field_path:
        diagram_code = get_nested_value(artifact, field_path)
        if diagram_code is None:
            print(f"✗ Field {field_path} not found in {artifact_path}")
            return False
        
        valid, message = validate_mermaid_syntax(diagram_code)
        if valid:
            print(f"✓ Mermaid diagram at {field_path} is valid")
            return True
        else:
            print(f"✗ Mermaid diagram at {field_path} is invalid: {message}")
            return False
    else:
        # Find all mermaid_diagram fields
        diagrams = extract_mermaid_diagrams(artifact)
        
        if not diagrams:
            print(f"⚠ No Mermaid diagrams found in {artifact_path}")
            return True
        
        all_valid = True
        for path, diagram_code in diagrams:
            valid, message = validate_mermaid_syntax(diagram_code)
            if valid:
                print(f"✓ Mermaid diagram at {path} is valid")
            else:
                print(f"✗ Mermaid diagram at {path} is invalid: {message}")
                all_valid = False
        
        return all_valid

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate-mermaid.py <artifact.yaml> [--field <field.path>]")
        sys.exit(1)
    
    artifact_path = Path(sys.argv[1])
    field_path = None
    
    if len(sys.argv) > 2 and sys.argv[2] == "--field":
        field_path = sys.argv[3]
    
    success = validate_artifact_mermaid(artifact_path, field_path)
    sys.exit(0 if success else 1)

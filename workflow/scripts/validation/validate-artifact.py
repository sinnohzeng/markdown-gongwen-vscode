#!/usr/bin/env python3
"""
Validate artifact YAML files against JSON Schema.

Usage:
    python validate-artifact.py <artifact.yaml> [--schema <schema.json>]
"""

import json
import sys
import yaml
from pathlib import Path
from jsonschema import validate, ValidationError
from jsonschema.validators import Draft7Validator

def load_yaml(file_path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def load_schema(schema_path):
    """Load JSON Schema."""
    with open(schema_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def validate_artifact(artifact_path, schema_path=None):
    """Validate artifact against schema."""
    artifact = load_yaml(artifact_path)
    
    # Default to base schema if not specified
    if schema_path is None:
        schema_path = Path(__file__).parent.parent.parent / "workflow" / "schemas" / "base-artifact-schema.json"
    
    schema = load_schema(schema_path)
    
    try:
        validate(instance=artifact, schema=schema)
        print(f"✓ {artifact_path} is valid")
        return True
    except ValidationError as e:
        print(f"✗ {artifact_path} is invalid:")
        print(f"  {e.message}")
        if e.path:
            print(f"  Path: {' -> '.join(str(p) for p in e.path)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate-artifact.py <artifact.yaml> [--schema <schema.json>]")
        sys.exit(1)
    
    artifact_path = Path(sys.argv[1])
    schema_path = None
    
    if len(sys.argv) > 2 and sys.argv[2] == "--schema":
        schema_path = Path(sys.argv[3])
    
    success = validate_artifact(artifact_path, schema_path)
    sys.exit(0 if success else 1)

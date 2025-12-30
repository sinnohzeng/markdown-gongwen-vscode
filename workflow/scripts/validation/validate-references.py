#!/usr/bin/env python3
"""
Validate UUID cross-references in artifacts.

Usage:
    python validate-references.py <artifact.yaml> [--check-exists]
"""

import sys
import yaml
import re
from pathlib import Path

def load_yaml(file_path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def extract_uuid_references(data, path="", references=None):
    """Recursively extract UUID references from artifact."""
    if references is None:
        references = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            new_path = f"{path}.{key}" if path else key
            
            # Check for UUID reference fields
            if key.endswith('_uuid') or key == 'uuid' or 'reference' in key.lower():
                if isinstance(value, str) and '-' in value:
                    # Potential UUID reference
                    if re.match(r'^[A-Z0-9]+-[A-Z]+-\d{3}$', value):
                        references.append((new_path, value))
            
            if isinstance(value, (dict, list)):
                extract_uuid_references(value, new_path, references)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            new_path = f"{path}[{i}]" if path else f"[{i}]"
            extract_uuid_references(item, new_path, references)
    
    return references

def find_artifact_by_uuid(uuid, artifacts_dir):
    """Find artifact file that should contain the UUID."""
    # Extract artifact UUID (e.g., PO1 from PO1-PROB-001)
    artifact_uuid = uuid.split('-')[0]
    
    # Look for artifact file
    pattern = f"{artifact_uuid}-*.yaml"
    for file in artifacts_dir.glob(pattern):
        return file
    
    return None

def validate_references(artifact_path, check_exists=False):
    """Validate UUID references in artifact."""
    artifact = load_yaml(artifact_path)
    
    # Extract all UUIDs in this artifact
    all_uuids = []
    def collect_uuids(data):
        if isinstance(data, dict):
            if 'uuid' in data:
                all_uuids.append(data['uuid'])
            for value in data.values():
                collect_uuids(value)
        elif isinstance(data, list):
            for item in data:
                collect_uuids(item)
    
    collect_uuids(artifact)
    uuid_set = set(all_uuids)
    
    # Extract references
    references = extract_uuid_references(artifact)
    
    if not references:
        print(f"✓ No UUID references found in {artifact_path}")
        return True
    
    all_valid = True
    artifacts_dir = artifact_path.parent
    
    for path, ref_uuid in references:
        # Check if reference is to UUID in same artifact
        if ref_uuid in uuid_set:
            print(f"✓ Reference at {path} points to UUID in same artifact: {ref_uuid}")
            continue
        
        # Check if reference format is valid
        if not re.match(r'^[A-Z0-9]+-[A-Z]+-\d{3}$', ref_uuid):
            print(f"✗ Invalid UUID reference format at {path}: {ref_uuid}")
            all_valid = False
            continue
        
        if check_exists:
            # Try to find referenced artifact
            ref_artifact = find_artifact_by_uuid(ref_uuid, artifacts_dir)
            if ref_artifact:
                # Check if UUID exists in referenced artifact
                ref_data = load_yaml(ref_artifact)
                ref_uuids = []
                def collect_ref_uuids(data):
                    if isinstance(data, dict):
                        if 'uuid' in data:
                            ref_uuids.append(data['uuid'])
                        for value in data.values():
                            collect_ref_uuids(value)
                    elif isinstance(data, list):
                        for item in data:
                            collect_ref_uuids(item)
                
                collect_ref_uuids(ref_data)
                if ref_uuid in ref_uuids:
                    print(f"✓ Reference at {path} points to existing UUID: {ref_uuid}")
                else:
                    print(f"⚠ Reference at {path} points to UUID not found in {ref_artifact}: {ref_uuid}")
            else:
                print(f"⚠ Reference at {path} points to UUID in unknown artifact: {ref_uuid}")
        else:
            print(f"✓ Reference at {path} format is valid: {ref_uuid}")
    
    return all_valid

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate-references.py <artifact.yaml> [--check-exists]")
        sys.exit(1)
    
    artifact_path = Path(sys.argv[1])
    check_exists = "--check-exists" in sys.argv
    
    success = validate_references(artifact_path, check_exists)
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Validate UUID formats and uniqueness in artifacts.

Usage:
    python validate-uuids.py <artifact.yaml>
"""

import sys
import yaml
import re
from pathlib import Path
from collections import defaultdict

def load_yaml(file_path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def extract_uuids(data, path="", uuids=None):
    """Recursively extract all UUIDs from artifact."""
    if uuids is None:
        uuids = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            if key == 'uuid':
                uuids.append((path, value))
            elif isinstance(value, (dict, list)):
                new_path = f"{path}.{key}" if path else key
                extract_uuids(value, new_path, uuids)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            new_path = f"{path}[{i}]" if path else f"[{i}]"
            extract_uuids(item, new_path, uuids)
    
    return uuids

def validate_workflow_node_uuid(uuid):
    """Validate workflow node UUID format."""
    pattern = r'^[A-Z]{2}\d+$|^START$'
    return bool(re.match(pattern, uuid))

def validate_sub_item_uuid(uuid):
    """Validate sub-item UUID format."""
    pattern = r'^[A-Z0-9]+-[A-Z]+-\d{3}$'
    return bool(re.match(pattern, uuid))

def validate_artifact_uuids(artifact_path):
    """Validate UUIDs in artifact."""
    artifact = load_yaml(artifact_path)
    
    # Get metadata UUID
    metadata_uuid = artifact.get('metadata', {}).get('uuid')
    if not metadata_uuid:
        print(f"✗ No metadata UUID found in {artifact_path}")
        return False
    
    # Validate metadata UUID
    if not validate_workflow_node_uuid(metadata_uuid):
        print(f"✗ Invalid workflow node UUID format: {metadata_uuid}")
        return False
    
    # Extract all UUIDs
    uuids = extract_uuids(artifact)
    
    # Check for duplicates
    uuid_counts = defaultdict(list)
    for path, uuid in uuids:
        uuid_counts[uuid].append(path)
    
    duplicates = {uuid: paths for uuid, paths in uuid_counts.items() if len(paths) > 1}
    if duplicates:
        print(f"✗ Duplicate UUIDs found:")
        for uuid, paths in duplicates.items():
            print(f"  {uuid} appears at: {', '.join(paths)}")
        return False
    
    # Validate each UUID format
    all_valid = True
    for path, uuid in uuids:
        if uuid == metadata_uuid:
            # Already validated
            continue
        
        if not validate_sub_item_uuid(uuid):
            print(f"✗ Invalid sub-item UUID format at {path}: {uuid}")
            all_valid = False
    
    if all_valid:
        print(f"✓ All UUIDs in {artifact_path} are valid and unique ({len(uuids)} UUIDs found)")
    
    return all_valid

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate-uuids.py <artifact.yaml>")
        sys.exit(1)
    
    artifact_path = Path(sys.argv[1])
    success = validate_artifact_uuids(artifact_path)
    sys.exit(0 if success else 1)

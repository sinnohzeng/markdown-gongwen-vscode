#!/usr/bin/env python3
"""
Verify workflow.yaml integrity and consistency.

Checks:
- Template paths exist
- Dependencies reference valid nodes
- Edges reference valid nodes
- UUID consistency
- Display number sequence
- Node ID/UUID mapping
"""

import sys
import yaml
from pathlib import Path
from typing import Dict, List, Set, Tuple

def load_yaml(file_path: Path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def verify_workflow(workflow_path: Path, templates_dir: Path, verbose: bool = False) -> Tuple[bool, List[str]]:
    """Verify workflow integrity."""
    errors = []
    warnings = []
    
    workflow = load_yaml(workflow_path)
    nodes = workflow.get('nodes', {})
    edges = workflow.get('edges', [])
    
    # Build node registry
    node_ids = set()
    node_uuids = {}
    node_display_numbers = {}
    node_dependencies = {}
    
    for node_id, node_data in nodes.items():
        node_ids.add(node_id)
        uuid = node_data.get('uuid')
        display_num = node_data.get('display_number')
        
        if uuid:
            node_uuids[node_id] = uuid
            # Check UUID format
            if not uuid.startswith(node_id.split('_')[0] if '_' in node_id else ''):
                # UUID should match pattern ^\d{2}-[A-Z]{2,}$
                import re
                if not re.match(r'^\d{2}-[A-Z]{2,}$', uuid):
                    errors.append(f"Node {node_id}: Invalid UUID format '{uuid}' (should match ^\\d{2}-[A-Z]{2,}$)")
        
        if display_num is not None:
            if display_num in node_display_numbers:
                errors.append(f"Node {node_id}: Duplicate display_number {display_num} (also used by {node_display_numbers[display_num]})")
            node_display_numbers[display_num] = node_id
        
        # Collect dependencies
        deps = node_data.get('dependencies', [])
        node_dependencies[node_id] = deps
    
    # Check display number sequence
    if node_display_numbers:
        expected_nums = set(range(min(node_display_numbers.keys()), max(node_display_numbers.keys()) + 1))
        actual_nums = set(node_display_numbers.keys())
        missing = expected_nums - actual_nums
        if missing:
            warnings.append(f"Missing display_numbers: {sorted(missing)}")
    
    # Check template paths
    for node_id, node_data in nodes.items():
        outputs = node_data.get('outputs', [])
        for output in outputs:
            template_path = output.get('template')
            if template_path:
                full_path = workflow_path.parent.parent / template_path
                if not full_path.exists():
                    errors.append(f"Node {node_id}: Template not found: {template_path}")
    
    # Check dependencies reference valid nodes
    uuid_to_node = {uuid: node_id for node_id, uuid in node_uuids.items()}
    for node_id, deps in node_dependencies.items():
        for dep_uuid in deps:
            if dep_uuid not in uuid_to_node:
                errors.append(f"Node {node_id}: Dependency '{dep_uuid}' does not reference a valid node UUID")
    
    # Check edges reference valid nodes
    edge_node_refs = set()
    for edge in edges:
        from_node = edge.get('from')
        to_node = edge.get('to')
        
        # Handle array in 'from' (for joins)
        if isinstance(from_node, list):
            for fn in from_node:
                edge_node_refs.add(fn)
                if fn not in node_ids:
                    errors.append(f"Edge: 'from' node '{fn}' does not exist")
        else:
            edge_node_refs.add(from_node)
            if from_node not in node_ids:
                errors.append(f"Edge: 'from' node '{from_node}' does not exist")
        
        # Handle array in 'to'
        if isinstance(to_node, list):
            for tn in to_node:
                edge_node_refs.add(tn)
                if tn not in node_ids:
                    errors.append(f"Edge: 'to' node '{tn}' does not exist")
        else:
            edge_node_refs.add(to_node)
            if to_node not in node_ids:
                errors.append(f"Edge: 'to' node '{to_node}' does not exist")
    
    # Check for orphaned nodes (nodes not referenced in edges)
    referenced_nodes = {edge.get('from') if not isinstance(edge.get('from'), list) else None for edge in edges}
    referenced_nodes.update({edge.get('to') if not isinstance(edge.get('to'), list) else None for edge in edges})
    referenced_nodes.discard(None)
    # Flatten lists
    for edge in edges:
        if isinstance(edge.get('from'), list):
            referenced_nodes.update(edge.get('from'))
        if isinstance(edge.get('to'), list):
            referenced_nodes.update(edge.get('to'))
    
    # START node might not be referenced in edges (it's the entry point)
    orphaned = node_ids - referenced_nodes - {'START'}
    if orphaned:
        warnings.append(f"Nodes not referenced in edges: {sorted(orphaned)}")
    
    # Check edge consistency with dependencies
    for edge in edges:
        edge_type = edge.get('type')
        # Skip loop edges - they're for iteration, not dependencies
        if edge_type == 'loop':
            continue
            
        from_node = edge.get('from')
        to_node = edge.get('to')
        
        # Handle arrays
        from_nodes = from_node if isinstance(from_node, list) else [from_node]
        to_nodes = to_node if isinstance(to_node, list) else [to_node]
        
        for fn in from_nodes:
            for tn in to_nodes:
                if fn in node_uuids and tn in node_dependencies:
                    expected_dep = node_uuids[fn]
                    actual_deps = node_dependencies[tn]
                    if expected_dep not in actual_deps:
                        warnings.append(f"Edge {fn} -> {tn}: Edge exists but dependency '{expected_dep}' not in {tn}'s dependencies list")
    
    if verbose:
        print("=== Workflow Verification ===")
        print(f"Nodes: {len(nodes)}")
        print(f"Edges: {len(edges)}")
        print(f"Errors: {len(errors)}")
        print(f"Warnings: {len(warnings)}")
        print()
    
    if errors:
        print("ERRORS:")
        for error in errors:
            print(f"  ✗ {error}")
        print()
    
    if warnings:
        print("WARNINGS:")
        for warning in warnings:
            print(f"  ⚠ {warning}")
        print()
    
    if not errors and not warnings:
        print("✓ Workflow verification passed!")
        return True, []
    
    return len(errors) == 0, errors + warnings

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Verify workflow.yaml integrity")
    parser.add_argument("--workflow", default="workflow/workflow.yaml", help="Path to workflow.yaml")
    parser.add_argument("--templates", default="workflow/templates", help="Path to templates directory")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()
    
    workflow_path = Path(args.workflow)
    templates_dir = Path(args.templates)
    
    if not workflow_path.exists():
        print(f"Error: Workflow file not found: {workflow_path}")
        sys.exit(1)
    
    success, issues = verify_workflow(workflow_path, templates_dir, args.verbose)
    sys.exit(0 if success else 1)

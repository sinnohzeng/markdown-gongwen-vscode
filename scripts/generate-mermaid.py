#!/usr/bin/env python3
"""
Generate Mermaid flowchart diagram from workflow.yaml

Usage:
    python scripts/generate-mermaid.py > docs/product/PROCESS_WORKFLOW.md
"""

import yaml
import sys
from pathlib import Path
from typing import Dict, List, Any


def load_workflow_yaml(yaml_path: str) -> Dict[str, Any]:
    """Load and parse workflow YAML file."""
    with open(yaml_path, 'r') as f:
        return yaml.safe_load(f)


def format_node_label(node: Dict[str, Any]) -> str:
    """Format node label with UUID, name and activities (no display numbers)."""
    uuid = node.get('uuid') or node.get('id', '')
    name = node['name']
    activities = node.get('activities', [])
    
    # Build label with UUID and name (internal information only)
    if uuid:
        label_parts = [f"**{uuid}: {name}**"]
    else:
        label_parts = [f"**{name}**"]
    
    for activity in activities[:3]:  # Limit to 3 bullet points
        label_parts.append(f"• {activity}")
    
    return "<br/>".join(label_parts)


def get_node_id_mapping(workflow: Dict[str, Any]) -> Dict[str, str]:
    """Create mapping from node IDs to Mermaid variable names."""
    mapping = {}
    for node_id, node_data in workflow['nodes'].items():
        # Create safe variable name from node ID
        var_name = node_id.replace('-', '').replace('_', '')
        mapping[node_id] = var_name
    return mapping


def generate_mermaid(workflow: Dict[str, Any]) -> str:
    """Generate Mermaid flowchart syntax from workflow YAML."""
    lines = []
    lines.append("```mermaid")
    lines.append("flowchart TD")
    lines.append("    %% Initial Project Release Flow")
    
    # Get node ID to variable name mapping
    node_mapping = get_node_id_mapping(workflow)
    node_mapping['START'] = 'Start'  # Special case for start node
    
    # Generate start node
    start_node = workflow['nodes'].get('START', {})
    if start_node:
        lines.append(f"    Start([{start_node.get('name', 'Project Initiation')}])")
    
    # Generate containers (subgraphs) with nodes
    containers = workflow.get('containers', [])
    container_nodes = {}  # Track which nodes are in which container
    
    for container in containers:
        container_id = container['id']
        container_name = container['name']
        node_ids = container['nodes']
        
        lines.append("")
        lines.append(f"    subgraph {container_id}[\"{container_name}\"]")
        
        for node_id in node_ids:
            if node_id in workflow['nodes']:
                node = workflow['nodes'][node_id]
                var_name = node_mapping[node_id]
                label = format_node_label(node)
                lines.append(f"        {var_name}[\"{label}\"]")
                container_nodes[node_id] = container_id
        
        lines.append("    end")
    
    # Add nodes that aren't in containers
    for node_id, node in workflow['nodes'].items():
        if node_id == 'START':
            continue
        if node_id not in container_nodes:
            var_name = node_mapping[node_id]
            label = format_node_label(node)
            lines.append(f"    {var_name}[\"{label}\"]")
    
    lines.append("")
    lines.append("    %% Flow connections")
    
    # Generate edges with comments for parallel activities
    edges = workflow.get('edges', [])
    for i, edge in enumerate(edges):
        from_id = edge['from']
        to_id = edge['to']
        edge_type = edge.get('type', 'sequential')
        
        from_var = node_mapping.get(from_id, from_id)
        
        # Add comment for parallel activities
        if isinstance(to_id, list) and len(to_id) > 1:
            if i == 0 or edges[i-1].get('type') != 'parallel':
                lines.append("")
                lines.append("    %% Parallel Planning Activities")
        
        if isinstance(to_id, list):
            # Multiple targets (parallel)
            for target_id in to_id:
                to_var = node_mapping.get(target_id, target_id)
                lines.append(f"    {from_var} --> {to_var}")
        else:
            # Single target
            to_var = node_mapping.get(to_id, to_id)
            lines.append(f"    {from_var} --> {to_var}")
    
    # Add comment sections
    lines.append("")
    lines.append("    %% Subsequent Release Flow")
    
    lines.append("```")
    
    return "\n".join(lines)


def main():
    """Main entry point."""
    # Determine script location and project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    yaml_path = project_root / "docs" / "product" / "workflow.yaml"
    
    if not yaml_path.exists():
        print(f"Error: {yaml_path} not found", file=sys.stderr)
        sys.exit(1)
    
    # Load workflow
    workflow = load_workflow_yaml(str(yaml_path))
    
    # Generate Mermaid
    mermaid_output = generate_mermaid(workflow)
    
    # Output to stdout
    print(mermaid_output)


if __name__ == "__main__":
    main()

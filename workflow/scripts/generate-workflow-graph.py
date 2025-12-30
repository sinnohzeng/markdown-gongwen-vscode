#!/usr/bin/env python3
"""
Generate a static HTML page with an interactive graph visualization of the workflow.

Usage:
    python generate-workflow-graph.py [--workflow workflow/workflow.yaml] [--output workflow/workflow-graph.html]
"""

import sys
import yaml
import json
import argparse
from pathlib import Path
from typing import Dict, List, Set

def load_yaml(file_path: Path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def generate_graph_html(workflow: Dict, output_path: Path):
    """Generate HTML page with interactive graph visualization."""
    workflow_info = workflow.get('workflow', {})
    nodes_data = workflow.get('nodes', {})
    edges_data = workflow.get('edges', [])
    
    # Build graph data
    graph_nodes = []
    graph_edges = []
    node_colors = {
        'Product Owner': '#4A90E2',
        'Project Manager': '#50C878',
        'Solution Architecture Team': '#FF6B6B',
        'Development Team': '#FFA500',
    }
    
    # Color mapping for node types
    type_colors = {
        'start': '#2ECC71',
        'task': '#3498DB',
        'loop': '#E74C3C',
    }
    
    # Process nodes
    for node_id, node_info in nodes_data.items():
        role = node_info.get('role', 'Unknown')
        node_type = node_info.get('type', 'task')
        display_num = node_info.get('display_number', 0)
        uuid = node_info.get('uuid', node_id)
        name = node_info.get('name', node_id)
        requires_input = node_info.get('requires_human_input', False)
        
        # Determine color based on role
        color = node_colors.get(role, '#95A5A6')
        
        # Build label with display number
        label = f"{display_num}. {name}"
        if requires_input:
            label += " ⚠"
        
        # Build title with details
        title = f"{name}\nUUID: {uuid}\nRole: {role}\nType: {node_type}"
        if requires_input:
            title += "\n⚠ Requires Human Input"
        
        graph_nodes.append({
            'id': node_id,
            'label': label,
            'title': title,
            'color': color,
            'shape': 'box',
            'font': {'size': 12},
            'margin': 10,
            'widthConstraint': {'maximum': 200},
        })
    
    # Process edges
    for edge in edges_data:
        from_node = edge.get('from')
        to_node = edge.get('to')
        edge_type = edge.get('type', 'sequential')
        join_type = edge.get('join', None)
        
        # Handle arrays in from/to
        from_nodes = from_node if isinstance(from_node, list) else [from_node]
        to_nodes = to_node if isinstance(to_node, list) else [to_node]
        
        for fn in from_nodes:
            for tn in to_nodes:
                # Determine edge color and style
                if edge_type == 'loop':
                    color = '#E74C3C'
                    dashes = True
                    width = 3
                elif edge_type == 'parallel':
                    color = '#9B59B6'
                    dashes = False
                    width = 2
                else:  # sequential
                    color = '#34495E'
                    dashes = False
                    width = 2
                
                # Add label for join types
                label = ''
                if join_type == 'all':
                    label = 'ALL'
                elif join_type == 'none':
                    label = 'PAR'
                
                graph_edges.append({
                    'from': fn,
                    'to': tn,
                    'color': {'color': color},
                    'dashes': dashes,
                    'width': width,
                    'label': label,
                    'font': {'size': 10, 'align': 'middle'},
                    'arrows': 'to',
                })
    
    # Convert to JSON strings for embedding
    json_nodes = json.dumps(graph_nodes, indent=8)
    json_edges = json.dumps(graph_edges, indent=8)
    
    # Generate HTML
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Dependency Graph - {workflow_info.get('name', 'Workflow')}</title>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
        }}
        h1 {{
            margin: 0 0 10px 0;
            color: #2c3e50;
        }}
        .subtitle {{
            color: #7f8c8d;
            margin-bottom: 20px;
        }}
        #workflow-graph {{
            width: 100%;
            height: 800px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fafafa;
        }}
        .legend {{
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }}
        .legend-item {{
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .legend-color {{
            width: 20px;
            height: 20px;
            border-radius: 3px;
            border: 1px solid #ddd;
        }}
        .legend-edge {{
            width: 30px;
            height: 3px;
            border-radius: 2px;
        }}
        .info {{
            margin-top: 15px;
            padding: 10px;
            background: #e8f4f8;
            border-left: 4px solid #3498db;
            border-radius: 4px;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{workflow_info.get('name', 'Workflow')}</h1>
        <div class="subtitle">{workflow_info.get('description', '')}</div>
        
        <div id="workflow-graph"></div>
        
        <div class="legend">
            <div><strong>Node Roles:</strong></div>
            <div class="legend-item">
                <div class="legend-color" style="background: #4A90E2;"></div>
                <span>Product Owner</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #50C878;"></div>
                <span>Project Manager</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #FF6B6B;"></div>
                <span>Solution Architecture Team</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #FFA500;"></div>
                <span>Development Team</span>
            </div>
            
            <div style="width: 100%; margin-top: 10px;"><strong>Edge Types:</strong></div>
            <div class="legend-item">
                <div class="legend-edge" style="background: #34495E;"></div>
                <span>Sequential</span>
            </div>
            <div class="legend-item">
                <div class="legend-edge" style="background: #9B59B6;"></div>
                <span>Parallel</span>
            </div>
            <div class="legend-item">
                <div class="legend-edge" style="background: #E74C3C; border-style: dashed;"></div>
                <span>Loop</span>
            </div>
        </div>
        
        <div class="info">
            <strong>ℹ️ Tips:</strong> Hover over nodes to see details. Drag nodes to rearrange. 
            Nodes marked with ⚠ require human input. Use mouse wheel to zoom.
        </div>
    </div>

    <script type="text/javascript">
        // Graph data
        const nodes = new vis.DataSet({json_nodes});
        const edges = new vis.DataSet({json_edges});
        
        // Container
        const container = document.getElementById('workflow-graph');
        
        // Graph options
        const options = {{
            nodes: {{
                shape: 'box',
                font: {{
                    size: 12,
                    face: 'Arial'
                }},
                borderWidth: 2,
                shadow: true,
                margin: 10
            }},
            edges: {{
                arrows: {{
                    to: {{
                        enabled: true,
                        scaleFactor: 1.2
                    }}
                }},
                smooth: {{
                    type: 'cubicBezier',
                    forceDirection: 'horizontal',
                    roundness: 0.4
                }},
                font: {{
                    size: 10,
                    align: 'middle'
                }},
                shadow: true
            }},
            layout: {{
                hierarchical: {{
                    enabled: true,
                    direction: 'UD',
                    sortMethod: 'directed',
                    levelSeparation: 150,
                    nodeSpacing: 200,
                    treeSpacing: 200,
                    blockShifting: true,
                    edgeMinimization: true,
                    parentCentralization: true
                }}
            }},
            physics: {{
                enabled: false
            }},
            interaction: {{
                dragNodes: true,
                dragView: true,
                zoomView: true,
                hover: true,
                tooltipDelay: 200
            }}
        }};
        
        // Create network
        const data = {{ nodes: nodes, edges: edges }};
        const network = new vis.Network(container, data, options);
        
        // Add event listeners
        network.on('click', function(params) {{
            if (params.nodes.length > 0) {{
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                console.log('Selected node:', node);
            }}
        }});
        
        network.on('hoverNode', function(params) {{
            container.style.cursor = 'pointer';
        }});
        
        network.on('blurNode', function(params) {{
            container.style.cursor = 'default';
        }});
    </script>
</body>
</html>
"""
    
    # Write HTML file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Generated workflow graph: {output_path}")
    print(f"  Nodes: {len(graph_nodes)}")
    print(f"  Edges: {len(graph_edges)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate HTML workflow dependency graph")
    parser.add_argument("--workflow", default="workflow/workflow.yaml", help="Path to workflow.yaml")
    parser.add_argument("--output", default="workflow/workflow-graph.html", help="Output HTML file path")
    args = parser.parse_args()
    
    workflow_path = Path(args.workflow)
    output_path = Path(args.output)
    
    if not workflow_path.exists():
        print(f"Error: Workflow file not found: {workflow_path}")
        sys.exit(1)
    
    workflow = load_yaml(workflow_path)
    generate_graph_html(workflow, output_path)

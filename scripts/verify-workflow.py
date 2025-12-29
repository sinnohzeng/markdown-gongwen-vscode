#!/usr/bin/env python3
"""
Workflow Verification Script

Verifies the integrity of workflow.yaml and all template files:
- Template paths exist and are valid
- Dependencies reference valid nodes
- Edges reference valid nodes
- Template frontmatter matches workflow nodes
- Cross-references are valid
- UUID consistency

Usage:
    python3 scripts/verify-workflow.py
    python3 scripts/verify-workflow.py --verbose
"""

import argparse
import os
import re
import sys
import yaml
from pathlib import Path
from typing import List, Tuple


def load_workflow(workflow_path: str) -> dict:
    """Load and parse workflow.yaml"""
    with open(workflow_path, 'r') as f:
        return yaml.safe_load(f)


def check_template_paths(nodes: dict, verbose: bool = False) -> Tuple[List[str], List[str]]:
    """Check all template paths exist"""
    critical_issues = []
    warnings = []
    
    for node_id, node in nodes.items():
        if 'outputs' in node and node['outputs']:
            for output in node['outputs']:
                if 'template' in output:
                    template_path = output['template']
                    if not os.path.exists(template_path):
                        critical_issues.append(f"❌ {node_id}: Template not found: {template_path}")
                    elif verbose:
                        print(f"✅ {node_id}: {template_path}")
    
    return critical_issues, warnings


def check_dependencies(nodes: dict, verbose: bool = False) -> Tuple[List[str], List[str]]:
    """Check all dependencies reference valid nodes"""
    critical_issues = []
    warnings = []
    node_ids = set(nodes.keys())
    
    for node_id, node in nodes.items():
        if 'dependencies' in node:
            for dep in node['dependencies']:
                if dep not in node_ids:
                    critical_issues.append(f"❌ {node_id}: Dependency '{dep}' does not exist")
                elif verbose:
                    print(f"✅ {node_id} depends on {dep}")
    
    return critical_issues, warnings


def check_edges(nodes: dict, edges: list, verbose: bool = False) -> Tuple[List[str], List[str]]:
    """Check all edges reference valid nodes"""
    critical_issues = []
    warnings = []
    node_ids = set(nodes.keys())
    
    for edge in edges:
        from_node = edge['from']
        to_nodes = edge['to'] if isinstance(edge['to'], list) else [edge['to']]
        
        if from_node not in node_ids:
            critical_issues.append(f"❌ Edge from '{from_node}' does not exist")
        elif verbose:
            print(f"✅ Edge from {from_node}")
        
        for to_node in to_nodes:
            if to_node not in node_ids:
                critical_issues.append(f"❌ Edge to '{to_node}' does not exist")
            elif verbose:
                print(f"  → {to_node}")
    
    return critical_issues, warnings


def check_template_frontmatter(nodes: dict, template_dir: Path, verbose: bool = False) -> Tuple[List[str], List[str]]:
    """Check template frontmatter matches workflow nodes"""
    critical_issues = []
    warnings = []
    node_ids = set(nodes.keys())
    
    for template_file in template_dir.glob('*.template.md'):
        if template_file.name in ['README.md', 'UUID-GUIDE.md']:
            continue
        
        with open(template_file, 'r') as f:
            content = f.read()
        
        frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
        if frontmatter_match:
            try:
                frontmatter = yaml.safe_load(frontmatter_match.group(1))
                node_id = frontmatter.get('workflow_node', '')
                uuid = frontmatter.get('uuid', '')
                dependencies = frontmatter.get('dependencies', [])
                next_node = frontmatter.get('next_node', '')
                
                # Check UUID matches node_id
                if uuid and node_id and uuid != node_id:
                    critical_issues.append(f"❌ {template_file.name}: UUID '{uuid}' != workflow_node '{node_id}'")
                
                # Check dependencies exist
                for dep in dependencies:
                    if dep not in node_ids:
                        critical_issues.append(f"❌ {template_file.name}: Dependency '{dep}' does not exist")
                
                # Check next_node exists
                if next_node and next_node not in node_ids:
                    critical_issues.append(f"❌ {template_file.name}: next_node '{next_node}' does not exist")
                
                # Check workflow_node matches actual node
                if node_id not in node_ids:
                    critical_issues.append(f"❌ {template_file.name}: workflow_node '{node_id}' does not exist")
                else:
                    # Verify the node's dependencies match template dependencies
                    node = nodes[node_id]
                    node_deps = set(node.get('dependencies', []))
                    template_deps = set(dependencies)
                    if node_deps != template_deps:
                        critical_issues.append(
                            f"❌ {template_file.name}: Template dependencies {template_deps} != node dependencies {node_deps}"
                        )
                    elif verbose:
                        print(f"✅ {template_file.name}: Dependencies match workflow node")
            
            except yaml.YAMLError as e:
                critical_issues.append(f"❌ {template_file.name}: Invalid YAML frontmatter - {e}")
    
    return critical_issues, warnings


def check_next_steps(template_dir: Path, node_ids: set, verbose: bool = False) -> Tuple[List[str], List[str]]:
    """Check 'Next Steps' references in templates"""
    critical_issues = []
    warnings = []
    
    for template_file in template_dir.glob('*.template.md'):
        if template_file.name in ['README.md', 'UUID-GUIDE.md']:
            continue
        
        with open(template_file, 'r') as f:
            content = f.read()
        
        next_steps_match = re.search(r'\*\*Next Steps:\*\*\s*\[([A-Z0-9]+)\]\s*(.+)', content)
        if next_steps_match:
            next_node_id = next_steps_match.group(1)
            
            if next_node_id not in node_ids:
                critical_issues.append(f"❌ {template_file.name}: Next Steps references non-existent node '{next_node_id}'")
            else:
                # Verify it matches frontmatter
                frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter = yaml.safe_load(frontmatter_match.group(1))
                    frontmatter_next = frontmatter.get('next_node', '')
                    if frontmatter_next != next_node_id:
                        warnings.append(
                            f"⚠️  {template_file.name}: Next Steps '{next_node_id}' != frontmatter '{frontmatter_next}'"
                        )
                    elif verbose:
                        print(f"✅ {template_file.name}: Next Steps -> {next_node_id}")
    
    return critical_issues, warnings


def check_uuid_consistency(nodes: dict, verbose: bool = False) -> Tuple[List[str], List[str]]:
    """Check UUID consistency across nodes"""
    critical_issues = []
    warnings = []
    
    for node_id, node in nodes.items():
        if 'uuid' in node:
            if node['uuid'] != node_id:
                critical_issues.append(f"❌ {node_id}: UUID mismatch - node_id='{node_id}', uuid='{node['uuid']}'")
            elif verbose:
                print(f"✅ {node_id}: UUID matches node ID")
        elif node_id != 'START':
            critical_issues.append(f"❌ {node_id}: Missing UUID")
    
    return critical_issues, warnings


def check_orphaned_templates(nodes: dict, template_dir: Path) -> Tuple[List[str], List[str]]:
    """Check for orphaned templates not referenced in workflow"""
    warnings = []
    critical_issues = []
    
    # Collect referenced templates
    referenced_templates = set()
    for node_id, node in nodes.items():
        if 'outputs' in node and node['outputs']:
            for output in node['outputs']:
                if 'template' in output:
                    referenced_templates.add(output['template'])
    
    # Find all templates
    all_templates = set()
    for template_file in template_dir.glob('*.template.md'):
        all_templates.add(str(template_file))
    
    orphaned = all_templates - referenced_templates
    for template in orphaned:
        if 'README' not in template and 'UUID-GUIDE' not in template:
            warnings.append(f"⚠️  Orphaned template: {template}")
    
    return critical_issues, warnings


def main():
    parser = argparse.ArgumentParser(description='Verify workflow.yaml and template integrity')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed output')
    parser.add_argument('--workflow', default='docs/product/workflow.yaml', help='Path to workflow.yaml')
    parser.add_argument('--templates', default='docs/product/templates', help='Path to templates directory')
    args = parser.parse_args()
    
    # Change to project root
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Load workflow
    workflow_path = Path(args.workflow)
    if not workflow_path.exists():
        print(f"❌ Error: Workflow file not found: {workflow_path}")
        sys.exit(1)
    
    workflow = load_workflow(str(workflow_path))
    nodes = workflow['nodes']
    edges = workflow.get('edges', [])
    template_dir = Path(args.templates)
    node_ids = set(nodes.keys())
    
    if args.verbose:
        print("=== Workflow Verification ===\n")
    
    # Run all checks
    all_critical = []
    all_warnings = []
    
    # 1. Template paths
    if args.verbose:
        print("1. Checking Template Paths")
        print("-" * 60)
    critical, warnings = check_template_paths(nodes, args.verbose)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # 2. Dependencies
    if args.verbose:
        print("\n2. Checking Dependencies")
        print("-" * 60)
    critical, warnings = check_dependencies(nodes, args.verbose)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # 3. Edges
    if args.verbose:
        print("\n3. Checking Edges")
        print("-" * 60)
    critical, warnings = check_edges(nodes, edges, args.verbose)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # 4. Template frontmatter
    if args.verbose:
        print("\n4. Checking Template Frontmatter")
        print("-" * 60)
    critical, warnings = check_template_frontmatter(nodes, template_dir, args.verbose)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # 5. Next Steps
    if args.verbose:
        print("\n5. Checking 'Next Steps' References")
        print("-" * 60)
    critical, warnings = check_next_steps(template_dir, node_ids, args.verbose)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # 6. UUID consistency
    if args.verbose:
        print("\n6. Checking UUID Consistency")
        print("-" * 60)
    critical, warnings = check_uuid_consistency(nodes, args.verbose)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # 7. Orphaned templates
    if args.verbose:
        print("\n7. Checking for Orphaned Templates")
        print("-" * 60)
    critical, warnings = check_orphaned_templates(nodes, template_dir)
    all_critical.extend(critical)
    all_warnings.extend(warnings)
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Nodes: {len(nodes)}")
    print(f"Edges: {len(edges)}")
    print(f"Templates checked: {len(list(template_dir.glob('*.template.md'))) - 2}")  # Exclude README and UUID-GUIDE
    print(f"Critical Issues: {len(all_critical)}")
    print(f"Warnings: {len(all_warnings)}")
    
    if all_critical:
        print("\n❌ Critical Issues Found:")
        for issue in all_critical:
            print(f"  {issue}")
        sys.exit(1)
    
    if all_warnings:
        print("\n⚠️  Warnings:")
        for warning in all_warnings:
            print(f"  {warning}")
    
    if not all_critical:
        print("\n✅ All links and references are valid!")
        print("✅ Workflow structure is sound and complete")
        sys.exit(0)


if __name__ == '__main__':
    main()

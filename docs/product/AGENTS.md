# AI Agents Guide - Process Workflow

**Purpose:** Guide for AI agents to understand, execute, and automate the software development lifecycle workflow.

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX

---

## Overview

This workflow system provides a structured, AI-native approach to software development from problem definition through stable release. All artifacts are version-controlled in git, with YAML as the source of truth and generated Mermaid diagrams for visualization.

### Key Principles

1. **Git as Source of Truth**: All artifacts are versioned in git
2. **YAML-Driven**: `workflow.yaml` defines the complete workflow
3. **Template-Based**: AI-native templates guide artifact creation
4. **UUID-Tracked**: Every referenceable item has a UUID for traceability
5. **Validation-Driven**: Done criteria must be met before progression

---

## Workflow Structure

### Source Files

- **`workflow.yaml`**: Source of truth for workflow definition
- **`templates/*.template.md`**: AI-native templates for artifacts
- **`stages.csv`**: Reference for UUID format and dependencies
- **`PROCESS_WORKFLOW.md`**: Generated Mermaid diagram (visual only)

### Workflow Nodes

Each node in `workflow.yaml` contains:

```yaml
NODE_ID:
  id: "NODE_ID"           # Unique identifier
  uuid: "UUID"            # UUID matching stages.csv format
  display_number: N       # Display number (1-16)
  name: "Node Name"       # Human-readable name
  role: "Role"            # Responsible role
  dependencies: []         # Required node UUIDs
  activities: []          # List of activities
  outputs: []             # Artifacts to produce
  done_criteria: []       # Validation criteria
  automation:             # Automation metadata
    agent: "agent-name"
    script: "path/to/script"
```

---

## Working with Templates

### Template Location

Templates are in `docs/product/templates/` with naming: `{UUID}-{Name}.template.md`

### Template Structure

1. **YAML Frontmatter**: Metadata (UUID, workflow_node, dependencies, status)
2. **AI Instructions**: `<!-- AI_INSTRUCTION: ... -->` blocks
3. **Type Hints**: `<!-- TYPE: ... -->` with constraints
4. **Examples**: `<!-- EXAMPLE: ... -->` for reference
5. **Validation Checklist**: At end of template

### Template Usage Workflow

```python
# Pseudo-code for AI agent
def process_template(template_path, node_data):
    # 1. Load template
    template = load_template(template_path)
    
    # 2. Extract metadata from frontmatter
    metadata = parse_yaml_frontmatter(template)
    
    # 3. Follow AI_INSTRUCTION comments
    instructions = extract_ai_instructions(template)
    
    # 4. Fill placeholders respecting TYPE constraints
    filled = fill_template(template, node_data, instructions)
    
    # 5. Generate UUIDs for sub-items
    filled = generate_sub_item_uuids(filled, metadata['uuid'])
    
    # 6. Validate against done_criteria
    validate(filled, node_data['done_criteria'])
    
    # 7. Save artifact
    save_artifact(filled, node_data['outputs'][0]['path'])
    
    # 8. Update status in frontmatter
    update_status(filled, 'complete')
```

---

## UUID Management

### Workflow Node UUIDs

Format: `{CATEGORY}{NUMBER}` (e.g., `PO1`, `ST1`, `BH1`)

- Must match `stages.csv` format
- Defined in `workflow.yaml` under `uuid` field
- Used for cross-referencing between nodes

### Sub-Item UUIDs

Format: `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE}` (e.g., `PO1-PROB-001`)

**Generation Rules:**

1. Extract artifact UUID from template frontmatter
2. Determine TYPE code (see UUID-GUIDE.md)
3. Find highest existing sequence for that TYPE
4. Increment by 1 (001, 002, 003...)
5. Format: `{ARTIFACT_UUID}-{TYPE}-{SEQUENCE:03d}`

**Example:**
```python
def generate_sub_item_uuid(artifact_uuid, item_type, existing_items):
    # Find existing UUIDs of this type
    pattern = f"{artifact_uuid}-{item_type}-(\\d{{3}})"
    sequences = [int(m.group(1)) for m in re.finditer(pattern, existing_items)]
    
    # Get next sequence
    next_seq = max(sequences, default=0) + 1
    
    # Format UUID
    return f"{artifact_uuid}-{item_type}-{next_seq:03d}"
```

---

## Executing Workflow Nodes

### Node Execution Flow

1. **Check Dependencies**
   ```python
   def check_dependencies(node, workflow):
       for dep_uuid in node['dependencies']:
           dep_node = find_node_by_uuid(workflow, dep_uuid)
           if not is_complete(dep_node):
               raise DependencyNotMetError(f"{dep_uuid} not complete")
   ```

2. **Load Template**
   ```python
   template_path = node['outputs'][0]['template']
   template = load_template(template_path)
   ```

3. **Gather Input Data**
   ```python
   input_data = gather_inputs(node, workflow)
   # Includes: dependencies outputs, context, etc.
   ```

4. **Fill Template**
   ```python
   artifact = fill_template(template, input_data)
   artifact = generate_uuids(artifact, node['uuid'])
   ```

5. **Validate Done Criteria**
   ```python
   for criterion in node['done_criteria']:
       if not validate_criterion(artifact, criterion):
           raise ValidationError(f"Criterion not met: {criterion}")
   ```

6. **Save Artifacts**
   ```python
   for output in node['outputs']:
       save_artifact(artifact, output['path'])
   ```

7. **Update Status**
   ```python
   update_node_status(node, 'complete')
   ```

### Parallel Node Execution

Nodes with no dependencies on each other can run in parallel:

```python
def execute_parallel_nodes(workflow, node_uuids):
    # All nodes must have dependencies satisfied
    ready_nodes = [n for n in node_uuids if dependencies_met(n, workflow)]
    
    # Execute in parallel
    results = parallel_execute(ready_nodes, execute_node)
    
    # Wait for all to complete
    wait_for_all(results)
```

---

## Validation and Done Criteria

### Done Criteria Types

1. **File Existence**: `"{file}.md exists"`
2. **Content Validation**: `"Root cause identified and documented"`
3. **UUID Validation**: `"All UUIDs generated and unique"`
4. **Dependency Check**: `"Dependencies on PO1 satisfied"`

### Validation Functions

```python
def validate_done_criteria(artifact, criteria):
    for criterion in criteria:
        if criterion.endswith("exists"):
            file_path = extract_file_path(criterion)
            if not file_exists(file_path):
                return False
        
        elif "validated" in criterion or "complete" in criterion:
            # Content-based validation
            if not validate_content(artifact, criterion):
                return False
        
        elif "UUID" in criterion:
            if not validate_uuids(artifact):
                return False
    
    return True
```

---

## Cross-Referencing and Traceability

### UUID References

When referencing items from other artifacts:

```markdown
See [PO1-PROB-001](PO1-Root-Cause-Analysis.md#problem-statement) for the problem definition.
```

### Dependency Tracking

```python
def build_dependency_graph(workflow):
    graph = {}
    for node_id, node in workflow['nodes'].items():
        graph[node_id] = {
            'dependencies': node['dependencies'],
            'dependents': find_dependents(node_id, workflow)
        }
    return graph
```

### Traceability Chain

```python
def trace_item(uuid, workflow):
    # Find which artifact contains this UUID
    artifact = find_artifact_by_sub_uuid(uuid)
    
    # Find workflow node
    node = find_node_by_artifact(artifact, workflow)
    
    # Build chain: problem -> solution -> implementation
    chain = build_traceability_chain(node, workflow)
    
    return chain
```

---

## Best Practices for AI Agents

### 1. Always Check Dependencies First

```python
def can_execute_node(node, workflow):
    return all(
        is_complete(find_node_by_uuid(workflow, dep))
        for dep in node['dependencies']
    )
```

### 2. Generate UUIDs Before Filling Content

```python
# Generate UUIDs first
uuids = generate_all_uuids(template, artifact_uuid)

# Then fill content with UUIDs in place
filled = fill_template_with_uuids(template, data, uuids)
```

### 3. Validate Incrementally

```python
# Validate as you go, not just at the end
def fill_template_safely(template, data):
    result = template
    for section in extract_sections(template):
        filled_section = fill_section(section, data)
        validate_section(filled_section)  # Immediate validation
        result = replace_section(result, section, filled_section)
    return result
```

### 4. Update Status Atomically

```python
def complete_node(node, workflow):
    # 1. Validate all done criteria
    validate_all(node)
    
    # 2. Update artifact status
    update_artifact_status(node['outputs'][0]['path'], 'complete')
    
    # 3. Update workflow node status
    update_workflow_node_status(node['id'], 'complete')
    
    # 4. Commit to git
    git_commit(f"Complete {node['name']} ({node['uuid']})")
```

### 5. Handle Errors Gracefully

```python
def execute_node_safely(node, workflow):
    try:
        execute_node(node, workflow)
    except DependencyNotMetError as e:
        log(f"Waiting for dependencies: {e}")
        return False
    except ValidationError as e:
        log(f"Validation failed: {e}")
        # Attempt to fix
        fix_validation_errors(node, e)
        return execute_node_safely(node, workflow)
    except Exception as e:
        log_error(f"Unexpected error: {e}")
        raise
```

### 6. Maintain Audit Trail

```python
def execute_with_audit(node, workflow):
    audit_log = {
        'node': node['uuid'],
        'started_at': datetime.now(),
        'agent': get_agent_name(),
        'inputs': gather_inputs(node, workflow),
        'outputs': [],
        'validation_results': []
    }
    
    try:
        result = execute_node(node, workflow)
        audit_log['outputs'] = result['outputs']
        audit_log['completed_at'] = datetime.now()
        audit_log['status'] = 'success'
    except Exception as e:
        audit_log['error'] = str(e)
        audit_log['status'] = 'failed'
    finally:
        save_audit_log(audit_log)
```

---

## Automation Scripts

### Script Execution

If a node has `automation.script` defined:

```python
def execute_automation_script(node):
    if node['automation']['script']:
        script_path = node['automation']['script']
        result = subprocess.run(
            ['bash', script_path],
            input=json.dumps(node),
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise AutomationError(f"Script failed: {result.stderr}")
        return result.stdout
```

### Agent Assignment

```python
def assign_agent(node):
    agent_name = node['automation']['agent']
    
    agent_map = {
        'product-owner-agent': ProductOwnerAgent,
        'project-manager-agent': ProjectManagerAgent,
        'solution-architect-agent': SolutionArchitectAgent,
        'development-agent': DevelopmentAgent
    }
    
    return agent_map[agent_name]()
```

---

## Workflow Execution Example

```python
def execute_workflow(workflow, start_node='PO1'):
    # Build execution graph
    execution_order = topological_sort(workflow)
    
    # Execute nodes in order
    for node_id in execution_order:
        node = workflow['nodes'][node_id]
        
        # Check if ready
        if not can_execute_node(node, workflow):
            log(f"Skipping {node_id}: dependencies not met")
            continue
        
        # Execute
        log(f"Executing {node['name']} ({node['uuid']})")
        try:
            execute_node_safely(node, workflow)
            log(f"✓ Completed {node['name']}")
        except Exception as e:
            log(f"✗ Failed {node['name']}: {e}")
            # Decide: continue or stop
            if is_critical_node(node):
                raise WorkflowExecutionError(f"Critical node failed: {node_id}")
```

---

## Reference

- **Workflow Definition**: `docs/product/workflow.yaml`
- **Templates**: `docs/product/templates/`
- **UUID Guide**: `docs/product/templates/UUID-GUIDE.md`
- **Stages Reference**: `docs/product/stages.csv`
- **Mermaid Generator**: `scripts/generate-mermaid.py`

---

## Version History

- **1.0.0** (2025-01-XX): Initial version with workflow.yaml-based system

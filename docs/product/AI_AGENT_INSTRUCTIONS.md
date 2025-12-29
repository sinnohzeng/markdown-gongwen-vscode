# AI Agent Instructions Guide

**Purpose:** Step-by-step guide for instructing AI agents to execute the workflow defined in `workflow.yaml`

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX

---

## Quick Start: Basic Instruction Template

### For a Single Node

```
You are a {ROLE} agent executing workflow node {NODE_ID} ({NODE_NAME}).

**Context:**
- Workflow: docs/product/workflow.yaml
- Node UUID: {UUID}
- Dependencies: {DEPENDENCIES}
- Template: {TEMPLATE_PATH}

**Task:**
1. Read the workflow node definition from workflow.yaml
2. Load the template from {TEMPLATE_PATH}
3. Gather context from dependency outputs: {DEPENDENCY_OUTPUTS}
4. Follow all <!-- AI_INSTRUCTION: ... --> comments in the template
5. Generate UUIDs per UUID-GUIDE.md rules
6. Fill the template with appropriate content
7. Validate against done_criteria: {DONE_CRITERIA}
8. Save the artifact to {OUTPUT_PATH}
9. Update status to 'complete' in frontmatter

**Validation:**
- Ensure all done_criteria are met
- Verify UUID format and uniqueness
- Check file exists at output path
```

### For Full Workflow Execution

```
Execute the complete workflow from workflow.yaml starting at node PO1.

**Process:**
1. Load workflow.yaml
2. Build dependency graph
3. Execute nodes in topological order
4. For each node:
   - Check dependencies are complete
   - Execute node using template
   - Validate done_criteria
   - Mark node as complete
5. Handle parallel nodes where possible
6. Report progress and any blockers

**Stop at human checkpoints:**
- ST1: Stakeholder data input needed
- PM1: Budget approval required
- REL1: UAT execution and deployment approval
```

---

## Detailed Instruction Patterns

### Pattern 1: Single Node Execution

**Use Case:** Execute one specific workflow node

**Instruction:**
```
I need you to execute workflow node PO1 (Problem Definition).

**Steps:**
1. Read docs/product/workflow.yaml and locate node PO1
2. Verify dependencies: Check that START is complete (or skip if this is the first node)
3. Load template: docs/product/templates/PO1-Problem-Definition.template.md
4. Read UUID guide: docs/product/templates/UUID-GUIDE.md
5. Extract all <!-- AI_INSTRUCTION: ... --> comments from the template
6. For each section in the template:
   - Follow the AI_INSTRUCTION
   - Respect TYPE constraints (<!-- TYPE: ... -->)
   - Generate UUIDs using format: {ARTIFACT_UUID}-{TYPE}-{SEQUENCE}
   - Fill in content
5. Validate against done_criteria:
   - PO1-Problem-Definition.md exists
   - Root cause identified and documented
   - Current state analysis complete
   - Problem boundaries defined
6. Save to: docs/product/PO1-Problem-Definition.md
7. Update frontmatter status to 'complete'

**Output:**
- Create the markdown file at the specified path
- Ensure all UUIDs are generated correctly
- Verify all required sections are filled
```

### Pattern 2: Sequential Node Chain

**Use Case:** Execute multiple nodes in sequence

**Instruction:**
```
Execute workflow nodes PO1 → ST1 → BN1 in sequence.

**For each node:**
1. Check if dependencies are satisfied
2. Load node definition from workflow.yaml
3. Load corresponding template
4. Gather context from previous node outputs
5. Execute node following template instructions
6. Validate done_criteria
7. Mark as complete
8. Proceed to next node

**Context Passing:**
- PO1 output → used as input for ST1
- ST1 output → used as input for BN1
- Cross-reference UUIDs between documents

**Stop if:**
- Dependencies not met
- Validation fails
- Human input required (ST1 needs stakeholder data)
```

### Pattern 3: Parallel Node Execution

**Use Case:** Execute independent nodes simultaneously

**Instruction:**
```
Execute parallel workflow nodes: PM1, PM2, DM1, DE1 (all depend on BH1).

**Process:**
1. Verify BH1 is complete
2. For each node (PM1, PM2, DM1, DE1):
   - Load node definition
   - Load template
   - Gather BH1 context
   - Execute independently
3. Wait for all to complete
4. Validate all done_criteria
5. Mark all as complete

**Note:** These nodes don't depend on each other, so they can run in parallel.
```

### Pattern 4: Full Workflow with Human Checkpoints

**Instruction:**
```
Execute the complete workflow from workflow.yaml with human-in-the-loop checkpoints.

**Execution Strategy:**
1. Load workflow.yaml
2. Build execution graph (topological sort)
3. Execute nodes in order:
   
   **Phase 1: Document Generation (AI Automated)**
   - PO1: Problem Definition
   - BN1: Goals & Success Criteria
   - BH1: System Behavior Model
   
   **Phase 2: Human-AI Collaboration**
   - ST1: Stakeholder Analysis → **STOP: Request stakeholder data from human**
   - PM1: Resource Planning → **STOP: Request budget approval**
   - PM2: Risk Assessment → **STOP: Request risk prioritization**
   
   **Phase 3: Architecture (AI Automated)**
   - DM1, DE1, AR1, SC1: Execute in parallel after BH1
   - RD2: Requirements Model (consolidates all above)
   
   **Phase 4: Planning (Human-AI Collaboration)**
   - RD1: Release Planning → **STOP: Request feature prioritization**
   
   **Phase 5: Development (AI Automated)**
   - DEV1: Code Generation & Testing
   
   **Phase 6: Release (Human Required)**
   - REL1: Stable Release → **STOP: Request UAT execution and deployment approval**

**At each checkpoint:**
- Pause execution
- Present current state to human
- Request required input
- Resume after human provides input

**Progress Tracking:**
- Log each completed node
- Report any validation failures
- Show dependency status
```

---

## Step-by-Step Execution Guide

### Step 1: Initialize Workflow Context

**Instruction:**
```
Load and understand the workflow structure:

1. Read docs/product/workflow.yaml
2. Parse all nodes and their dependencies
3. Build dependency graph
4. Identify execution order (topological sort)
5. Identify parallel execution opportunities
6. Load template directory: docs/product/templates/
7. Read UUID guide: docs/product/templates/UUID-GUIDE.md

**Output:**
- List of nodes in execution order
- Dependency graph visualization
- Parallel execution groups
- Human checkpoint locations
```

### Step 2: Execute a Node (Detailed Process)

**Instruction Template:**
```
Execute workflow node {NODE_ID} following this exact process:

**1. Pre-execution Checks**
- Read workflow.yaml → locate node {NODE_ID}
- Check dependencies: {DEPENDENCY_LIST}
- Verify dependency outputs exist
- Check if node already completed

**2. Load Resources**
- Load template: {TEMPLATE_PATH}
- Read template frontmatter (UUID, dependencies, status)
- Extract all <!-- AI_INSTRUCTION: ... --> comments
- Extract all <!-- TYPE: ... --> constraints
- Load dependency outputs for context

**3. Generate Content**
For each section in template:
- Read AI_INSTRUCTION comment
- Check TYPE constraints
- Generate UUID if required (format: {ARTIFACT_UUID}-{TYPE}-{SEQUENCE})
- Fill content following instructions
- Cross-reference dependency outputs where needed

**4. UUID Generation**
- Extract artifact UUID from template frontmatter: {ARTIFACT_UUID}
- For each item requiring UUID:
  - Determine TYPE code (PROB, RCA, CF, EVD, etc.)
  - Check existing UUIDs in artifact
  - Find highest sequence number for that TYPE
  - Increment by 1
  - Format: {ARTIFACT_UUID}-{TYPE}-{SEQUENCE:03d}

**5. Validation**
Check each done_criterion:
- "{FILE}.md exists" → Verify file will be created
- "{Content} identified and documented" → Verify content exists
- "{Section} complete" → Verify section is filled
- "All UUIDs generated" → Verify UUID format and uniqueness

**6. Save Artifact**
- Write to: {OUTPUT_PATH}
- Update frontmatter status to 'complete'
- Update created_date and last_updated

**7. Post-execution**
- Verify file exists
- Run validation checks
- Mark node as complete in workflow state
- Report success or any issues
```

### Step 3: Handle Dependencies

**Instruction:**
```
Before executing node {NODE_ID}, check dependencies:

**Dependency Check Process:**
1. For each dependency in node['dependencies']:
   - Find dependency node in workflow.yaml
   - Check if dependency output file exists
   - Verify dependency status is 'complete'
   - If missing, report which dependency is blocking

**If Dependencies Not Met:**
- List missing dependencies
- Suggest execution order
- Wait for dependencies to complete
- Re-check before proceeding

**If Dependencies Met:**
- Load dependency outputs
- Extract relevant context (UUIDs, decisions, data)
- Use as input for current node
- Cross-reference dependency UUIDs in current artifact
```

### Step 4: Handle Human Checkpoints

**Instruction:**
```
When reaching a human checkpoint node:

**Checkpoint Nodes:**
- ST1: Stakeholder Analysis (needs stakeholder data)
- PM1: Resource Planning (needs budget approval)
- PM2: Risk Assessment (needs risk prioritization)
- RD1: Release Planning (needs feature prioritization)
- REL1: Stable Release (needs UAT execution and deployment approval)

**Process:**
1. Execute as much as possible automatically:
   - Generate document structure
   - Fill template framework
   - Create placeholders for human input
2. Identify what human input is needed
3. Present current state to human:
   - Show generated content
   - Highlight sections needing input
   - Request specific information
4. Wait for human input
5. Integrate human input into artifact
6. Complete validation
7. Mark node as complete
8. Continue workflow

**Example for ST1:**
"Generated stakeholder analysis framework. Please provide:
- List of stakeholders with names and roles
- Power/interest classification for each
- Engagement strategy preferences"
```

---

## Practical Examples

### Example 1: Execute PO1 (Problem Definition)

```
Execute workflow node PO1 (Problem Definition).

**Context:**
- This is the first node after START
- No dependency outputs to gather
- Template: docs/product/templates/PO1-Problem-Definition.template.md
- Output: docs/product/PO1-Problem-Definition.md

**Specific Instructions:**
1. Load the PO1 template
2. Follow all AI_INSTRUCTION comments:
   - Provide clear problem statement (max 200 chars)
   - Identify primary root cause using RCA methodology
   - List contributing factors
   - Provide evidence supporting the root cause
   - Suggest high-level solution direction
3. Generate UUIDs:
   - PO1-PROB-001 (problem statement)
   - PO1-RCA-001 (root cause)
   - PO1-CF-001, PO1-CF-002 (contributing factors)
   - PO1-EVD-001, PO1-EVD-002 (evidence)
   - PO1-SOL-001 (solution direction)
4. Create current state analysis:
   - Mermaid flowchart of as-is process
   - List pain points with UUIDs (PO1-PP-001, etc.)
   - Define problem boundaries
5. Validate:
   - File exists
   - Root cause documented
   - Current state analysis complete
   - Problem boundaries defined
6. Save and mark complete
```

### Example 2: Execute DEV1 (Code Generation)

```
Execute workflow node DEV1 (Code Generation & Testing).

**Context:**
- Dependencies: RD1 (Release Planning) must be complete
- Gather: Requirements from RD2-Requirements-Model.md
- Architecture: AR1-Architecture-Model.md
- Design: DE1-Design-Model.md

**Process:**
1. Load requirements from RD2 output
2. Load architecture and design models
3. Generate code following:
   - Architecture patterns from AR1
   - Design specifications from DE1
   - Requirements from RD2
4. Write unit tests for all features
5. Write integration tests
6. Write Gherkin BDD tests (from acceptance criteria)
7. Run test script: scripts/run-tests.sh (if exists, else use npm test)
8. Validate test coverage >= threshold
9. Generate coverage report
10. Save all code to src/
11. Save tests to tests/
12. Validate done_criteria:
    - All features implemented
    - All tests passing
    - Test coverage >= threshold

**If scripts/run-tests.sh doesn't exist:**
- Run: npm test
- Run: npm run test:coverage
- Check coverage manually
```

### Example 3: Execute Full Workflow with Iteration

```
Execute the complete workflow with iteration support.

**Initial Execution:**
1. Execute nodes PO1 → ST1 → BN1 → BH1
2. Execute parallel: PM1, PM2, DM1, DE1, AR1, SC1 (after BH1)
3. Execute: RD2 → RD1 → DEV1 → REL1
4. Execute: BL1 (New Work Item)

**Iteration Loop:**
When BL1 completes, it loops back to BH1:
- Load new work item from BL1 output
- Update BH1 with new requirements
- Re-execute dependent nodes: DM1, DE1, AR1, SC1, RD2, RD1, DEV1, REL1
- Continue until no new work items

**State Management:**
- Track which nodes are complete
- Track which nodes need re-execution
- Preserve completed work where possible
- Only update nodes affected by new work item
```

---

## Agent Role Instructions

### Product Owner Agent

**Role:** Handles PO1, ST1, BN1, BH1, RD2, RD1, REL1, BL1

**Instruction:**
```
You are a Product Owner agent. Your responsibilities:
- Problem definition and root cause analysis
- Stakeholder management (with human input)
- Goal and success criteria definition
- System behavior modeling
- Requirements consolidation
- Release planning (with human input)
- Release management (with human approval)
- Backlog management

**Focus Areas:**
- Business value
- User needs
- Requirements clarity
- Stakeholder alignment
- Release scope
```

### Project Manager Agent

**Role:** Handles PM1, PM2

**Instruction:**
```
You are a Project Manager agent. Your responsibilities:
- Resource planning (team, budget, timeline)
- Risk assessment and mitigation

**Focus Areas:**
- Resource optimization
- Timeline management
- Risk identification
- Budget constraints
- Team coordination
```

### Solution Architect Agent

**Role:** Handles DM1, DE1, AR1, SC1

**Instruction:**
```
You are a Solution Architect agent. Your responsibilities:
- Data modeling
- Design modeling (UI/UX)
- System architecture
- Security architecture

**Focus Areas:**
- Technical design
- Architecture patterns
- Technology selection
- Security controls
- Scalability and performance
```

### Development Agent

**Role:** Handles DEV1

**Instruction:**
```
You are a Development agent. Your responsibilities:
- Code generation
- Test writing
- Test execution
- Coverage validation

**Focus Areas:**
- Code quality
- Test coverage
- Implementation correctness
- Following architecture and design
- Best practices
```

---

## Error Handling Instructions

### When Validation Fails

**Instruction:**
```
If validation fails for a node:

1. **Identify the failure:**
   - Which done_criterion failed?
   - What's missing or incorrect?

2. **Attempt auto-fix:**
   - If UUID format wrong → regenerate
   - If section missing → fill it
   - If content incomplete → complete it

3. **If auto-fix fails:**
   - Report specific issue
   - Show what's missing
   - Request human guidance
   - Don't proceed until fixed
```

### When Dependencies Missing

**Instruction:**
```
If dependencies are not met:

1. **List missing dependencies:**
   - Which nodes are incomplete?
   - What outputs are missing?

2. **Suggest execution order:**
   - Show dependency chain
   - Recommend which node to execute next

3. **Wait or proceed:**
   - If critical dependency → wait
   - If optional → proceed with placeholders
   - Always report status
```

### When Human Input Required

**Instruction:**
```
When human input is needed:

1. **Generate framework:**
   - Create document structure
   - Fill what you can automatically
   - Leave clear placeholders

2. **Request specific input:**
   - Be explicit about what's needed
   - Show examples if helpful
   - Indicate required vs optional

3. **Wait for input:**
   - Pause execution
   - Present current state
   - Integrate input when received
   - Continue workflow
```

---

## Validation Checklist

Before marking a node complete, verify:

- [ ] All dependencies are satisfied
- [ ] Template loaded and parsed
- [ ] All AI_INSTRUCTION comments followed
- [ ] All TYPE constraints respected
- [ ] All UUIDs generated correctly
- [ ] UUID format matches pattern
- [ ] All required sections filled
- [ ] All done_criteria met
- [ ] Output file exists
- [ ] Frontmatter status updated
- [ ] Cross-references valid
- [ ] No placeholder text remaining (unless human input needed)

---

## Quick Reference

### File Locations
- **Workflow:** `docs/product/workflow.yaml`
- **Templates:** `docs/product/templates/*.template.md`
- **UUID Guide:** `docs/product/templates/UUID-GUIDE.md`
- **Outputs:** `docs/product/{NODE_ID}-{Name}.md`

### Key Commands
```bash
# Verify workflow integrity
python3 scripts/verify-workflow.py

# Generate Mermaid diagram
python3 scripts/generate-mermaid.py > docs/product/PROCESS_WORKFLOW.md
```

### Common UUID Types
- `PROB` - Problem
- `RCA` - Root Cause
- `CF` - Contributing Factor
- `EVD` - Evidence
- `SOL` - Solution
- `PP` - Pain Point
- `STA` - Stakeholder
- `GOAL` - Goal
- `KPI` - KPI
- `UC` - Use Case
- `REQ` - Requirement
- `RISK` - Risk

---

## Example Full Workflow Execution Prompt

```
Execute the complete software development workflow from workflow.yaml.

**Execution Plan:**
1. Load workflow.yaml and understand structure
2. Build dependency graph
3. Execute nodes in topological order:
   
   **Phase 1: Problem & Planning (Sequential)**
   - PO1: Problem Definition
   - ST1: Stakeholder Analysis → [HUMAN CHECKPOINT: Request stakeholder data]
   - BN1: Goals & Success Criteria
   - BH1: System Behavior Model
   
   **Phase 2: Planning & Architecture (Parallel after BH1)**
   - PM1: Resource Planning → [HUMAN CHECKPOINT: Request budget approval]
   - PM2: Risk Assessment → [HUMAN CHECKPOINT: Request risk prioritization]
   - DM1: Data Model
   - DE1: Design Model
   - AR1: Architecture Model (after DM1)
   - SC1: Security Model (after AR1)
   
   **Phase 3: Requirements & Release (Sequential)**
   - RD2: Requirements Model (after all Phase 2)
   - RD1: Release Planning → [HUMAN CHECKPOINT: Request feature prioritization]
   
   **Phase 4: Development (Automated)**
   - DEV1: Code Generation & Testing
   
   **Phase 5: Release (Human Required)**
   - REL1: Stable Release → [HUMAN CHECKPOINT: Request UAT and deployment approval]
   
   **Phase 6: Iteration**
   - BL1: New Work Item
   - Loop back to BH1 if new work items exist

**At each node:**
- Check dependencies
- Load template
- Follow AI instructions
- Generate UUIDs
- Validate done_criteria
- Save artifact
- Mark complete

**At human checkpoints:**
- Pause execution
- Present current state
- Request input
- Resume after input received

**Progress Reporting:**
- Log each completed node
- Report any blockers
- Show dependency status
- Display execution timeline
```

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

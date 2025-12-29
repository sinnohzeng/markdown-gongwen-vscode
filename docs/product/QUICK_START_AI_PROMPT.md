# Quick Start: AI Agent Prompt Template

Copy and customize these prompts to instruct an AI agent to execute the workflow.

---

## 🚀 Execute Single Node

```
Execute workflow node {NODE_ID} from docs/product/workflow.yaml.

1. Load node definition from workflow.yaml
2. Check dependencies are complete
3. Load template: {TEMPLATE_PATH}
4. Follow all <!-- AI_INSTRUCTION: ... --> comments
5. Generate UUIDs per UUID-GUIDE.md
6. Fill template with content
7. Validate done_criteria
8. Save to: {OUTPUT_PATH}
9. Mark status 'complete'
```

**Example:**
```
Execute workflow node PO1 from docs/product/workflow.yaml.

1. Load node PO1 definition
2. Check START dependency (skip if first run)
3. Load template: docs/product/templates/PO1-Problem-Definition.template.md
4. Follow all AI_INSTRUCTION comments in template
5. Generate UUIDs: PO1-PROB-001, PO1-RCA-001, etc.
6. Fill problem definition content
7. Validate: file exists, root cause documented, current state complete
8. Save to: docs/product/PO1-Problem-Definition.md
9. Update frontmatter status to 'complete'
```

---

## 🔄 Execute Sequential Nodes

```
Execute workflow nodes {NODE1} → {NODE2} → {NODE3} in sequence.

For each node:
- Check dependencies
- Load template
- Gather context from previous node outputs
- Execute following template instructions
- Validate done_criteria
- Mark complete
- Proceed to next

Stop if validation fails or human input required.
```

**Example:**
```
Execute workflow nodes PO1 → ST1 → BN1 in sequence.

For each:
- Check dependencies met
- Load corresponding template
- Use previous node output as context
- Follow AI_INSTRUCTION comments
- Generate UUIDs correctly
- Validate done_criteria
- Save artifact
- Mark complete
```

---

## ⚡ Execute Parallel Nodes

```
Execute parallel nodes {NODE1}, {NODE2}, {NODE3} (all depend on {PARENT_NODE}).

1. Verify {PARENT_NODE} is complete
2. For each node, execute independently:
   - Load node definition
   - Load template
   - Gather {PARENT_NODE} context
   - Execute following template
3. Wait for all to complete
4. Validate all done_criteria
5. Mark all complete
```

**Example:**
```
Execute parallel nodes PM1, PM2, DM1, DE1 (all depend on BH1).

1. Verify BH1 is complete
2. Execute each independently using their templates
3. All use BH1 output as context
4. Wait for all to finish
5. Validate and mark complete
```

---

## 🎯 Execute Full Workflow

```
Execute complete workflow from docs/product/workflow.yaml.

**Process:**
1. Load workflow.yaml
2. Build dependency graph
3. Execute nodes in topological order
4. At each node:
   - Check dependencies
   - Load template
   - Follow AI_INSTRUCTION comments
   - Generate UUIDs
   - Validate done_criteria
   - Save artifact
   - Mark complete

**Human Checkpoints (pause and request input):**
- ST1: Stakeholder data
- PM1: Budget approval
- PM2: Risk prioritization
- RD1: Feature prioritization
- REL1: UAT execution and deployment approval

**Progress:**
Report each completed node and any blockers.
```

---

## 📋 Node-Specific Examples

### PO1: Problem Definition
```
Execute PO1 (Problem Definition):
- Load template: docs/product/templates/PO1-Problem-Definition.template.md
- Generate: problem statement, root cause, evidence, solution direction
- Create: current state Mermaid flowchart, pain points
- UUIDs: PO1-PROB-001, PO1-RCA-001, PO1-EVD-001, etc.
- Save: docs/product/PO1-Problem-Definition.md
```

### DEV1: Code Generation
```
Execute DEV1 (Code Generation & Testing):
- Dependencies: RD1 must be complete
- Load: requirements from RD2, architecture from AR1, design from DE1
- Generate: code in src/, tests in tests/
- Run: npm test && npm run test:coverage
- Validate: all tests pass, coverage >= threshold
- Save: code and test files
```

### REL1: Stable Release
```
Execute REL1 (Stable Release):
- Prepare: release artifacts (package extension)
- Generate: UAT report template
- [HUMAN CHECKPOINT] Request: UAT execution results
- [HUMAN CHECKPOINT] Request: deployment approval
- Execute: deployment script (if approved)
- Save: UAT report, release artifacts
```

---

## 🔧 Customization Tips

### Add Context
```
Execute PO1 with this context:
- Problem domain: {DOMAIN}
- Current pain points: {PAIN_POINTS}
- Target users: {USERS}
```

### Skip Human Checkpoints (for testing)
```
Execute full workflow, but for human checkpoint nodes:
- Generate framework
- Use placeholder data
- Mark as "requires human review"
- Continue workflow
```

### Focus on Specific Phase
```
Execute only Phase 2 (Planning & Architecture):
- Start after BH1 completes
- Execute: PM1, PM2, DM1, DE1, AR1, SC1
- Stop before RD2
```

---

## ✅ Validation Checklist

Before marking any node complete, verify:
- [ ] Dependencies satisfied
- [ ] Template loaded
- [ ] AI_INSTRUCTION comments followed
- [ ] UUIDs generated correctly
- [ ] All sections filled
- [ ] done_criteria met
- [ ] Output file exists
- [ ] Status updated to 'complete'

---

## 🆘 Troubleshooting

### "Dependencies not met"
```
Check which dependency nodes are incomplete:
- List missing dependency outputs
- Suggest execution order
- Wait for dependencies or proceed with placeholders
```

### "Validation failed"
```
Identify which done_criterion failed:
- Check file existence
- Verify content completeness
- Regenerate UUIDs if format wrong
- Request human help if needed
```

### "Template not found"
```
Verify template path:
- Check docs/product/templates/
- Ensure template name matches node UUID
- Verify file exists
```

---

**Quick Reference:**
- Workflow: `docs/product/workflow.yaml`
- Templates: `docs/product/templates/*.template.md`
- UUID Guide: `docs/product/templates/UUID-GUIDE.md`
- Full Guide: `docs/product/AI_AGENT_INSTRUCTIONS.md`

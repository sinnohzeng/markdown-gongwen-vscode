# Example AI Agent Conversation

This document shows a real example of how to instruct an AI agent to execute the workflow.

---

## Example 1: Starting the Workflow

**You (Human):**
```
I want to start executing the software development workflow. 
Please begin with node PO1 (Problem Definition).

The context is: We're building a VS Code extension for inline Markdown editing 
that hides syntax markers while maintaining file compatibility.

Execute PO1 following the workflow defined in docs/product/workflow.yaml.
```

**AI Agent Response:**
```
I'll execute workflow node PO1 (Problem Definition).

**Step 1: Loading workflow definition**
- Found PO1 in docs/product/workflow.yaml
- Dependencies: ["START"] (no blocking dependencies)
- Template: docs/product/templates/PO1-Problem-Definition.template.md
- Output: docs/product/PO1-Problem-Definition.md

**Step 2: Loading template**
- Template loaded successfully
- Found AI_INSTRUCTION comments for:
  - Problem statement
  - Root cause analysis
  - Evidence collection
  - Solution direction
  - Current state analysis

**Step 3: Generating content**

Based on your context about the VS Code Markdown extension, I'll generate:

**Problem Statement (PO1-PROB-001):**
Users experience cognitive burden when editing Markdown files due to visual clutter from syntax markers like `**bold**`, `*italic*`, `[links](url)`.

**Root Cause (PO1-RCA-001):**
Cognitive load mismatch between user's mental model (formatted content) and Markdown's syntax-based design.

**Evidence:**
- PO1-EVD-001: User feedback indicates 20-30% mental effort spent parsing syntax
- PO1-EVD-002: Similar extensions (Markless) show high user demand for this feature

**Solution Direction (PO1-SOL-001):**
Implement inline formatting visualization that hides syntax markers while maintaining standard Markdown file compatibility.

**Current State Analysis:**
[Mermaid flowchart showing current editing process with syntax markers visible]

**Step 4: Generating UUIDs**
- PO1-PROB-001 ✓
- PO1-RCA-001 ✓
- PO1-EVD-001, PO1-EVD-002 ✓
- PO1-SOL-001 ✓
- PO1-PP-001, PO1-PP-002 (pain points) ✓

**Step 5: Validation**
- ✓ File will be created at docs/product/PO1-Problem-Definition.md
- ✓ Root cause identified and documented
- ✓ Current state analysis complete (Mermaid diagram included)
- ✓ Problem boundaries defined

**Step 6: Saving artifact**
- Created: docs/product/PO1-Problem-Definition.md
- Updated frontmatter status to 'complete'
- Updated created_date: 2025-01-XX

✅ **PO1 Complete!** Ready to proceed to ST1 (Stakeholder Analysis).
```

---

## Example 2: Human Checkpoint

**You (Human):**
```
Continue to ST1 (Stakeholder Analysis). I'll provide stakeholder data as needed.
```

**AI Agent Response:**
```
Executing ST1 (Stakeholder Analysis).

**Step 1: Checking dependencies**
- ✓ PO1 is complete
- ✓ PO1-Problem-Definition.md exists

**Step 2: Loading template**
- Template: docs/product/templates/ST1-Stakeholder-Analysis.template.md
- Found sections for: stakeholder matrix, personas, RBAC roles

**Step 3: Generating framework**

I've created the stakeholder analysis structure. However, ST1 requires real stakeholder data.

**Generated Framework:**
- Stakeholder identification matrix structure ✓
- Power/interest classification framework ✓
- Engagement strategy template ✓
- User persona template ✓
- RBAC role mapping structure ✓

**⚠️ HUMAN CHECKPOINT: Stakeholder Data Required**

Please provide:
1. **Stakeholder List:**
   - Names and roles
   - Power/interest classification (High/Medium/Low)
   - Engagement preferences

2. **User Personas:**
   - Primary user types
   - Goals and pain points
   - Usage patterns

3. **RBAC Roles:**
   - User roles in the system
   - Permissions per role

**Current State:**
I've created docs/product/ST1-Stakeholder-Analysis.md with the framework.
Please fill in the stakeholder data, or I can proceed with placeholder data for now.

**Options:**
- A) Provide stakeholder data now (I'll integrate it)
- B) Use placeholder data and continue (you can update later)
- C) Pause here until you have stakeholder data
```

**You (Human):**
```
Here's the stakeholder data:

Stakeholders:
1. Markdown Writers (High Power, High Interest) - Primary users
2. VS Code Extension Team (High Power, Medium Interest) - Maintainers
3. Open Source Community (Medium Power, High Interest) - Contributors

User Personas:
- Technical Writer: Writes documentation, needs clean editing experience
- Developer: Writes README files, wants distraction-free editing
- Content Creator: Writes blog posts, needs visual feedback

RBAC: Not applicable for this extension (single-user tool)

Please integrate this and complete ST1.
```

**AI Agent Response:**
```
Integrating stakeholder data into ST1...

**Step 4: Filling stakeholder data**
- ✓ Added 3 stakeholders with power/interest classification
- ✓ Created 3 user personas with goals and pain points
- ✓ Noted RBAC not applicable (single-user extension)

**Step 5: Generating UUIDs**
- ST1-STA-001: Markdown Writers
- ST1-STA-002: VS Code Extension Team
- ST1-STA-003: Open Source Community
- ST1-PER-001: Technical Writer persona
- ST1-PER-002: Developer persona
- ST1-PER-003: Content Creator persona

**Step 6: Validation**
- ✓ ST1-Stakeholder-Analysis.md exists
- ✓ Power/interest matrix documented
- ✓ User personas defined (3 personas)
- ✓ RBAC roles mapped (not applicable noted)
- ✓ All stakeholders mapped

**Step 7: Saving and marking complete**
- Updated: docs/product/ST1-Stakeholder-Analysis.md
- Status: complete
- Last updated: 2025-01-XX

✅ **ST1 Complete!** Ready to proceed to BN1 (Goals & Success Criteria).
```

---

## Example 3: Parallel Execution

**You (Human):**
```
After BH1 completes, execute the parallel nodes: PM1, PM2, DM1, DE1, AR1, SC1.
```

**AI Agent Response:**
```
Executing parallel nodes after BH1 completion.

**Verification:**
- ✓ BH1 (System Behavior Model) is complete
- ✓ BH1-System-Behavior-Model.md exists

**Parallel Execution Plan:**
- PM1: Resource Planning
- PM2: Risk Assessment
- DM1: Data Model
- DE1: Design Model
- AR1: Architecture Model (depends on DM1)
- SC1: Security Model (depends on AR1)

**Execution Strategy:**
1. Execute PM1, PM2, DM1, DE1 in parallel (no dependencies between them)
2. After DM1 completes → Execute AR1
3. After AR1 completes → Execute SC1

**Starting parallel batch 1: PM1, PM2, DM1, DE1**

---

**PM1: Resource Planning**
- Template loaded
- Generating resource allocation matrix
- ⚠️ HUMAN CHECKPOINT: Budget approval needed
- Created framework, awaiting budget input

**PM2: Risk Assessment**
- Template loaded
- Generating risk register
- ⚠️ HUMAN CHECKPOINT: Risk prioritization needed
- Created framework with common risks, awaiting prioritization

**DM1: Data Model**
- Template loaded
- Analyzing system behavior model for data requirements
- Generating data dictionary
- Creating ERD (Mermaid diagram)
- ✓ Complete: docs/product/DM1-Data-Model.md

**DE1: Design Model**
- Template loaded
- Creating user task flows (Mermaid diagrams)
- Generating UI/UX specifications
- ✓ Complete: docs/product/DE1-Design-Model.md

---

**Batch 1 Status:**
- ✓ DM1: Complete
- ✓ DE1: Complete
- ⏸️ PM1: Waiting for budget approval
- ⏸️ PM2: Waiting for risk prioritization

**Proceeding with AR1 (depends on DM1)...**

**AR1: Architecture Model**
- Template loaded
- Using DM1 data model as input
- Generating system architecture (Mermaid component diagram)
- Selecting technology stack (TypeScript, VS Code API, remark)
- Documenting design patterns
- ✓ Complete: docs/product/AR1-Architecture-Model.md

**Proceeding with SC1 (depends on AR1)...**

**SC1: Security Model**
- Template loaded
- Using AR1 architecture as input
- Generating security requirements
- Creating threat model
- Documenting security architecture
- ✓ Complete: docs/product/SC1-Security-Model.md

---

**Final Status:**
- ✓ DM1: Complete
- ✓ DE1: Complete
- ✓ AR1: Complete
- ✓ SC1: Complete
- ⏸️ PM1: Awaiting budget approval
- ⏸️ PM2: Awaiting risk prioritization

**Next Steps:**
- Provide budget for PM1
- Prioritize risks for PM2
- Then proceed to RD2 (Requirements Model) which consolidates all outputs
```

---

## Example 4: Code Generation

**You (Human):**
```
Execute DEV1 (Code Generation & Testing). All dependencies are complete.
```

**AI Agent Response:**
```
Executing DEV1 (Code Generation & Testing).

**Step 1: Checking dependencies**
- ✓ RD1 (Release Planning) complete
- ✓ RD2 (Requirements Model) exists
- ✓ AR1 (Architecture Model) exists
- ✓ DE1 (Design Model) exists

**Step 2: Loading requirements**
- Loaded: docs/product/RD2-Requirements-Model.md
- Extracted functional requirements
- Extracted non-functional requirements
- Loaded Gherkin acceptance criteria

**Step 3: Loading architecture and design**
- Architecture: TypeScript, VS Code API, remark parser
- Design: Inline formatting visualization, decoration system
- Patterns: Decorator pattern for markdown elements

**Step 4: Generating code**

**Creating source files:**
- `src/extension.ts` - Extension entry point
- `src/parser.ts` - Markdown parser
- `src/decorator.ts` - Decoration manager
- `src/decorations.ts` - Decoration types
- `src/link-provider.ts` - Link provider

**Step 5: Writing tests**

**Unit tests:**
- `src/parser/__tests__/parser.test.ts`
- `src/parser/__tests__/parser-bold.test.ts`
- `src/parser/__tests__/parser-italic.test.ts`
- `src/decorator/__tests__/decorator.test.ts`

**Integration tests:**
- `src/test/integration.test.ts`

**BDD tests (Gherkin):**
- `tests/features/inline-formatting.feature`
- `tests/features/syntax-hiding.feature`

**Step 6: Running tests**

```bash
$ npm test
✓ All tests passing (45 tests)
✓ Coverage: 87%

$ npm run test:coverage
✓ Coverage report generated
```

**Step 7: Validation**
- ✓ All features implemented
- ✓ All tests passing (unit, integration, BDD)
- ✓ Test coverage: 87% (>= threshold)

**Step 8: Saving artifacts**
- ✓ Code saved to src/
- ✓ Tests saved to tests/
- ✓ Coverage report: coverage/lcov.info

✅ **DEV1 Complete!** Ready to proceed to REL1 (Stable Release).
```

---

## Example 5: Release with Human Approval

**You (Human):**
```
Execute REL1 (Stable Release). I've completed UAT - all tests passed. Approve deployment.
```

**AI Agent Response:**
```
Executing REL1 (Stable Release).

**Step 1: Checking dependencies**
- ✓ DEV1 complete
- ✓ All code and tests in place

**Step 2: Preparing release artifacts**
- Running: npm run package
- ✓ Created: markdown-inline-editor-vscode-1.1.0.vsix

**Step 3: Generating UAT report**
- Template: docs/product/RELEASE-UAT-Report.md
- Status: UAT passed (per your input)
- Test results: All user acceptance tests passed
- ✓ Saved: docs/product/RELEASE-UAT-Report.md

**Step 4: Deployment approval**
- ✓ UAT passed
- ✓ Release artifacts prepared
- ✓ Deployment approved (per your input)

**Step 5: Executing deployment**
- Script: scripts/deploy.sh
- ⚠️ Script not found, using manual deployment steps
- Would execute: VS Code Marketplace publish
- Would execute: OpenVSX publish

**Step 6: Validation**
- ✓ UAT passed
- ✓ Release artifacts prepared (dist/*.vsix)
- ✓ Deployment process initiated

✅ **REL1 Complete!** Extension is ready for release.

**Next:** BL1 (New Work Item) - document any new features or issues for next iteration.
```

---

## Tips for Effective AI Instructions

### ✅ Good Instructions
- **Specific:** "Execute PO1 following workflow.yaml"
- **Context-rich:** Provide domain context and constraints
- **Clear checkpoints:** "Stop at ST1 for stakeholder data"
- **Validation-focused:** "Verify all done_criteria before proceeding"

### ❌ Poor Instructions
- **Vague:** "Do the workflow"
- **Missing context:** No domain or problem information
- **No checkpoints:** Doesn't indicate where human input is needed
- **No validation:** Doesn't mention checking done_criteria

### Best Practices
1. **Start with context:** Provide problem domain, users, constraints
2. **Specify node:** Always mention which node(s) to execute
3. **Reference workflow:** Point to workflow.yaml for structure
4. **Request validation:** Ask AI to verify done_criteria
5. **Handle checkpoints:** Be ready to provide human input when requested
6. **Review output:** Check generated artifacts before proceeding

---

**See Also:**
- `QUICK_START_AI_PROMPT.md` - Copy-paste prompt templates
- `AI_AGENT_INSTRUCTIONS.md` - Detailed instruction guide
- `AI_WORKFLOW_ANALYSIS.md` - Workflow compatibility analysis

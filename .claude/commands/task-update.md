---
allowed-tools: "Bash(gh issue list:*)", "Bash(gh issue view:*)", "Read", "Edit", "MultiEdit"
description: Synchronize GitHub issues with MVP_TASK_MANAGER.md, validate against spec, and update README.md progress
---

You should:

1. **Check GitHub Issues**
   - Run `gh issue list --limit 100` to get all open issues
   - Run `gh issue list --state closed --limit 100` to get recently closed issues
   - Note which tasks are open, closed, or in progress based on issue status and labels

2. **Validate Against Development Spec**
   - Read `specs/trouble-game-development-spec.md` file
   - Cross-reference tasks with Development Phases (Week 1-8):
     - Phase 1: Foundation (Week 1-2)
     - Phase 2: Core Mechanics (Week 3-4)
     - Phase 3: Special Features (Week 5)
     - Phase 4: Polish (Week 6-7)
     - Phase 5: Testing & Optimization (Week 8)
   - Check task alignment with:
     - Technical architecture (lines 69-125)
     - MVP scope requirements (lines 13-45)
     - Dependencies listed (lines 175-194)
     - Performance requirements (lines 263-279)
   - Identify any inconsistencies between issues and spec

3. **Update MVP_TASK_MANAGER.md**
   - Read the current MVP_TASK_MANAGER.md file
   - Update task checkboxes based on GitHub issue states:
     - Closed issues → Mark as ✅ completed
     - Open issues with "in-progress" label → Keep as [ ] but note in comments
     - New issues not in the list → Add them to appropriate phase
   - Verify tasks align with spec phases before updating
   - Flag any tasks that don't match spec requirements
   - Update the Progress Tracking section:
     - Count completed tasks per phase
     - Calculate overall completion percentage
     - Update phase completion status
   - Update the Completed Tasks Log at the bottom with newly completed items
   - Add completion dates where applicable

4. **Update README.md Development Status**
   - Read the current README.md file
   - Update the "Development Status" section (around line 138-175):
     - Update phase completion percentages
     - Move completed items from "In Progress" to completed with ✅
     - Add new pending items with [ ]
     - Update the current phase status
   - Keep the status concise and high-level (don't list every task)

5. **Consistency Validation**
   - Task numbers (#1, #2, etc.) should match between GitHub issues and MVP_TASK_MANAGER.md
   - Phase groupings should align with spec Development Phases
   - Validate technical implementation matches spec architecture
   - Check that completed tasks meet spec success criteria
   - Ensure dependencies match spec requirements
   - Don't remove completed tasks, only mark them as done
   - Preserve all task descriptions and sub-items

6. **Report Summary**
   - After updates, provide a comprehensive summary of:
     - How many tasks were updated
     - Current overall progress (X/45 tasks)
     - Which phase is currently active per spec timeline
     - Spec compliance status:
       - Tasks aligned with spec phases
       - Any deviations from spec architecture
       - Missing spec requirements not covered by tasks
       - Tasks that exceed spec MVP scope
     - Any issues that need attention:
       - Inconsistencies between spec and implementation
       - Missing critical spec requirements
       - Timeline misalignments

Important guidelines:
- Preserve all existing task details and formatting
- Only update completion status and progress tracking
- Don't renumber tasks or change their descriptions
- Keep the original task hierarchy and phases intact
- If a GitHub issue doesn't match a task number or spec, investigate before adding
- Flag any implementation that deviates from spec technical architecture
- Ensure all MVP features from spec are covered by tasks

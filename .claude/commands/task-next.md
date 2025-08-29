---
allowed-tools: "Bash(gh issue create:*)", "Bash(gh issue list:*)", "Bash(gh label create:*)", "Bash(git checkout:*)", "Bash(git status)", "Bash(git log:*)", "Bash(git push:*)", "Bash(git commit:*)", "Read", "Edit", "MultiEdit"
description: Find the next available task, create GitHub issue, create feature branch, and initialize development workflow
---

You should:

1. **Find Next Available Task**
   - Read `MVP_TASK_MANAGER.md` to identify the next uncompleted task
   - Locate the first task with `[ ]` checkbox (incomplete) in sequential order (#1, #2, #3...)
   - Read the task details including:
     - Task number and title
     - Full task description and sub-items
     - Phase classification (Foundation, Core Mechanics, etc.)
     - Dependencies or prerequisites

2. **Validate Task Readiness**
   - Check if all prerequisite tasks are completed (marked with ✅)
   - Verify the task aligns with current development phase
   - Ensure no blocking dependencies exist
   - Confirm the task is within scope of current capabilities

3. **Check for Existing GitHub Issue**
   - **FIRST**: Run `gh issue list --search "Task #${number}:" --state all` to check if issue already exists
   - **IF ISSUE EXISTS**: Report to user that issue already exists with URL and STOP the flow
   - **IF NO ISSUE**: Proceed with creation

4. **Create GitHub Issue** (Only if issue doesn't exist)
   - Run `gh issue create` with the following format:
     - **Title**: "Task #{number}: {task title}"
     - **Body**: Include:
       - Full task description from MVP_TASK_MANAGER.md
       - All sub-items as checklist
       - Phase information (e.g., "Phase 2: Core Mechanics")
       - Dependencies (if any)
       - Acceptance criteria
       - Link to MVP_TASK_MANAGER.md for context
   - Add appropriate labels:
     - Phase label: `phase-1-foundation`, `phase-2-core`, `phase-3-features`, `phase-4-polish`, `phase-5-testing`
     - Priority label: `high-priority`, `medium-priority`, `low-priority` (based on phase)
     - Type label: `enhancement`, `feature`, `bug`, `refactor`
     - Status label: `ready-for-development`

5. **Check for Existing Feature Branch**
   - **FIRST**: Run `git branch -a | grep "task-${number}-"` to check if branch already exists
   - **IF BRANCH EXISTS**: Report to user that branch already exists and STOP the flow
   - **IF NO BRANCH**: Proceed with creation

6. **Create Feature Branch** (Only if branch doesn't exist)
   - Ensure we're on main branch: `git checkout main`
   - Create descriptive branch name following pattern: `task-{number}-{kebab-case-description}`
   - Examples:
     - `task-21-basic-turn-switching`
     - `task-24-double-trouble-spaces`
     - `task-38-sound-effects-system`
   - Run `git checkout -b {branch-name}`
   - Make initial commit: `git commit --allow-empty -m "Initialize task #{number}: {task title}"`
   - Push branch and set upstream: `git push -u origin {branch-name}`

7. **Report and Request Permission**
   - Provide a clear summary of what was prepared:
     - Task number and title
     - GitHub issue URL
     - Branch name created
   - Ask user for explicit permission to proceed with implementation
   - Wait for user confirmation before starting any development work

8. **Begin Task Implementation** (Only if user approves)
   - If user says YES/confirms:
     - Start implementing the task according to its requirements
     - Follow the sub-items as a checklist
     - Update progress in the GitHub issue if needed
     - Follow coding standards from CODING_STYLE.md
     <!-- - Commit changes incrementally with descriptive messages -->

Important guidelines:
- Never skip tasks - always take the next sequential incomplete task
- Don't create issues for tasks that are already completed (✅)
- **CRITICAL**: Always check for existing issues and branches BEFORE attempting to create them
- **IF ISSUE/BRANCH EXISTS**: Report to user and STOP the flow - do not proceed
- Don't proceed with implementation without explicit user permission
- Ensure branch names are descriptive and follow kebab-case
- Keep issue descriptions comprehensive but concise
- Always check git status before creating branches
- Validate that the task is actually ready to be worked on
- If no tasks are available, inform the user that all tasks are complete
- If a task has dependencies that aren't met, explain what needs to be completed first
- Do not commit or push any code until user approval is given

Error handling:
- If MVP_TASK_MANAGER.md is not found, report the error
- If all tasks are completed, congratulate and suggest next steps
- **IF ISSUE ALREADY EXISTS**: Report existing issue URL and STOP - do not create duplicate, do not provide task details
- **IF BRANCH ALREADY EXISTS**: Report existing branch name and STOP - do not create duplicate, do not provide task details
- If GitHub issue creation fails, report the error and don't proceed
- If branch creation fails, report the error and clean up if needed
- If task has unmet dependencies, list what needs to be completed first

**Important**: When issues or branches already exist, only report their existence. Do not provide detailed task information as this creates confusion about whether work should proceed.

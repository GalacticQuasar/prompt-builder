# Prompt Builder V3

A progressive web app for building, versioning, and managing LLM prompts. Organize your prompts into projects with iterative versions, drag-and-drop sections, lock content from accidental edits, estimate token counts, and one-click copy. All stored locally in your browser.

Built with React 19, Vite 8, Tailwind CSS 4, DaisyUI 5, and IndexedDB.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The app works fully offline after first load (PWA).

```bash
npm run build    # production build → dist/
npm run preview  # preview production build
npm run lint     # eslint
```

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 19 | UI rendering |
| Build | Vite 8 | Dev server, HMR, bundling |
| Styling | Tailwind CSS 4 + DaisyUI 5 | Utility classes + component library (`dim` theme) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities | Section reordering |
| Persistence | IndexedDB via `idb` | Projects and prompts |
| PWA | vite-plugin-pwa | Offline support, add-to-homescreen |
| Token Estimation | `length / 4` heuristic | Quick token count approximation |

### Data Model

```
Project
├── id: string (generateId())
├── name: string
├── createdAt: ISO date
├── updatedAt: ISO date (auto-updated on any change)
└── prompts: Prompt[]

Prompt (a version/iteration within a project)
├── id: string
├── label: string (auto: "v1", "v2"... editable)
├── sections: Section[]
└── createdAt: ISO date

Section (a single text block within a prompt)
├── id: string
├── label: string ("System Prompt", "Context", etc.)
├── content: string
└── locked: boolean

Sections are stored in display order; drag-and-drop reorders the array.
```

### File Structure

```
src/
├── App.jsx                    # Root: ProjectProvider → AppInner → Drawer layout
├── main.jsx                   # React 19 entry point
├── index.css                  # Tailwind 4 + DaisyUI 5 (dim theme) imports
│
├── context/
│   └── ProjectContext.jsx      # All app state (useReducer), actions, side effects
│
├── db/
│   └── index.js               # IndexedDB init, CRUD, normalizeProject
│
├── utils/
│   ├── helpers.js              # generateId, formatRelativeDate, getNextVersionLabel, truncateText
│   ├── tokenizer.js            # estimateTokens (char/4 heuristic), formatTokenCount
│   ├── clipboard.js            # copyAllSections (plain or labeled mode), toTagName
│   ├── backup.js               # downloadBackup, parseBackup (JSON export/import)
│   └── templates.js            # 4 built-in templates, getBuiltInTemplates(), createProjectFromTemplate()
│
├── hooks/
│   ├── useAutoSave.js          # Debounced 300ms save; flushes on tab hide / page unload
│   ├── useConfirmSectionDelete.js # Shared "confirm section deletes" preference (localStorage)
│   ├── useImportBackup.js      # File picker + status for importing a backup
│   └── useKeyboardShortcuts.js # Arrow keys for version nav
│
└── components/
    ├── ProjectSidebar.jsx      # Left drawer: project list, templates, backup, settings
    ├── ProjectList.jsx         # Sorted project cards with right-click context menu
    ├── TemplatePanel.jsx       # Built-in templates that create new projects
    ├── EmptyState.jsx          # Welcome screen: feature highlights, template quick-start, import
    ├── PromptEditor.jsx        # Main editing area: tabs + sections + DnD + copy (and copy shortcut)
    ├── PromptTabs.jsx          # Version tabs with right-click context menu
    ├── Section.jsx             # Collapsible/lockable text block with label editing
    ├── AddSection.jsx          # "+ Add Section" button
    ├── TokenCounter.jsx        # Total tokens badge, per-section breakdown popover
    ├── ContextMenu.jsx         # Shared right-click context menu (rename/delete)
    └── ConfirmModal.jsx        # DaisyUI dialog modal for delete confirmations (optional "Don't ask again")
```

---

## Features

### Projects & Sidebar

- Left sidebar (DaisyUI Drawer) lists all projects sorted by most recently updated
- **New Project** button creates a project with one prompt v1 containing a single "System Prompt" section
- **Right-click** a project card for a context menu with **Rename** and **Delete** options
- **Click** the project title in the navbar header to rename inline
- Delete requires confirmation via a DaisyUI modal dialog
- Below the project list: the collapsible **Templates** panel, **Backup** (Export / Import), and a **Confirm section deletes** toggle
- On mobile (≤768px) the drawer expands to full viewport width

### Prompt Versions (Iterations)

- Each project contains multiple prompt **versions** (v1, v2, v3...)
- Tabs across the top of the editor show all versions for the active project
- Navigate between versions with **← / → arrow keys** (see [Keyboard Shortcuts](#keyboard-shortcuts))
- Labels auto-increment ("v1" → "v2") but are **editable via right-click context menu**
- **Duplicate** button (+) clones all sections into a new version
- **Right-click** a tab for a context menu with **Rename** and **Delete** options (delete requires >1 version, no confirmation)
- **Copy All** button (or **Cmd/Ctrl+Shift+C**) copies all non-empty sections of the current version with a choice of aggregation mode:
  - **Plain** - sections joined by `\n\n` (default)
  - **Labeled** - each section wrapped in XML-style tags derived from its label: lowercased, non-alphanumeric runs become `_`, and a `section_` prefix is added if needed (`System Prompt` → `<system_prompt>`, `1. Examples` → `<section_1_examples>`, empty → `<section>`)
- The button briefly shows **Copied!** (or **Copy failed** in red) as feedback
- The copy mode persists across sessions via `localStorage`

### Sections

- Each prompt version contains ordered **sections** (System Prompt, Context, Instructions, etc.)
- **Add Section** button at the bottom creates a new section with an auto-incremented label
- Each section has:
  - **Editable label** - click the label text to rename (Enter or click away to save, Escape to cancel; an empty label keeps the previous one)
  - **Lock toggle** (🔒/🔓) - makes the textarea `readonly` and blocks renaming and deleting the section until unlocked
  - **Collapse toggle** - shown for content over 4 lines; collapsed sections show the first 2 lines → `···` → last 2 lines (line breaks preserved). Click the preview to expand.
  - **Delete** button (×) - asks for confirmation if the section has content. The dialog has a **Don't ask again** checkbox; turn confirmations back on with the **Confirm section deletes** toggle in the sidebar
  - **Line count + token estimate** shown next to the label
- **Drag-and-drop reordering** within a version via @dnd-kit, using the grip on the left. Works with the mouse or the keyboard (Tab to the grip, Space to pick up, ↑/↓ to move, Space to drop, Escape to cancel)

### Token Counter

- Header shows estimated token count for the active version using a `length / 4` heuristic
- Click the badge to see a per-section breakdown; click outside it or press Escape to close
- Token estimates are approximate (1 token ≈ 4 characters)

### Templates

- 4 built-in templates: General Assistant, Code Helper, Creative Writing, Data Analyzer
- Clicking a template creates a new project pre-populated with labeled sections and starter content
- Templates panel is collapsible in the sidebar

### Empty State

- When no project is active, an `EmptyState` component displays a welcome screen
- Shows a grid of 6 feature cards (Versions, Sections, Drag & Drop, Copy Modes, Token Count, Lock Sections)
- Includes quick-start buttons for each built-in template and a "New Blank Project" button
- An "Import a backup" link restores projects from an exported file (e.g. on a new browser)

### Backup (Export / Import)

- **Export** (sidebar → Backup) downloads every project as `prompt-builder-backup-YYYY-MM-DD.json`:
  `{ "format": "prompt-builder-backup", "version": 1, "exportedAt": "...", "projects": [...] }`
- **Import** adds the file's projects alongside existing ones; it never overwrites. A project whose `id` already exists is added as a copy named "… (imported)" with fresh ids
- Files are validated before anything is saved; invalid, damaged, or newer-version backups are rejected with a message
- On startup the app calls `navigator.storage.persist()` so the browser is less likely to evict IndexedDB data

### Auto-Save

- Every state change triggers a **300ms debounced save** to IndexedDB via the `useAutoSave` hook
- Components dispatch reducer actions; the hook marks the active project as having unsaved changes, and when the timer fires it saves every such project from the latest state. Switching projects mid-debounce no longer drops the previous project's edits, and projects deleted in the meantime are skipped
- Pending saves are flushed immediately when the tab is hidden (`visibilitychange`), on `pagehide`, and when the hook unmounts. The `pagehide` write is best-effort, since the browser doesn't guarantee it completes
- Some context functions write to IndexedDB directly for immediate persistence: `createNewProject`, `createProjectFromTemplate`, `renameProject` and `importProjects` call `saveProject`; `deleteProjectById` deletes the record
- No manual save button needed

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `←` / `→` | Navigate between prompt versions |
| `Cmd+Shift+C` (Mac) / `Ctrl+Shift+C` | Copy all sections using the current copy mode |
| `Escape` | Leave the focused textarea; cancel a rename; close menus, popovers and dialogs |
| `Space`, `↑` / `↓`, `Space` | Reorder a section from its focused drag grip (Escape cancels) |

The arrow keys are ignored when a modifier is held (so `Alt+←` still goes back), while typing in an input, textarea, select or editable element, while a section's drag grip is focused, and while a dialog is open. In Chrome and Edge, `Ctrl/Cmd+Shift+C` is also the DevTools inspect shortcut and may be taken by the browser.

### PWA

- `vite-plugin-pwa` with `registerType: autoUpdate`
- Service worker caches app shell and static assets
- All data is local (IndexedDB), so the app works fully offline
- Add to Home Screen manifest is configured

---

## State Management

All state lives in `ProjectContext.jsx` via `useReducer`. Components dispatch actions; the `useAutoSave` hook handles persistence. Context functions that need immediate saves call `saveProject` directly.

### Reducer Actions

| Action | Payload | Notes |
|---|---|---|
| `INIT` | `{ db, projects, activeProjectId }` | Bootstrap from IndexedDB |
| `SET_ACTIVE_PROJECT` | `projectId` | Resets `activePromptIndex` to 0 |
| `SET_ACTIVE_PROMPT_INDEX` | `index` | |
| `SET_PROJECTS` | `projects[]` | Bulk replace projects list |
| `ADD_PROJECT` | `project` object | |
| `IMPORT_PROJECTS` | `projects[]` | Prepends imported projects; selects the first if none is active |
| `DELETE_PROJECT` | `projectId` | |
| `UPDATE_PROJECT` | full project object | Used for rename |
| `ADD_PROMPT` | `{ projectId, prompt }` | |
| `UPDATE_PROMPT` | `{ projectId, promptId, updates }` | |
| `DELETE_PROMPT` | `{ projectId, promptId }` | Conditionally adjusts `activePromptIndex` |
| `ADD_SECTION` | `{ projectId, promptId, section }` | |
| `UPDATE_SECTION` | `{ projectId, promptId, sectionId, updates }` | |
| `DELETE_SECTION` | `{ projectId, promptId, sectionId }` | |
| `REORDER_SECTIONS` | `{ projectId, promptId, sections }` | Sections array in the new order |

### Exposed Context Methods

Available via `useProject()` hook:

| Method | Description |
|---|---|
| `state` | Raw reducer state object |
| `dispatch` | Dispatch reducer actions directly |
| `createNewProject(name?)` | Create project with v1 + default section |
| `createProjectFromTemplate(template)` | Create project from template object |
| `duplicateCurrentPrompt()` | Clone current version into new version |
| `deletePromptById(promptId)` | Delete a prompt version by explicit ID |
| `importProjects(projects)` | Save parsed backup projects and add them to state |
| `deleteProjectById(id)` | Delete a project |
| `renameProject(id, name)` | Rename a project |
| `getActiveProject()` | Returns currently selected project object |
| `getActivePrompt()` | Returns currently selected prompt version object |

---

## IndexedDB Schema

Database: `PromptBuilderDB`, version 1

| Object Store | Key Path | Indexes | Description |
|---|---|---|---|
| `projects` | `id` | `updatedAt` | All project data including nested prompts/sections |

The `projects` store holds the entire project tree (project → prompts → sections) as a single document. There is no normalization - each project is a self-contained record.

---

## Known Limitations & TODO

- **No undo/redo** - state changes are immediate with no history stack
- **No user-created templates** - `TemplatePanel` shows built-in templates but "Save as Template" is not implemented
- **No section content search** - no way to search across sections/projects
- **Collapse state doesn't persist** - whether a section is collapsed is UI-only state, not saved to IndexedDB
- **`useAutoSave` over-broad dependency** - watches entire `state.projects` array; could be narrowed to watch only the active project
- **Action type strings are bare strings** - reducer action types like `'ADD_SECTION'` could be extracted to constants for typo-safety
- **No React error boundary** - any component crash whitescreens the entire app

---

## Development Notes

### Adding a New Reducer Action

1. Add the case to the `reducer` function in `ProjectContext.jsx`
2. If the action modifies the **active** project, the `useAutoSave` hook will automatically persist the change - no manual save needed in components. Changes to other projects must be saved explicitly
3. For actions that need immediate persistence (e.g., creating/deleting projects), add a `useCallback` method that calls `dispatch()` and then `saveProject()` directly
4. Expose the method in the `<ProjectContext.Provider value={...}>` object

### Adding a New Built-in Template

1. Add an entry to the `BUILTIN_TEMPLATES` array in `src/utils/templates.js`
2. Each template needs: `id` (prefix `tpl-`), `name`, `isBuiltIn: true`, and `sections` array (in display order) with `id`, `label`, `content`, `locked`

### Styling Conventions

- Use DaisyUI 5 component classes (`btn`, `card`, `input`, `textarea`, `alert`, etc.)
- Theme is `dim` (set via `data-theme="dim"` on `<html>`)
- Custom scrollbar styles are in `src/index.css`
- Mobile breakpoint at 768px (full-width drawer)

### IndexedDB Version Bumps

If you need to change the schema (add fields to projects, add object stores, etc.), increment `DB_VERSION` in `src/db/index.js` and add migration logic in the `upgrade` callback. The `idb` library handles versioned upgrades automatically.

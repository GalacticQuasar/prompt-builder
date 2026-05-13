# Prompt Builder V2

A progressive web app for building, versioning, and managing LLM prompts. Organize your prompts into projects with iterative versions, drag-and-drop sections, lock content from accidental edits, estimate token counts, and one-click copy — all stored locally in your browser.

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
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Section reordering |
| Persistence | IndexedDB via `idb` | Projects, prompts, templates |
| PWA | vite-plugin-pwa | Offline support, add-to-homescreen |
| Token Estimation | js-tiktoken | cl100k_base encoding (GPT-4 compatible) |

### Data Model

```
Project
├── id: string (crypto.randomUUID)
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
├── locked: boolean
└── order: number (for drag-and-drop sorting)

Template (built-in or user-created starter)
├── id: string
├── name: string
├── isBuiltIn: boolean
└── sections: Section[] (same shape, reusable)
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
│   └── index.js               # IndexedDB init, CRUD, localStorage migration
│
├── utils/
│   ├── helpers.js             # generateId, formatRelativeDate, getNextVersionLabel, truncateText
│   ├── tokenizer.js           # js-tiktoken cl100k_base wrapper, estimateTokens fallback
│   ├── clipboard.js           # copyAllSections, copyPromptText
│   └── templates.js           # 4 built-in templates, createProjectFromTemplate()
│
├── hooks/
│   ├── useAutoSave.js         # Debounced 300ms save to IndexedDB on every state change
│   └── useKeyboardShortcuts.js # Arrow keys (version nav), Cmd+Shift+D (duplicate), Cmd+Shift+C (copy)
│
└── components/
    ├── App.jsx                # (root, re-exports from context)
    ├── ProjectSidebar.jsx     # Left drawer: project list + templates toggle
    ├── ProjectList.jsx        # Sorted project cards with select/delete
    ├── TemplatePanel.jsx      # Built-in templates that create new projects
    ├── PromptEditor.jsx       # Main editing area: tabs + sections + DnD + copy
    ├── PromptTabs.jsx         # Version tabs with editable labels, delete, duplicate
    ├── Section.jsx            # Collapsible/lockable text block with label editing
    ├── AddSection.jsx         # Preset label buttons + custom label
    └── TokenCounter.jsx       # Total tokens badge, per-section breakdown on click
```

---

## Features

### Projects & Sidebar

- Left sidebar (DaisyUI Drawer) lists all projects sorted by most recently updated
- **New Project** button creates a project with one prompt v1 containing a single "System Prompt" section
- Select a project to edit it; delete with confirmation
- On mobile (≤768px) the drawer expands to full viewport width

### Prompt Versions (Iterations)

- Each project contains multiple prompt **versions** (v1, v2, v3...)
- Tabs across the top of the editor show all versions for the active project
- Navigate between versions with **← / → arrow keys**
- Labels auto-increment ("v1" → "v2") but are **editable** (double-click)
- **Duplicate** button (+) or **Cmd/Ctrl+Shift+D** clones all sections into a new version
- Delete a version tab (×) with confirmation (must have >1 version)
- Each version can have a different "Copy" button that copies just that version's text

### Sections

- Each prompt version contains ordered **sections** (System Prompt, Context, Instructions, etc.)
- **Add Section** bar at the bottom with presets: System Prompt, Context, Instructions, Examples, Output Format, Custom
- Each section has:
  - **Editable label** — click the label text to rename
  - **Lock toggle** (🔒/🔓) — makes textarea `readonly` to prevent accidental edits
  - **Collapse toggle** — long content shows first 2 lines → `...` → last 2 lines. Click to expand.
  - **Delete** button (×)
  - **Line count + token estimate** shown below the label
- **Drag-and-drop reordering** within a version via @dnd-kit (drag handle on the left)

### Token Counter

- Header shows total token count for the active version using `js-tiktoken` (cl100k_base encoding)
- Click the badge to see a per-section breakdown
- Falls back to `length / 4` estimation if tiktoken fails to load

### Templates

- 4 built-in templates: General Assistant, Code Helper, Creative Writing, Data Analyzer
- Clicking a template creates a new project pre-populated with labeled sections and starter content
- Templates panel is collapsible in the sidebar

### Auto-Save

- Every state change triggers a **300ms debounced save** to IndexedDB
- No manual save button needed
- On first load, detects `prompt-builder-data` in localStorage (from the V1 app) and imports it as an "Imported (legacy)" project, then removes the key

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `←` / `→` | Navigate between prompt versions |
| `Cmd/Ctrl+Shift+D` | Duplicate current version |
| `Cmd/Ctrl+Shift+C` | Copy all sections of current version |

### PWA

- `vite-plugin-pwa` with `registerType: autoUpdate`
- Service worker caches app shell and static assets
- All data is local (IndexedDB), so the app works fully offline
- Add to Home Screen manifest is configured

---

## State Management

All state lives in `ProjectContext.jsx` using `useReducer`:

### Reducer Actions

| Action | Payload | Description |
|---|---|---|
| `INIT` | `{ db, projects, activeProjectId }` | Bootstrap from IndexedDB |
| `SET_ACTIVE_PROJECT` | `projectId` | Switch active project, reset prompt index |
| `SET_ACTIVE_PROMPT_INDEX` | `index` | Switch active version tab |
| `ADD_PROJECT` | `project` | Create new project |
| `DELETE_PROJECT` | `id` | Remove project |
| `UPDATE_PROJECT` | `{ id, ...fields }` | Update project fields (e.g. rename) |
| `ADD_PROMPT` | `{ projectId, prompt }` | Add a version to a project |
| `UPDATE_PROMPT` | `{ projectId, promptId, updates }` | Update version (e.g. rename) |
| `DELETE_PROMPT` | `{ projectId, promptId }` | Remove a version |
| `ADD_SECTION` | `{ projectId, promptId, section }` | Add section to a version |
| `UPDATE_SECTION` | `{ projectId, promptId, sectionId, updates }` | Update section content/label/lock |
| `DELETE_SECTION` | `{ projectId, promptId, sectionId }` | Remove a section |
| `REORDER_SECTIONS` | `{ projectId, promptId, sections }` | Reorder sections after drag |
| `SET_PROJECTS` | `projects[]` | Bulk replace projects list |
| `SAVING_DONE` | — | Clear saving indicator |

### Exposed Context Methods

Available via `useProject()` hook:

| Method | Description |
|---|---|
| `createNewProject(name?)` | Create project with v1 + default section |
| `createProjectFromTemplate(template)` | Create project from template object |
| `duplicateCurrentPrompt()` | Clone current version into new version |
| `deleteCurrentPrompt()` | Delete current version tab |
| `deleteProjectById(id)` | Delete a project |
| `renameProject(id, name)` | Rename a project |
| `autoSave(project)` | Debounced 300ms save to IndexedDB |
| `getActiveProject()` | Returns currently selected project object |
| `getActivePrompt()` | Returns currently selected prompt version object |
| `dispatchAndSave(action)` | Dispatch reducer action then auto-save |

---

## IndexedDB Schema

Database: `PromptBuilderDB`, version 1

| Object Store | Key Path | Indexes | Description |
|---|---|---|---|
| `projects` | `id` | `updatedAt` | All project data including nested prompts/sections |
| `templates` | `id` | `name` (unique) | User-created templates |

The `projects` store holds the entire project tree (project → prompts → sections) as a single document. There is no normalization — each project is a self-contained record.

---

## Legacy Migration

On app initialization (`App.jsx` → `useEffect`), the `migrateFromLocalStorage()` function checks for a `prompt-builder-data` key in localStorage. If found:

1. Parses the JSON array of plain strings
2. Creates a project named "Imported (legacy)" with one version (v1)
3. Each string becomes a section with labels "System Prompt", "Section 2", etc.
4. Saves to IndexedDB and removes the localStorage key
5. Returns the project ID so it becomes the active project

This migration only runs once — after the key is removed, it's a no-op.

---

## Known Limitations & TODO

- **No undo/redo** — state changes are immediate with no history stack
- **No user-created templates yet** — `TemplatePanel` shows built-in templates but the "Save as Template" action is not wired up (the `templates` object store in IndexedDB is ready for it)
- **Token counter uses fallback estimation** — `js-tiktoken` loads asynchronously; until it loads, `length / 4` is used as a rough estimate
- **No export/import of project data** — all data is in IndexedDB with no JSON export (could add a download button)
- **No keyboard shortcut help tooltip** — shortcuts are documented here but not discoverable in the UI
- **No section content search** — no way to search across sections/projects
- **Project rename** — `renameProject()` exists in context but isn't exposed in the UI yet (only labels for prompt versions are editable)
- **Collapse state doesn't persist** — whether a section is collapsed is UI-only state, not saved to IndexedDB

---

## Development Notes

### Adding a New Reducer Action

1. Add the case to the `reducer` function in `ProjectContext.jsx`
2. If the action modifies project data, add a corresponding `useCallback` method that calls `dispatch()` and then `saveProject()` for persistence
3. Expose the method in the `<ProjectContext.Provider value={...}>` object

### Adding a New Built-in Template

1. Add an entry to the `BUILTIN_TEMPLATES` array in `src/utils/templates.js`
2. Each template needs: `id` (prefix `tpl-`), `name`, `isBuiltIn: true`, and `sections` array with `id`, `label`, `content`, `locked`, `order`

### Styling Conventions

- Use DaisyUI 5 component classes (`btn`, `card`, `input`, `textarea`, `alert`, etc.)
- Theme is `dim` (set via `data-theme="dim"` on `<html>`)
- Custom scrollbar styles are in `src/index.css`
- Mobile breakpoint at 768px (full-width drawer)

### IndexedDB Version Bumps

If you need to change the schema (add fields to projects, add object stores, etc.), increment `DB_VERSION` in `src/db/index.js` and add migration logic in the `upgrade` callback. The `idb` library handles versioned upgrades automatically.
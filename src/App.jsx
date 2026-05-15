import { useState, useEffect } from 'react';
import { useProject, ProjectProvider } from './context/ProjectContext';
import { initDB, getAllProjects, migrateFromLocalStorage } from './db';
import ProjectSidebar from './components/ProjectSidebar';
import PromptEditor from './components/PromptEditor';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppInner() {
  const { state, dispatch } = useProject();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useAutoSave();
  useKeyboardShortcuts();

  useEffect(() => {
    async function init() {
      try {
        const db = await initDB();
        const migratedId = await migrateFromLocalStorage(db);
        const projects = await getAllProjects(db);
        dispatch({
          type: 'INIT',
          payload: {
            db,
            projects,
            activeProjectId: migratedId || (projects.length > 0 ? projects[0].id : null),
          },
        });
      } catch (err) {
        console.error('Failed to initialize:', err);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProject = state.projects.find((p) => p.id === state.activeProjectId);

  return (
    <div className="drawer">
      <input id="sidebar-toggle" type="checkbox" className="drawer-toggle" checked={sidebarOpen} onChange={() => setSidebarOpen(!sidebarOpen)} />

      <div className="drawer-content flex flex-col h-screen">
        <header className="navbar bg-base-200 px-4 border-b border-base-content/10">
          <div className="flex-1 flex items-center gap-2">
            <label htmlFor="sidebar-toggle" className="btn btn-ghost btn-sm btn-square drawer-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <h1 className="text-lg font-bold">Prompt Builder V2</h1>
          </div>
          <div className="flex-none">
            {activeProject && (
              <span className="text-xs opacity-50">
                {activeProject.name}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4">
          <div className="flex flex-col max-w-[900px] mx-auto">
            <PromptEditor />
          </div>
        </main>
      </div>

      <div className="drawer-side">
        <label htmlFor="sidebar-toggle" aria-label="close sidebar" className="drawer-overlay"></label>
        <ProjectSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppInner />
    </ProjectProvider>
  );
}
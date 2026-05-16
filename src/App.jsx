import { useState, useEffect } from 'react';
import { useProject, ProjectProvider } from './context/ProjectContext';
import { initDB, getAllProjects } from './db';
import ProjectSidebar from './components/ProjectSidebar';
import PromptEditor from './components/PromptEditor';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppInner() {
  const { state, dispatch, renameProject } = useProject();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');

  useAutoSave();
  useKeyboardShortcuts();

  useEffect(() => {
    async function init() {
      try {
        const db = await initDB();
        const projects = await getAllProjects(db);
        projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        dispatch({
          type: 'INIT',
          payload: {
            db,
            projects,
            activeProjectId: projects.length > 0 ? projects[0].id : null,
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

  const startEditingTitle = () => {
    if (!activeProject) return;
    setTitleText(activeProject.name);
    setEditingTitle(true);
  };

  const finishEditingTitle = () => {
    setEditingTitle(false);
    if (titleText.trim() && titleText.trim() !== activeProject.name) {
      renameProject(activeProject.id, titleText.trim());
    }
  };

  return (
    <div className="drawer">
      <input id="sidebar-toggle" type="checkbox" className="drawer-toggle" checked={sidebarOpen} onChange={() => setSidebarOpen(!sidebarOpen)} />

      <div className="drawer-content flex flex-col h-screen">
        <header className="navbar bg-base-200 px-4 border-b border-base-content/10">
          <div className="navbar-start">
            <label htmlFor="sidebar-toggle" className="btn btn-ghost btn-sm btn-square drawer-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
          <div className="navbar-center">
            {activeProject && editingTitle ? (
              <input
                type="text"
                className="input input-sm input-bordered text-xl font-bold text-center w-64"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                onBlur={finishEditingTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishEditingTitle();
                  if (e.key === 'Escape') {
                    setTitleText(activeProject.name);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
              />
            ) : activeProject ? (
              <h1
                className="text-xl font-bold text-primary cursor-pointer select-none"
                onClick={startEditingTitle}
                title="Click to rename"
              >
                {activeProject.name}
              </h1>
            ) : (
              <h1 className="text-xl font-bold">Prompt Builder V3</h1>
            )}
          </div>
          <div className="navbar-end" />
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
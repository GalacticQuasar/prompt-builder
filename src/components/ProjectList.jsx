import { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { formatRelativeDate } from '../utils/helpers';

function ContextMenu({ x, y, onRename, onDelete, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 menu bg-base-100 rounded-box shadow-lg border border-base-300 w-44 p-1"
      style={{ top: y, left: x }}
    >
      <li>
        <button
          className="flex items-center gap-2"
          onClick={() => { onClose(); onRename(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Rename
        </button>
      </li>
      <li>
        <button
          className="flex items-center gap-2 text-error"
          onClick={() => { onClose(); onDelete(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </li>
    </div>
  );
}

function ProjectCard({ project, isActive, onSelect, onRename, onDelete }) {
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(project.name);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  if (editing) {
    return (
      <div
        className={`card shadow-sm ${
          isActive ? 'bg-primary text-primary-content' : 'bg-base-100'
        }`}
      >
        <div className="card-body p-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              className={`input input-sm input-bordered flex-1 min-w-0 focus:outline-none ${
                isActive ? 'input-primary bg-primary/20 text-primary-content border-primary-content/30' : ''
              }`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => {
                setEditing(false);
                if (text.trim() && text.trim() !== project.name) {
                  onRename(text.trim());
                } else {
                  setText(project.name);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditing(false);
                  if (text.trim() && text.trim() !== project.name) {
                    onRename(text.trim());
                  } else {
                    setText(project.name);
                  }
                }
                if (e.key === 'Escape') {
                  setText(project.name);
                  setEditing(false);
                }
              }}
              autoFocus
            />
            <p className="text-xs opacity-60 mt-1">
              {project.prompts.length} version{project.prompts.length !== 1 ? 's' : ''} · {formatRelativeDate(project.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`card shadow-sm cursor-pointer transition-colors ${
          isActive
            ? 'bg-primary text-primary-content'
            : 'bg-base-100 hover:bg-base-300/50'
        }`}
        onClick={() => onSelect(project.id)}
        onContextMenu={handleContextMenu}
      >
        <div className="card-body p-2">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{project.name}</h3>
              <p className="text-xs opacity-60">
                {project.prompts.length} version{project.prompts.length !== 1 ? 's' : ''} · {formatRelativeDate(project.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onRename={() => { setText(project.name); setEditing(true); }}
          onDelete={() => onDelete(project.id, project.name)}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}

export default function ProjectList() {
  const { state, dispatch, deleteProjectById, renameProject } = useProject();

  const handleSelect = (id) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: id });
  };

  const handleDelete = (id, name) => {
    if (confirm(`Delete project "${name}"?`)) {
      deleteProjectById(id);
    }
  };

  if (state.projects.length === 0) {
    return (
      <p className="text-sm opacity-50 text-center py-4">No projects yet</p>
    );
  }

  const sorted = [...state.projects].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <div className="space-y-1">
      {sorted.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isActive={project.id === state.activeProjectId}
          onSelect={handleSelect}
          onRename={(name) => renameProject(project.id, name)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
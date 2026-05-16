import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { formatRelativeDate } from '../utils/helpers';
import ContextMenu from './ContextMenu';
import ConfirmModal from './ConfirmModal';

function ProjectCard({ project, isActive, onSelect, onRename, onDelete }) {
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(project.name);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  if (editing) {
    return (
      <div
        className={`card shadow-sm rounded-lg ${
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
        className={`card shadow-sm cursor-pointer transition-colors rounded-lg ${
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
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSelect = (id) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: id });
  };

  const handleDelete = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProjectById(deleteTarget.id);
      setDeleteTarget(null);
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
    <>
      <div className="space-y-2">
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
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

import { useProject } from '../context/ProjectContext';
import { formatRelativeDate } from '../utils/helpers';

export default function ProjectList() {
  const { state, dispatch, deleteProjectById } = useProject();

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
        <div
          key={project.id}
          className={`card shadow-sm cursor-pointer transition-colors ${
            project.id === state.activeProjectId
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 hover:bg-base-300/50'
          }`}
          onClick={() => handleSelect(project.id)}
        >
          <div className="card-body p-2">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                <p className="text-xs opacity-60">
                  {project.prompts.length} version{project.prompts.length !== 1 ? 's' : ''} · {formatRelativeDate(project.updatedAt)}
                </p>
              </div>
              <button
                className="btn btn-xs btn-ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id, project.name);
                }}
                title="Delete project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
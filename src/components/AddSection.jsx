import { useProject } from '../context/ProjectContext';

export default function AddSection() {
  const { state, dispatch, getActivePrompt, autoSave } = useProject();
  const project = state.projects.find((p) => p.id === state.activeProjectId);

  const handleAdd = (label) => {
    const prompt = getActivePrompt();
    if (!prompt || !project) return;

    const section = {
      id: crypto.randomUUID(),
      label,
      content: '',
      locked: false,
      order: prompt.sections.length,
    };

    dispatch({
      type: 'ADD_SECTION',
      payload: { projectId: project.id, promptId: prompt.id, section },
    });

    const updated = {
      ...project,
      prompts: project.prompts.map((pr) =>
        pr.id === prompt.id ? { ...pr, sections: [...pr.sections, section] } : pr
      ),
      updatedAt: new Date().toISOString(),
    };
    autoSave(updated);
  };

  const presets = ['System Prompt', 'Context', 'Instructions', 'Examples', 'Output Format'];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm opacity-60">Add section:</span>
      {presets.map((label) => (
        <button key={label} className="btn btn-xs btn-outline" onClick={() => handleAdd(label)}>
          {label}
        </button>
      ))}
      <button className="btn btn-xs btn-outline btn-primary" onClick={() => handleAdd('Custom')}>
        + Custom
      </button>
    </div>
  );
}
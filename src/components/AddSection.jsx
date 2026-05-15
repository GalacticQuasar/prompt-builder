import { useProject } from '../context/ProjectContext';
import { generateId } from '../utils/helpers';

export default function AddSection() {
  const { state, dispatch, getActivePrompt, autoSave } = useProject();
  const project = state.projects.find((p) => p.id === state.activeProjectId);

  const handleAdd = (label) => {
    const prompt = getActivePrompt();
    if (!prompt || !project) return;

    const section = {
      id: generateId(),
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

    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  };

  const prompt = getActivePrompt();
  const nextNum = prompt ? prompt.sections.length + 1 : 1;

  return (
    <div className="flex justify-center py-2">
      <button className="btn btn-outline btn-primary px-40" onClick={() => handleAdd(`Section ${nextNum}`)}>
        + Add Section
      </button>
    </div>
  );
}

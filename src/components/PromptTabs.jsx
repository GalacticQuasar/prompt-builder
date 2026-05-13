import { useState } from 'react';
import { useProject } from '../context/ProjectContext';

export default function PromptTabs() {
  const { state, dispatch, getActiveProject, deleteCurrentPrompt, duplicateCurrentPrompt, autoSave } = useProject();
  const project = getActiveProject();

  if (!project) return null;

  const { prompts, id: projectId } = project;

  const handleTabClick = (index) => {
    dispatch({ type: 'SET_ACTIVE_PROMPT_INDEX', payload: index });
  };

  const handleLabelChange = (promptId, newLabel) => {
    dispatch({
      type: 'UPDATE_PROMPT',
      payload: { projectId, promptId, updates: { label: newLabel } },
    });
    const updated = {
      ...project,
      prompts: project.prompts.map((p) =>
        p.id === promptId ? { ...p, label: newLabel } : p
      ),
      updatedAt: new Date().toISOString(),
    };
    autoSave(updated);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {prompts.map((prompt, index) => (
        <div
          key={prompt.id}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg cursor-pointer text-sm font-medium transition-colors ${
            index === state.activePromptIndex
              ? 'bg-base-200 text-primary border-b-2 border-primary'
              : 'bg-base-300/50 opacity-70 hover:opacity-100'
          }`}
          onClick={() => handleTabClick(index)}
        >
          <EditableLabel
            value={prompt.label}
            onChange={(val) => handleLabelChange(prompt.id, val)}
            active={index === state.activePromptIndex}
          />
          {prompts.length > 1 && (
            <button
              className="btn btn-xs btn-ghost btn-square opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${prompt.label}"?`)) {
                  dispatch({ type: 'SET_ACTIVE_PROMPT_INDEX', payload: index });
                  setTimeout(() => deleteCurrentPrompt(), 0);
                }
              }}
              title="Delete version"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        className="btn btn-sm btn-ghost btn-square"
        onClick={() => duplicateCurrentPrompt()}
        title="Duplicate current version (Cmd+Shift+D)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

function EditableLabel({ value, onChange, active }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  if (!active) {
    return <span className="truncate max-w-32">{value}</span>;
  }

  if (editing) {
    return (
      <input
        type="text"
        className="input input-xs input-bordered w-24"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(text);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false);
            onChange(text);
          }
        }}
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className="truncate max-w-32 hover:underline"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Double-click to rename"
    >
      {value}
    </span>
  );
}
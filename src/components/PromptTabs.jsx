import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import ContextMenu from './ContextMenu';

function TabItem({ prompt, index, isActive, promptCount, onSelect, onLabelChange, onDelete }) {
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(prompt.label);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const startEditing = () => {
    setText(prompt.label);
    setEditing(true);
  };

  const finishEdit = () => {
    setEditing(false);
    if (text.trim() && text.trim() !== prompt.label) {
      onLabelChange(prompt.id, text.trim());
    } else {
      setText(prompt.label);
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg cursor-pointer text-sm font-medium transition-colors ${
          isActive
            ? 'bg-base-200 text-primary border-b-2 border-primary'
            : 'bg-base-300/50 opacity-70 hover:opacity-100'
        }`}
        onClick={() => onSelect(index)}
        onContextMenu={handleContextMenu}
      >
        {editing ? (
          <input
            type="text"
            className="input input-xs input-bordered w-24 focus:outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={finishEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') finishEdit();
              if (e.key === 'Escape') {
                setText(prompt.label);
                setEditing(false);
              }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate max-w-32">{prompt.label}</span>
        )}
      </div>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onRename={startEditing}
          canDelete={promptCount > 1}
          onDelete={() => onDelete(index)}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}

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

  const handleDelete = (index) => {
    dispatch({ type: 'SET_ACTIVE_PROMPT_INDEX', payload: index });
    deleteCurrentPrompt();
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {prompts.map((prompt, index) => (
        <TabItem
          key={prompt.id}
          prompt={prompt}
          index={index}
          isActive={index === state.activePromptIndex}
          promptCount={prompts.length}
          onSelect={handleTabClick}
          onLabelChange={handleLabelChange}
          onDelete={handleDelete}
        />
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
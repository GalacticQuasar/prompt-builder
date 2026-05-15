import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { truncateText } from '../utils/helpers';
import { estimateTokens } from '../utils/tokenizer';

export default function Section({ section, promptId }) {
  const { dispatch, autoSave, getActiveProject } = useProject();
  const project = getActiveProject();
  const [collapsed, setCollapsed] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(section.label);
  const truncated = truncateText(section.content);
  const shouldCollapse = truncated && collapsed;

  const updateSection = (updates) => {
    if (!project) return;
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { projectId: project.id, promptId, sectionId: section.id, updates },
    });
  };

  const handleChange = (field, value) => {
    updateSection({ [field]: value });
    if (project) {
      const updated = {
        ...project,
        prompts: project.prompts.map((pr) =>
          pr.id === promptId
            ? {
                ...pr,
                sections: pr.sections.map((s) =>
                  s.id === section.id ? { ...s, [field]: value } : s
                ),
              }
            : pr
        ),
        updatedAt: new Date().toISOString(),
      };
      autoSave(updated);
    }
  };

  const handleDelete = () => {
    if (!project) return;
    dispatch({
      type: 'DELETE_SECTION',
      payload: { projectId: project.id, promptId, sectionId: section.id },
    });
    const updated = {
      ...project,
      prompts: project.prompts.map((pr) =>
        pr.id === promptId
          ? { ...pr, sections: pr.sections.filter((s) => s.id !== section.id) }
          : pr
      ),
      updatedAt: new Date().toISOString(),
    };
    autoSave(updated);
  };

  const finishLabelEdit = () => {
    setEditingLabel(false);
    handleChange('label', labelValue);
  };

  const lineCount = section.content ? section.content.split('\n').length : 0;

  return (
    <div className={`card bg-base-200 shadow-sm ${section.locked ? 'opacity-80' : ''}`}>
      <div className="card-body p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {editingLabel ? (
              <input
                type="text"
                className="input input-sm input-bordered flex-1"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={finishLabelEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishLabelEdit();
                  if (e.key === 'Escape') {
                    setLabelValue(section.label);
                    setEditingLabel(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                className="font-semibold text-sm cursor-pointer truncate"
                onClick={() => setEditingLabel(true)}
                title="Click to rename"
              >
                {section.label || 'Untitled'}
              </span>
            )}
            <span className="text-xs opacity-40">
              {lineCount} line{lineCount !== 1 ? 's' : ''} · ~{estimateTokens(section.content)} tokens
            </span>
          </div>
          <div className="flex items-center gap-1">
            {truncated && (
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expand' : 'Collapse'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            <button
              className={`btn btn-xs btn-ghost ${section.locked ? 'text-warning' : ''}`}
              onClick={() => handleChange('locked', !section.locked)}
              title={section.locked ? 'Unlock section' : 'Lock section'}
            >
              {section.locked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button
              className="btn btn-xs btn-ghost text-error"
              onClick={handleDelete}
              title="Delete section"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {shouldCollapse ? (
          <div
            className="text-sm opacity-60 cursor-pointer py-2 px-1"
            onClick={() => setCollapsed(false)}
          >
            <p>{truncated.first}</p>
            <p className="text-center opacity-40">···</p>
            <p>{truncated.last}</p>
          </div>
        ) : (
          <textarea
            className="textarea textarea-bordered w-full focus:outline-none resize-y"
            rows={4}
            value={section.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Type here..."
            readOnly={section.locked}
          />
        )}
      </div>
    </div>
  );
}
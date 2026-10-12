import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import ProjectList from './ProjectList';
import TemplatePanel from './TemplatePanel';
import { useConfirmSectionDelete, setConfirmSectionDelete } from '../hooks/useConfirmSectionDelete';
import { useImportBackup } from '../hooks/useImportBackup';
import { downloadBackup } from '../utils/backup';

export default function ProjectSidebar({ onClose }) {
  const { state, createNewProject } = useProject();
  const { openPicker, inputProps, status: importStatus } = useImportBackup();
  const [showTemplates, setShowTemplates] = useState(false);
  const confirmSectionDelete = useConfirmSectionDelete();

  const handleNewProject = () => {
    createNewProject();
  };

  return (
    <div className="bg-base-200 min-h-full w-80 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Projects</h2>
        <button className="btn btn-ghost btn-sm btn-square" onClick={onClose} title="Close sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <button className="btn btn-primary btn-sm w-full mb-4" onClick={handleNewProject}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Project
      </button>

      <div className="flex-1 overflow-y-auto">
        <ProjectList />
      </div>

      <div className="divider my-2"></div>

      <div>
        <button
          className="btn btn-ghost btn-sm w-full justify-start"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Templates
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTemplates && <TemplatePanel onClose={onClose} />}
      </div>

      <div className="divider my-2"></div>

      <div className="px-3 pb-2 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Backup</span>
          <div className="flex gap-1">
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => downloadBackup(state.projects)}
              disabled={state.projects.length === 0}
              title="Download all projects as a JSON file"
            >
              Export
            </button>
            <button className="btn btn-ghost btn-xs" onClick={openPicker} title="Add projects from a backup file">
              Import
            </button>
            <input {...inputProps} />
          </div>
        </div>
        {importStatus && (
          <p className={`text-xs ${importStatus.type === 'error' ? 'text-error' : 'text-success'}`}>
            {importStatus.message}
          </p>
        )}
      </div>

      <label className="label cursor-pointer justify-between px-3 text-sm">
        Confirm section deletes
        <input
          type="checkbox"
          className="toggle toggle-sm toggle-primary"
          checked={confirmSectionDelete}
          onChange={(e) => setConfirmSectionDelete(e.target.checked)}
        />
      </label>
    </div>
  );
}
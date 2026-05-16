import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import ProjectList from './ProjectList';
import TemplatePanel from './TemplatePanel';

export default function ProjectSidebar({ onClose }) {
  const { createNewProject } = useProject();
  const [showTemplates, setShowTemplates] = useState(false);

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
    </div>
  );
}
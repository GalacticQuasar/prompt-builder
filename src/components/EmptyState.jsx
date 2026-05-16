import { useProject } from '../context/ProjectContext';
import { getBuiltInTemplates } from '../utils/templates';

const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Versions',
    description: 'Iterate on prompts with versioned snapshots',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    title: 'Sections',
    description: 'Organize prompts into labeled, reorderable blocks',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: 'Drag & Drop',
    description: 'Reorder sections by dragging and dropping',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Copy Modes',
    description: 'Plain text or labeled XML-style output',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    title: 'Token Count',
    description: 'Estimate number of tokens per section',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Lock Sections',
    description: 'Protect sections from accidental edits',
  },
];

export default function EmptyState() {
  const { createNewProject, createProjectFromTemplate } = useProject();
  const templates = getBuiltInTemplates();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem-2rem)] pt-0 -mt-8">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Prompt Builder</h2>
          <p className="opacity-60">
            Build, version, and manage your LLM prompts. Each project contains
            versions made up of labeled sections you can reorder, lock, and copy.
          </p>
          <div role="alert" className="alert alert-success alert-soft mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check-icon lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="text-sm">100% local. All data stays on your device, in your browser's database.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          {FEATURES.map((f) => (
            <div key={f.title} className="card bg-base-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                {f.icon}
                <span className="font-semibold text-sm">{f.title}</span>
              </div>
              <p className="text-xs opacity-50">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold opacity-70">Start from a template</h3>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                className="btn btn-soft btn-sm justify-between"
                onClick={() => createProjectFromTemplate(template)}
              >
                <span className="truncate">{template.name}</span>
                <span className="text-xs opacity-50">
                  {template.sections.length} section{template.sections.length !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider text-xs opacity-40">or</div>

        <button
          className="btn btn-primary"
          onClick={() => createNewProject()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Blank Project
        </button>
      </div>
    </div>
  );
}

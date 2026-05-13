import { useProject } from '../context/ProjectContext';
import { getBuiltInTemplates } from '../utils/templates';

export default function TemplatePanel({ onClose }) {
  const { createProjectFromTemplate } = useProject();
  const builtIn = getBuiltInTemplates();

  const handleUseTemplate = (template) => {
    createProjectFromTemplate(template);
    if (onClose) onClose();
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2 opacity-70">Templates</h3>
      <div className="space-y-1">
        {builtIn.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between p-2 rounded bg-base-100 hover:bg-base-300/50 cursor-pointer transition-colors"
            onClick={() => handleUseTemplate(template)}
          >
            <span className="text-sm truncate">{template.name}</span>
            <span className="text-xs opacity-50">
              {template.sections.length} section{template.sections.length !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
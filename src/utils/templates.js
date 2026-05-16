import { generateId } from './helpers';

const BUILTIN_TEMPLATES = [
  {
    id: 'tpl-general-assistant',
    name: 'General Assistant',
    isBuiltIn: true,
    sections: [
      { id: 'tpl-ga-1', label: 'System Prompt', content: 'You are a helpful honest AI assistant. You provide clear, accurate, and well-structured responses. When you are uncertain, you say so.', locked: false, order: 0 },
      { id: 'tpl-ga-2', label: 'Context', content: '', locked: false, order: 1 },
      { id: 'tpl-ga-3', label: 'Instructions', content: '', locked: false, order: 2 },
    ],
  },
  {
    id: 'tpl-code-helper',
    name: 'Code Helper',
    isBuiltIn: true,
    sections: [
      { id: 'tpl-ch-1', label: 'System Prompt', content: 'You are an expert software engineer. You write clean, well-documented code. You explain your reasoning and suggest best practices. When shown code, you analyze it thoroughly before making changes.', locked: false, order: 0 },
      { id: 'tpl-ch-2', label: 'Context', content: '', locked: false, order: 1 },
      { id: 'tpl-ch-3', label: 'Code', content: '', locked: false, order: 2 },
      { id: 'tpl-ch-4', label: 'Instructions', content: '', locked: false, order: 3 },
    ],
  },
  {
    id: 'tpl-creative-writing',
    name: 'Creative Writing',
    isBuiltIn: true,
    sections: [
      { id: 'tpl-cw-1', label: 'System Prompt', content: 'You are a creative writer with a vivid imagination and a strong command of language. You craft engaging narratives with well-developed characters and compelling dialogue.', locked: false, order: 0 },
      { id: 'tpl-cw-2', label: 'Context', content: '', locked: false, order: 1 },
      { id: 'tpl-cw-3', label: 'Style Notes', content: '', locked: false, order: 2 },
      { id: 'tpl-cw-4', label: 'Instructions', content: '', locked: false, order: 3 },
    ],
  },
  {
    id: 'tpl-data-analyzer',
    name: 'Data Analyzer',
    isBuiltIn: true,
    sections: [
      { id: 'tpl-da-1', label: 'System Prompt', content: 'You are a data analysis expert. You approach problems methodically, explain your reasoning step by step, and present findings clearly. You identify patterns, outliers, and insights from data.', locked: false, order: 0 },
      { id: 'tpl-da-2', label: 'Context', content: '', locked: false, order: 1 },
      { id: 'tpl-da-3', label: 'Data', content: '', locked: false, order: 2 },
      { id: 'tpl-da-4', label: 'Instructions', content: '', locked: false, order: 3 },
    ],
  },
];

export function getBuiltInTemplates() {
  return BUILTIN_TEMPLATES;
}

export function createProjectFromTemplate(template) {
  return {
    id: generateId(),
    name: template.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    prompts: [
      {
        id: generateId(),
        label: 'v1',
        sections: template.sections.map((s, i) => ({
          ...s,
          id: generateId(),
          order: i,
        })),
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

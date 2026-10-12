import { generateId } from './helpers';
import { normalizeProject } from '../db';

const BACKUP_FORMAT = 'prompt-builder-backup';
const BACKUP_VERSION = 1;

export function downloadBackup(projects) {
  const backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    projects,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prompt-builder-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const isString = (value) => typeof value === 'string';

function isValidSection(section) {
  return section && isString(section.id) && isString(section.label) && isString(section.content);
}

function isValidPrompt(prompt) {
  return prompt && isString(prompt.id) && isString(prompt.label) &&
    Array.isArray(prompt.sections) && prompt.sections.every(isValidSection);
}

function isValidProject(project) {
  return project && isString(project.id) && isString(project.name) &&
    Array.isArray(project.prompts) && project.prompts.length > 0 && project.prompts.every(isValidPrompt);
}

function withFreshIds(project) {
  return {
    ...project,
    id: generateId(),
    name: `${project.name} (imported)`,
    prompts: project.prompts.map((prompt) => ({
      ...prompt,
      id: generateId(),
      sections: prompt.sections.map((section) => ({ ...section, id: generateId() })),
    })),
  };
}

// Parse a backup file's text into projects ready to save. Projects whose id
// already exists (or repeats within the backup) are imported as copies with
// fresh ids rather than overwriting; `copiedCount` says how many.
export function parseBackup(text, existingIds) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (data?.format !== BACKUP_FORMAT || !Array.isArray(data.projects)) {
    throw new Error('This file is not a Prompt Builder backup.');
  }
  if (data.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of Prompt Builder.');
  }
  if (!data.projects.every(isValidProject)) {
    throw new Error('This backup is damaged or incomplete.');
  }

  const now = new Date().toISOString();
  const takenIds = new Set(existingIds);
  let copiedCount = 0;
  const projects = data.projects.map((raw) => {
    const project = normalizeProject({
      ...raw,
      createdAt: raw.createdAt || now,
      updatedAt: raw.updatedAt || now,
      prompts: raw.prompts.map((prompt) => ({
        ...prompt,
        createdAt: prompt.createdAt || now,
        sections: prompt.sections.map((section) => ({ ...section, locked: section.locked === true })),
      })),
    });
    if (!takenIds.has(project.id)) {
      takenIds.add(project.id);
      return project;
    }
    copiedCount++;
    return withFreshIds(project);
  });
  return { projects, copiedCount };
}

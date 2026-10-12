import { openDB } from 'idb';

const DB_NAME = 'PromptBuilderDB';
const DB_VERSION = 1;
const PROJECT_STORE = 'projects';

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        const projectStore = db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
        projectStore.createIndex('updatedAt', 'updatedAt');
      }
    },
  });
}

// Older data stored each section's position in an `order` field. Sections are
// now kept in array order, so sort by `order` once on load and drop it.
function normalizeSections(sections) {
  return sections
    .map((section, index) => ({ section, position: section.order ?? index }))
    .sort((a, b) => a.position - b.position)
    .map(({ section }) => {
      const normalized = { ...section };
      delete normalized.order;
      return normalized;
    });
}

export function normalizeProject(project) {
  return {
    ...project,
    prompts: project.prompts.map((prompt) => ({
      ...prompt,
      sections: normalizeSections(prompt.sections),
    })),
  };
}

export async function getAllProjects(db) {
  const projects = await db.getAll(PROJECT_STORE);
  return projects.map(normalizeProject);
}

export async function saveProject(db, project) {
  await db.put(PROJECT_STORE, project);
}

export async function deleteProject(db, id) {
  await db.delete(PROJECT_STORE, id);
}


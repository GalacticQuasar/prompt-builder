import { openDB } from 'idb';

const DB_NAME = 'PromptBuilderDB';
const DB_VERSION = 1;
const PROJECT_STORE = 'projects';
const TEMPLATE_STORE = 'templates';

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        const projectStore = db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
        projectStore.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains(TEMPLATE_STORE)) {
        const templateStore = db.createObjectStore(TEMPLATE_STORE, { keyPath: 'id' });
        templateStore.createIndex('name', 'name', { unique: true });
      }
    },
  });
}

export async function getAllProjects(db) {
  return db.getAll(PROJECT_STORE);
}

export async function getProject(db, id) {
  return db.get(PROJECT_STORE, id);
}

export async function saveProject(db, project) {
  await db.put(PROJECT_STORE, { ...project, updatedAt: new Date().toISOString() });
}

export async function deleteProject(db, id) {
  await db.delete(PROJECT_STORE, id);
}

export async function getAllTemplates(db) {
  return db.getAll(TEMPLATE_STORE);
}

export async function saveTemplate(db, template) {
  await db.put(TEMPLATE_STORE, template);
}

export async function deleteTemplate(db, id) {
  await db.delete(TEMPLATE_STORE, id);
}

export async function migrateFromLocalStorage(db) {
  const LEGACY_KEY = 'prompt-builder-data';
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return false;

  try {
    const prompts = JSON.parse(raw);
    if (!Array.isArray(prompts) || prompts.length === 0) return false;

    const project = {
      id: crypto.randomUUID(),
      name: 'Imported (legacy)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prompts: [
        {
          id: crypto.randomUUID(),
          label: 'v1',
          sections: prompts.map((content, index) => ({
            id: crypto.randomUUID(),
            label: index === 0 ? 'System Prompt' : `Section ${index + 1}`,
            content,
            locked: false,
            order: index,
          })),
          createdAt: new Date().toISOString(),
        },
      ],
    };

    await saveProject(db, project);
    localStorage.removeItem(LEGACY_KEY);
    return project.id;
  } catch {
    return false;
  }
}
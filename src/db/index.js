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

export async function getAllProjects(db) {
  return db.getAll(PROJECT_STORE);
}

export async function saveProject(db, project) {
  await db.put(PROJECT_STORE, project);
}

export async function deleteProject(db, id) {
  await db.delete(PROJECT_STORE, id);
}


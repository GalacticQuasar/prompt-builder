import { useSyncExternalStore } from 'react';

const SKIP_DELETE_CONFIRM_KEY = 'skipSectionDeleteConfirm';
const listeners = new Set();

function getConfirmSectionDelete() {
  try {
    return localStorage.getItem(SKIP_DELETE_CONFIRM_KEY) !== 'true';
  } catch {
    return true;
  }
}

export function setConfirmSectionDelete(enabled) {
  try {
    if (enabled) {
      localStorage.removeItem(SKIP_DELETE_CONFIRM_KEY);
    } else {
      localStorage.setItem(SKIP_DELETE_CONFIRM_KEY, 'true');
    }
  } catch { /* ignored */ }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useConfirmSectionDelete() {
  return useSyncExternalStore(subscribe, getConfirmSectionDelete);
}

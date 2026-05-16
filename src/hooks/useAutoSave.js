import { useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { saveProject } from '../db';

export function useAutoSave(delay = 300) {
  const { state, getActiveProject } = useProject();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!state.db || !state.activeProjectId) return;
    const project = getActiveProject();
    if (!project) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        await saveProject(state.db, project);
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.projects, state.activeProjectId, state.db, delay, getActiveProject]);
}
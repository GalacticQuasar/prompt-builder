import { useEffect, useRef, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { saveProject } from '../db';

export function useAutoSave(delay = 300) {
  const { state, getActiveProject } = useProject();
  const timeoutRef = useRef(null);
  const latestRef = useRef({ db: null, projects: [] });
  const dirtyIdsRef = useRef(new Set());

  // Save every project with unsaved changes, reading the latest state so that
  // projects deleted in the meantime are skipped rather than written back.
  const flush = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    const { db, projects } = latestRef.current;
    if (!db) return;
    for (const id of dirtyIdsRef.current) {
      const project = projects.find((p) => p.id === id);
      if (!project) continue;
      saveProject(db, project).catch((err) => console.error('Auto-save failed:', err));
    }
    dirtyIdsRef.current.clear();
  }, []);

  useEffect(() => {
    latestRef.current = { db: state.db, projects: state.projects };
    if (!state.db || !state.activeProjectId) return;
    const project = getActiveProject();
    if (!project) return;

    dirtyIdsRef.current.add(project.id);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(flush, delay);
  }, [state.projects, state.activeProjectId, state.db, delay, getActiveProject, flush]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);
}

import { useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export function useKeyboardShortcuts() {
  const { getActiveProject, state, dispatch } = useProject();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft' && !e.target.closest('textarea, input')) {
        e.preventDefault();
        const newIndex = Math.max(0, state.activePromptIndex - 1);
        dispatch({ type: 'SET_ACTIVE_PROMPT_INDEX', payload: newIndex });
      }

      if (e.key === 'ArrowRight' && !e.target.closest('textarea, input')) {
        e.preventDefault();
        const project = getActiveProject();
        if (!project) return;
        const newIndex = Math.min(project.prompts.length - 1, state.activePromptIndex + 1);
        dispatch({ type: 'SET_ACTIVE_PROMPT_INDEX', payload: newIndex });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activePromptIndex, state.activeProjectId, getActiveProject, dispatch]);
}
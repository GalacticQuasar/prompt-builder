import { useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export function useKeyboardShortcuts() {
  const { getActiveProject, state, dispatch, duplicateCurrentPrompt } = useProject();

  useEffect(() => {
    function handleKeyDown(e) {
      const isMod = e.metaKey || e.ctrlKey;

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

      if (isMod && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        duplicateCurrentPrompt();
      }

      if (isMod && e.key === 'n') {
        if (e.shiftKey) {
          e.preventDefault();
          document.getElementById('add-section-btn')?.click();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activePromptIndex, state.activeProjectId, getActiveProject, dispatch, duplicateCurrentPrompt]);
}
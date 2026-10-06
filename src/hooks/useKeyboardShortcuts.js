import { useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

// Elements where arrow keys already mean something: text editing, native
// controls, and dnd-kit sortables (arrows move the item during a keyboard drag).
const ARROW_KEY_TARGETS = 'input, textarea, select, [contenteditable], [aria-roledescription]';

function shouldIgnoreArrowKey(e) {
  if (e.defaultPrevented) return true;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return true;
  if (e.target.closest(ARROW_KEY_TARGETS)) return true;
  if (document.querySelector('dialog[open]')) return true;
  return false;
}

export function useKeyboardShortcuts() {
  const { getActiveProject, state, dispatch } = useProject();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (shouldIgnoreArrowKey(e)) return;

      const project = getActiveProject();
      if (!project) return;

      const newIndex =
        e.key === 'ArrowLeft'
          ? Math.max(0, state.activePromptIndex - 1)
          : Math.min(project.prompts.length - 1, state.activePromptIndex + 1);
      if (newIndex === state.activePromptIndex) return;

      e.preventDefault();
      dispatch({ type: 'SET_ACTIVE_PROMPT_INDEX', payload: newIndex });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activePromptIndex, state.activeProjectId, getActiveProject, dispatch]);
}

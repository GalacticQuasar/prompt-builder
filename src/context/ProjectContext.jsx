import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { generateId, getNextVersionLabel } from '../utils/helpers';
import { createProjectFromTemplate as buildProjectFromTemplate } from '../utils/templates';
import { saveProject, deleteProject as dbDeleteProject } from '../db';

const ProjectContext = createContext(null);

const initialState = {
  projects: [],
  activeProjectId: null,
  activePromptIndex: 0,
  db: null,
  initialized: false,
  saving: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      const { db, projects, activeProjectId } = action.payload;
      return {
        ...state,
        db,
        projects,
        activeProjectId: activeProjectId || (projects.length > 0 ? projects[0].id : null),
        initialized: true,
      };
    }

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload, activePromptIndex: 0 };

    case 'SET_ACTIVE_PROMPT_INDEX':
      return { ...state, activePromptIndex: action.payload };

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };

    case 'UPDATE_PROJECT': {
      const updated = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
        saving: true,
      };
    }

    case 'SAVING_DONE':
      return { ...state, saving: false };

    case 'ADD_PROJECT': {
      const project = action.payload;
      return {
        ...state,
        projects: [project, ...state.projects],
        activeProjectId: project.id,
        activePromptIndex: 0,
      };
    }

    case 'DELETE_PROJECT': {
      const id = action.payload;
      const remaining = state.projects.filter((p) => p.id !== id);
      return {
        ...state,
        projects: remaining,
        activeProjectId:
          state.activeProjectId === id
            ? remaining.length > 0
              ? remaining[0].id
            : null
            : state.activeProjectId,
        activePromptIndex: 0,
      };
    }

    case 'ADD_PROMPT': {
      const { projectId, prompt } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, prompts: [...p.prompts, prompt], updatedAt: new Date().toISOString() }
            : p
        ),
        activePromptIndex:
          state.activeProjectId === projectId
            ? state.projects.find((p) => p.id === projectId).prompts.length
            : state.activePromptIndex,
      };
    }

    case 'UPDATE_PROMPT': {
      const { projectId, promptId, updates } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                prompts: p.prompts.map((pr) => (pr.id === promptId ? { ...pr, ...updates } : pr)),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    }

    case 'DELETE_PROMPT': {
      const { projectId, promptId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                prompts: p.prompts.filter((pr) => pr.id !== promptId),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        activePromptIndex: Math.max(0, state.activePromptIndex - 1),
      };
    }

    case 'UPDATE_SECTION': {
      const { projectId, promptId, sectionId, updates } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                prompts: p.prompts.map((pr) =>
                  pr.id === promptId
                    ? {
                        ...pr,
                        sections: pr.sections.map((s) =>
                          s.id === sectionId ? { ...s, ...updates } : s
                        ),
                      }
                    : pr
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    }

    case 'ADD_SECTION': {
      const { projectId, promptId, section } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                prompts: p.prompts.map((pr) =>
                  pr.id === promptId
                    ? { ...pr, sections: [...pr.sections, section] }
                    : pr
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    }

    case 'DELETE_SECTION': {
      const { projectId, promptId, sectionId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                prompts: p.prompts.map((pr) =>
                  pr.id === promptId
                    ? { ...pr, sections: pr.sections.filter((s) => s.id !== sectionId) }
                    : pr
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    }

    case 'REORDER_SECTIONS': {
      const { projectId, promptId, sections } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                prompts: p.prompts.map((pr) =>
                  pr.id === promptId ? { ...pr, sections } : pr
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      };
    }

    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimeoutRef = useRef(null);

  const getActiveProject = useCallback(() => {
    return state.projects.find((p) => p.id === state.activeProjectId) || null;
  }, [state.projects, state.activeProjectId]);

  const getActivePrompt = useCallback(() => {
    const project = getActiveProject();
    if (!project) return null;
    return project.prompts[state.activePromptIndex] || null;
  }, [getActiveProject, state.activePromptIndex]);

  const autoSave = useCallback(
    (project) => {
      if (!state.db || !project) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveProject(state.db, project);
          dispatch({ type: 'SAVING_DONE' });
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, 300);
    },
    [state.db]
  );

  const dispatchAndSave = useCallback(
    (action) => {
      dispatch(action);
      if (state.db) {
        setTimeout(() => {
          const updatedProject = getActiveProject();
          if (updatedProject) autoSave(updatedProject);
        }, 0);
      }
    },
    [state.db, getActiveProject, autoSave]
  );

  const createNewProject = useCallback(
    (name = 'Untitled Project') => {
      const project = {
        id: generateId(),
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prompts: [
          {
            id: generateId(),
            label: 'v1',
            sections: [
              {
                id: generateId(),
                label: 'System Prompt',
                content: '',
                locked: false,
                order: 0,
              },
            ],
            createdAt: new Date().toISOString(),
          },
        ],
      };
      dispatch({ type: 'ADD_PROJECT', payload: project });
      if (state.db) {
        saveProject(state.db, project);
      }
      return project;
    },
    [state.db]
  );

  const createProjectFromTemplate = useCallback(
    (template) => {
      const project = buildProjectFromTemplate(template);
      dispatch({ type: 'ADD_PROJECT', payload: project });
      if (state.db) {
        saveProject(state.db, project);
      }
      return project;
    },
    [state.db]
  );

  const duplicateCurrentPrompt = useCallback(() => {
    const project = getActiveProject();
    if (!project) return;
    const currentPrompt = project.prompts[state.activePromptIndex];
    if (!currentPrompt) return;

    const newPrompt = {
      id: generateId(),
      label: getNextVersionLabel(project.prompts),
      sections: currentPrompt.sections.map((s) => ({
        ...s,
        id: generateId(),
      })),
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_PROMPT',
      payload: { projectId: project.id, prompt: newPrompt },
    });

    if (state.db) {
      const updated = {
        ...project,
        prompts: [...project.prompts, newPrompt],
        updatedAt: new Date().toISOString(),
      };
      saveProject(state.db, updated);
    }
  }, [getActiveProject, state.activePromptIndex, state.db]);

  const deleteCurrentPrompt = useCallback(() => {
    const project = getActiveProject();
    if (!project || project.prompts.length <= 1) return;
    const currentPrompt = project.prompts[state.activePromptIndex];
    if (!currentPrompt) return;

    dispatch({
      type: 'DELETE_PROMPT',
      payload: { projectId: project.id, promptId: currentPrompt.id },
    });

    if (state.db) {
      const updated = {
        ...project,
        prompts: project.prompts.filter((p) => p.id !== currentPrompt.id),
        updatedAt: new Date().toISOString(),
      };
      saveProject(state.db, updated);
    }
  }, [getActiveProject, state.activePromptIndex, state.db]);

  const deleteProjectById = useCallback(
    (id) => {
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      if (state.db) {
        dbDeleteProject(state.db, id);
      }
    },
    [state.db]
  );

  const renameProject = useCallback(
    (id, name) => {
      const project = state.projects.find((p) => p.id === id);
      if (!project) return;
      const updated = { ...project, name, updatedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_PROJECT', payload: updated });
      if (state.db) {
        saveProject(state.db, updated);
      }
    },
    [state.projects, state.db]
  );

  return (
    <ProjectContext.Provider
      value={{
        state,
        dispatch,
        dispatchAndSave,
        getActiveProject,
        getActivePrompt,
        createNewProject,
        createProjectFromTemplate,
        duplicateCurrentPrompt,
        deleteCurrentPrompt,
        deleteProjectById,
        renameProject,
        autoSave,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
}
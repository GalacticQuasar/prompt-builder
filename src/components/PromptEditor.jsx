import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProject } from '../context/ProjectContext';
import Section from './Section';
import AddSection from './AddSection';
import PromptTabs from './PromptTabs';
import TokenCounter from './TokenCounter';
import { copyAllSections } from '../utils/clipboard';
import { getSortedSections } from '../utils/helpers';

export default function PromptEditor() {
  const { dispatch, getActivePrompt, getActiveProject } = useProject();
  const project = getActiveProject();
  const prompt = getActivePrompt();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !prompt || !project) return;

    const oldIndex = prompt.sections.findIndex((s) => s.id === active.id);
    const newIndex = prompt.sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(prompt.sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));

    dispatch({
      type: 'REORDER_SECTIONS',
      payload: { projectId: project.id, promptId: prompt.id, sections: reordered },
    });
  };

  const handleCopyAll = async () => {
    if (!prompt) return;
    try {
      await copyAllSections(prompt.sections);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!project || !prompt) {
    return (
      <div className="flex-1 flex items-center justify-center text-center opacity-50 min-h-[calc(100vh-4rem-2rem)]">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-lg">Select or create a project</p>
          <p className="text-sm mt-1">Use the sidebar to get started</p>
        </div>
      </div>
    );
  }

  const sortedSections = getSortedSections(prompt.sections);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <PromptTabs />
        <div className="flex items-center gap-2">
          <TokenCounter />
          <button className="btn btn-sm btn-accent" onClick={handleCopyAll} title="Copy all sections (Cmd+Shift+C)">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H7m14 0l-3-3m0 0l3-3" />
            </svg>
            Copy All
          </button>
        </div>
      </div>

      <div className="divider my-0"></div>

      <div className="py-4 space-y-3" id="textarea-list">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sortedSections.map((section) => (
              <SortableSection key={section.id} section={section} promptId={prompt.id} />
            ))}
          </SortableContext>
        </DndContext>

        <AddSection />
      </div>
    </div>
  );
}

function SortableSection({ section, promptId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex gap-2">
        <div
          className="cursor-grab active:cursor-grabbing flex items-center opacity-30 hover:opacity-70"
          {...listeners}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1">
          <Section section={section} promptId={promptId} />
        </div>
      </div>
    </div>
  );
}
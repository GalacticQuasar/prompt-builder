import { useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { parseBackup } from '../utils/backup';

export function useImportBackup() {
  const { state, importProjects } = useProject();
  const inputRef = useRef(null);
  const [status, setStatus] = useState(null);

  const openPicker = () => {
    setStatus(null);
    inputRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { projects, copiedCount } = parseBackup(await file.text(), new Set(state.projects.map((p) => p.id)));
      if (projects.length === 0) {
        setStatus({ type: 'error', message: 'This backup has no projects.' });
        return;
      }
      await importProjects(projects);
      setStatus({
        type: 'success',
        message: `Imported ${projects.length} project${projects.length !== 1 ? 's' : ''}.` +
          (copiedCount ? ` ${copiedCount} already existed and ${copiedCount !== 1 ? 'were' : 'was'} added as a copy.` : ''),
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Import failed.' });
    }
  };

  const inputProps = {
    ref: inputRef,
    type: 'file',
    accept: 'application/json,.json',
    className: 'hidden',
    onChange: handleFile,
  };

  return { openPicker, inputProps, status };
}

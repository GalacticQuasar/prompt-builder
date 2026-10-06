import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', showDontAskAgain = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleCancel = () => {
    setDontAskAgain(false);
    onCancel();
  };

  const handleConfirm = () => {
    const skipNextTime = dontAskAgain;
    setDontAskAgain(false);
    onConfirm({ dontAskAgain: skipNextTime });
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      handleCancel();
    }
  };

  const handleCancelEvent = (e) => {
    e.preventDefault();
    handleCancel();
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={handleBackdropClick}
      onCancel={handleCancelEvent}
    >
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4">{message}</p>
        {showDontAskAgain && (
          <label className="label cursor-pointer justify-start gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
            />
            Don't ask again
          </label>
        )}
        <div className="modal-action">
          <button className="btn btn-sm" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-sm btn-error" onClick={handleConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
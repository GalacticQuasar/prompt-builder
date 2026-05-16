import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const dialogRef = useRef(null);

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
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      handleCancel();
    }
  };

  const handleCancelEvent = (e) => {
    e.preventDefault();
    onCancel();
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
        <div className="modal-action">
          <button className="btn btn-sm" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-sm btn-error" onClick={handleConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
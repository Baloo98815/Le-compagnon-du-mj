import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      data-testid="confirm-dialog"
    >
      <div className="confirm-dialog-content">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            data-testid="cancel-btn"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            data-testid="confirm-btn"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

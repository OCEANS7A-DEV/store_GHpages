import React from 'react';
import ReactDOM from 'react-dom';

import '../css/orderDialog.css';

interface SaveConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const SaveConfirmDialog: React.FC<SaveConfirmDialogProps> = ({ title, message, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-top">
          <h2>{title}</h2>
          <p>
            {message.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
        <div className="dialog-table">
          <div className='confirm-dialog-button'>
            <button onClick={onConfirm}>OK</button>
            <button onClick={onCancel}>キャンセル</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveConfirmDialog;

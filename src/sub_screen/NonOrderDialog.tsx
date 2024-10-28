// ConfirmDialog.tsx
import React from 'react';
import ReactDOM from 'react-dom';

import '../css/orderDialog.css';

interface NonConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const NonConfirmDialog: React.FC<NonConfirmDialogProps> = ({ title, message, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-top">
          <h2>{title}</h2>
          <p>
            {message}の注文は無しで送信します。よろしいでしょうか？
          </p>
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

export default NonConfirmDialog;

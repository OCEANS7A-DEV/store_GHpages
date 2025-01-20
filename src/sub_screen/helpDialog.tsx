import React from 'react';
import ReactDOM from 'react-dom';
import '../css/orderDialog.css';

interface HelpDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}


const HelpDialog: React.FC<HelpDialogProps> = ({ title, message, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="order-confirm-dialog-overlay">
      <div className="order-confirm-dialog">
        <div className='order-confirm-dialog-button'>
          <button onClick={onConfirm}>OK</button>
          <button onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>,
    document.body
  );
};


export default HelpDialog;
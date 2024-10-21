// ConfirmDialog.tsx
import React from 'react';
import ReactDOM from 'react-dom';

import '../css/ProductDetailDialog.css';

interface DetailDialogProps {
  title: string;
  message: string;
  Data: Array<any>;
  onConfirm: () => void;
  isOpen: boolean;
  image?: string;
  insert: (data: any) => void;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ title, message, Data, onConfirm, isOpen, image, insert}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="detail-dialog-overlay">
      <div className="detail-dialog">
        <div className="detail-top">
          <div className='detail-title'>
            <h2>{title}</h2>
          </div>
          <div className="detail-top-main">
            <p>
              {message.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
            <div className='detail-dialog-button'>
              <button onClick={() => {insert(Data)}}>注文に追加</button>
            </div>
          </div>
        </div>
        <div className="detail-dialog-image">
          {image ? <iframe src={image} title="Product Image"></iframe> : null}
        </div>
        <div>
          <div className='detail-dialog-button'>
            <button onClick={onConfirm}>閉じる</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetailDialog;

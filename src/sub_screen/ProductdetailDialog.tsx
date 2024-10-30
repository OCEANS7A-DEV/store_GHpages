// ConfirmDialog.tsx
import React, { useState, useEffect } from 'react';
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
  nextDatail: () => void;
  beforeDatail: () => void;
  searchDataIndex: number;
  searchtabledata: any;
  addButtonName: string;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ title, message, Data, onConfirm, isOpen, image, insert, searchtabledata, searchDataIndex, nextDatail, beforeDatail, addButtonName}) => {
  if (!isOpen) return null;
  const [isNextButton, setisNextButton] = useState(false);
  const [isBeforeButton, setisBeforeButton] = useState(false);

  useEffect(() => {
    const index = searchtabledata.findIndex(subArray =>
      subArray.length === Data.length &&
      subArray.every((value, i) => value === Data[i])
    );
    console.log(searchtabledata)
    console.log(index)
    if (index > 0){
      setisBeforeButton(true);
    }
    if (index < searchtabledata.length - 1){
      setisNextButton(true);
    }
  },[])


  return ReactDOM.createPortal(
    <div className="detail-dialog-overlay">
      <div className="detail-dialog">
        <div className="detail-top">
          <div className='detail-title'>
            <button disabled={!isBeforeButton} onClick={beforeDatail} style={{
              backgroundColor: isBeforeButton ? '#4CAF50' : 'gray', // 状態に応じて色を変更
              cursor: isBeforeButton ? 'pointer' : 'not-allowed', // 無効時のカーソルを変更
            }}>前の商品へ</button>
            <h2>{title}</h2>
            <button disabled={!isNextButton} onClick={nextDatail} style={{
              backgroundColor: isNextButton ? '#4CAF50' : 'gray', // 状態に応じて色を変更
              cursor: isNextButton ? 'pointer' : 'not-allowed', // 無効時のカーソルを変更
            }}>次の商品へ</button>
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
              <button onClick={() => {insert(Data)}}>{addButtonName}</button>
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


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
  const [priceColumn, setPriceColumn] = useState(4);

  useEffect(() => {
    const index = searchtabledata.findIndex(subArray =>
      subArray.length === Data.length &&
      subArray.every((value, i) => value === Data[i])
    );
    if (index > 0){
      setisBeforeButton(true);
    }
    if (index < searchtabledata.length - 1){
      setisNextButton(true);
    }
    if (localStorage.getItem('StoreSetType') !== 'VC') {
      setPriceColumn(4)
    }else{
      setPriceColumn(5)
    }
  },[])
  //const DetailMessage = `業者名: ${searchData[0] || ''}　　||　　商品ナンバー: ${searchData[1] || ''}\n商品単価: ${(searchData[3] !== undefined && searchData[3] !== null) ? searchData[3].toLocaleString() : ''}円　　||　　店販価格: ${(searchData[5] !== undefined && searchData[5] !== null) ? searchData[5].toLocaleString() : ''}`

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
            <table>
              <tr>
                <td>業者名: {Data[0]}</td>
                <td>商品ナンバー: {Data[1]}</td>
              </tr>
              <tr>
                <td>商品単価: {Data[priceColumn].toLocaleString()}円</td>
                <td>店販価格: {Data[6].toLocaleString()}円</td>
              </tr>
            </table>
            <div className='detail-dialog-button'>
              <button onClick={() => {insert(Data)}}>{addButtonName}</button>
            </div>
          </div>
        </div>
        <div className="detail-dialog-image">
          <img src={image} title="Product Image"/>
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

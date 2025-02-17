
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import '../css/ProductDetailDialog.css';

interface DetailDialogProps {
  title: string;
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

const DetailDialog: React.FC<DetailDialogProps> = ({ title, Data, onConfirm, isOpen, image, insert, searchtabledata, searchDataIndex, nextDatail, beforeDatail, addButtonName}) => {
  if (!isOpen) return null;
  const [isNextButton, setisNextButton] = useState(false);
  const [isBeforeButton, setisBeforeButton] = useState(false);
  const [priceColumn, setPriceColumn] = useState(4);
  const [detailIndex, setDetailIndex] = useState(0);
  const [choiceData, setChoiceData] = useState(['', 0, '', 0, 0, 0, '', '', '', '', '', '']);

  useEffect(() => {
    setDetailIndex(searchDataIndex)
  },[])

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
  },[detailIndex])

  const DetailChange = (changenumber: number) => {
    let nowIndex = detailIndex + (changenumber)
    if (nowIndex >= 0 || nowIndex <= searchtabledata.length){
      setDetailIndex(nowIndex)
    }
    if(nowIndex > 0){
      console.log('true')
      setisBeforeButton(true);
    }else if (nowIndex == 0){
      setisBeforeButton(false);
    }
    if(nowIndex < searchtabledata.length){
      setisNextButton(true);
    }else if (nowIndex == searchtabledata.length){
      setisNextButton(false);
    }
  };

  useEffect(() => {
    const data = searchtabledata[detailIndex]
    setChoiceData(data)
  },[detailIndex])

  return ReactDOM.createPortal(
    <div className="detail-dialog-overlay">
      <div className="detail-dialog">
        <div className="detail-top">
          <div className='detail-title'>
            <button disabled={!isBeforeButton} onClick={() => DetailChange(-1)} style={{
              backgroundColor: isBeforeButton ? '#4CAF50' : 'gray', // 状態に応じて色を変更
              cursor: isBeforeButton ? 'pointer' : 'not-allowed', // 無効時のカーソルを変更
            }}>前の商品へ</button>
            <h2>{choiceData[2]}</h2>
            <button disabled={!isNextButton} onClick={() => DetailChange(1)} style={{
              backgroundColor: isNextButton ? '#4CAF50' : 'gray', // 状態に応じて色を変更
              cursor: isNextButton ? 'pointer' : 'not-allowed', // 無効時のカーソルを変更
            }}>次の商品へ</button>
          </div>
          <div className="detail-top-main">
            <table>
              <tr>
                <td>業者名: {choiceData[0]}</td>
                <td>商品ナンバー: {choiceData[1]}</td>
              </tr>
              <tr>
                <td>商品単価: {choiceData[priceColumn].toLocaleString()}円</td>
                <td>店販価格: {choiceData[6].toLocaleString()}円</td>
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

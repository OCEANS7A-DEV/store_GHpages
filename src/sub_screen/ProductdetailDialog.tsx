
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { InventorySearch, ImageUrlSet } from '../backend/Server_end';
import { MoonLoader } from "react-spinners";

import '../css/ProductDetailDialog.css';

interface DetailDialogProps {
  onConfirm: () => void;
  isOpen: boolean;
  insert: (data: any) => void;
  searchDataIndex: number;
  searchtabledata: any;
  addButtonName: string;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ onConfirm, isOpen, insert, searchtabledata, searchDataIndex, addButtonName}) => {
  if (!isOpen) return null;
  const [isNextButton, setisNextButton] = useState(false);
  const [isBeforeButton, setisBeforeButton] = useState(false);
  const [priceColumn, setPriceColumn] = useState(4);
  const [detailIndex, setDetailIndex] = useState(0);
  const [choiceData, setChoiceData] = useState(['', 0, '', 0, 0, 0, '', '', '', '', '', '']);
  const [ImgURL, setImgURL] = useState('');
  const [imgload, setImgload] = useState(true);

  useEffect(() => {
    setDetailIndex(searchDataIndex)
  },[])

  useEffect(() => {
    const index = searchtabledata.findIndex(subArray =>
      subArray.length === choiceData.length &&
      subArray.every((value, i) => value === choiceData[i])
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
    setImgload(true);
    const data = searchtabledata[detailIndex]
    setChoiceData(data);
    const imgSearch = async () => {
      let match = '';
      const image = await InventorySearch(searchtabledata[detailIndex][1],"商品コード","商品画像");
      if (image[2] !== ''){
        match = ImageUrlSet(image[2]);
      }else {
        match = 'https://lh3.googleusercontent.com/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm'
      }
      setImgURL(match);
    };
    imgSearch()
  },[detailIndex])

  useEffect(() => {
    if(ImgURL !== '') {
      setImgload(false);
    }
  },[ImgURL])

  return ReactDOM.createPortal(
    <div className="detail-dialog-overlay">
      <div className="detail-dialog">
        <div className="detail-top">
          <div className='detail-title'>
            <button disabled={!isBeforeButton} onClick={() => DetailChange(-1)} style={{
              backgroundColor: isBeforeButton ? '#4CAF50' : 'gray', // 状態に応じて色を変更
              cursor: isBeforeButton ? 'pointer' : 'not-allowed', // 無効時のカーソルを変更
            }}>前の商品へ</button>
            <div className="detail-title-main">{choiceData[2]}</div>
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
              <button onClick={() => {insert(choiceData)}}>{addButtonName}</button>
            </div>
          </div>
        </div>
        <div className="detail-dialog-image">
          {imgload ? <MoonLoader loading={imgload} color="blue"/> : <img src={ImgURL} title="Product Image"/>}
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

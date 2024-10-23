import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import '../css/PageSelect.css';


interface SettingProps {
  setCurrentPage: (page: string) => void;
}


export default function InventoryProcessingSelection({ setCurrentPage }: SettingProps){
  const storename = localStorage.getItem('StoreSetName');

  const setOrderpage = () => {
    setCurrentPage('storePage');
  };

  const setUsedpage = () => {
    setCurrentPage('used');
  };

  return (
    <div className="select-window">
      <div className="select-BG">
        <h1>{storename}</h1>
        <h2 className="select-title">在庫処理選択</h2>
        <div className="select-page">
          <button type="button" className="select-button" onClick={setOrderpage}>発注</button>
          <button type="button" className="select-button" onClick={setUsedpage}>使用商品</button>
        </div>
      </div>
    </div>
  );
}

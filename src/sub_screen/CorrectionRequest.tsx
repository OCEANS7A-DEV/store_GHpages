import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/store.css';
import '../css/Request.css';
interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}


export default function CorrectionRequest({ setCurrentPage, setisLoading }: SettingProps) {
  const [selectStore, setSelectStore] = useState('');

  const clickpage = () => {
    setCurrentPage('topPage');
  };
  const RequestInsert = () => {

  };

  useEffect(() => {
    setSelectStore(localStorage.getItem('StoreSetName'))
  })

  return (
    <div className="RequestWindow">
      <div className="window_top">
        <h2 className='store_name'> 修正依頼: {selectStore} 店</h2>
      </div>
      <div className='form_area'>
        <div className="Request_area">
          <input type="date" placeholder='修正対象日'/>
          <textarea className="Request_textarea" rows="5"/>
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 戻る
        </a>
        {/* <a className="buttonUnderlineSt" type="button" onClick={clickcheckpage}>
          履歴へ
        </a> */}
        <a className="buttonUnderlineSt" type="button" onClick={RequestInsert}>修正依頼送信 ＞＞</a>
      </div>
    </div>
  );
};


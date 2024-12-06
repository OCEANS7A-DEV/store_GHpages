import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { localCorrectionRequestListSet } from '../backend/WebStorage';
import Select from 'react-select';
import '../css/store.css';
import '../css/Request.css';


interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}


interface SelectOption {
  value: string;
  label: string;
}

export default function CorrectionRequest({ setCurrentPage, setisLoading }: SettingProps) {
  const [selectStore, setSelectStore] = useState('');
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [subjectSelect, setSubjectSelect] = useState<SelectOption>();
  const [RequestDate, setRequestDate] = useState('');
  const [RequestDetail, setRequestDetail] = useState('');

  const clickpage = () => {
    setCurrentPage('topPage');
  };

  const RequestInsert = () => {
    const RequestInsertList = {
      修正対象: subjectSelect,
      修正対象日: RequestDate,
      修正内容: RequestDetail
    }
    console.log(RequestInsertList);
  };

  const clickRequestHistory = () => {

  };

  const handleSubjectChange= (selectedOption: SelectOption | []) => {
    setSubjectSelect(selectedOption);
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRequestDate(event.target.value)
  };

  const handleDetailChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setRequestDetail(event.target.value)
  };

  useEffect(() => {
    setSelectStore(localStorage.getItem('StoreSetName'))
    localCorrectionRequestListSet()
    const cachedData = localStorage.getItem('CorrectionRequestList');
      setSelectOptions(cachedData ? JSON.parse(cachedData) : []);
  },[])

  return (
    <div className="RequestWindow">
      <div className="window_top">
        <h2 className='store_name'> 修正依頼: {selectStore} 店</h2>
      </div>
      <div className='form_area'>
        <div className="Request_area">
          <div className="Request_Select">
            <Select
              className='Select_custom'
              placeholder="修正対象"
              isSearchable={true}
              value={subjectSelect}
              onChange={handleSubjectChange}
              options={selectOptions}
            />  
          </div>
          <div className="Request_datearea">
            <h3 className="Request_h3">修正内容の修正対象日:　</h3>
            <input
              className="Request_dateinput"
              type="date"
              value={RequestDate}
              max="9999-12-31"
              onChange={(e) => handleDateChange(e)}
            />
          </div>
          <textarea
            className="Request_textarea"
            rows="10"
            placeholder='修正内容入力'
            value={RequestDetail}
            onChange={(e)=> handleDetailChange(e)}
          />
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 戻る
        </a>
        {/* <a className="buttonUnderlineSt" type="button" onClick={clickRequestHistory}>
          修正依頼履歴へ
        </a> */}
        <a className="buttonUnderlineSt" type="button" onClick={RequestInsert}>修正依頼送信 ＞＞</a>
      </div>
    </div>
  );
};


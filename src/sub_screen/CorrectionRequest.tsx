import { useState, ChangeEvent, useEffect } from 'react';
import { localCorrectionRequestListSet } from '../backend/WebStorage';

import { GASPostInsert } from '../backend/Server_end';
import Select from 'react-select';
import '../css/Request.css';
import { Link } from "react-router-dom";

interface SettingProps {
  setisLoading: (value: boolean) => void;
}


interface SelectOption {
  value: string;
  label: string;
}

export default function CorrectionRequest({ setisLoading }: SettingProps) {
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [subjectSelect, setSubjectSelect] = useState(null);
  const [RequestDetail, setRequestDetail] = useState('');



  const RequestInsert = async () => {
    setisLoading(true);
    const RequestInsertList = {
      修正対象: subjectSelect,
      修正内容: RequestDetail
    }
    if (subjectSelect === null){
      alert('修正依頼対象が選択されていません')
      setisLoading(false);
    }else if (RequestDetail.replace(/(\r\n|\n|\r)/g, '') === ''){
      alert('修正内容が入力されていません')
      setisLoading(false);
    }else{
      const result = await GASPostInsert('CorrectionRequestInsert', '修正依頼', RequestInsertList);
      if(result['result']){
        setisLoading(false);
        alert('修正依頼を送信しました。');
        setSubjectSelect(null);
        setRequestDetail('');
      }else{
        setisLoading(false);
        alert('修正依頼の送信が失敗しました。');
      }
    }
  };


  const handleSubjectChange= (selectedOption: SelectOption | []) => {
    setSubjectSelect(selectedOption);
  };

  const handleDetailChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setRequestDetail(event.target.value)
  };

  useEffect(() => {
    const cachedData = localStorage.getItem('CorrectionRequestList');
    setSelectOptions(cachedData ? JSON.parse(cachedData) : []);
  },[])

  return (
    <div className="RequestWindow">
      <div className="window_top">
        <h2 className='store_name'>修正依頼</h2>
      </div>
      <div className='form_area'>
        <div className="Request_area">
          <div className="Request_Select_Area">
            <Select
              classNamePrefix='Request_Select'
              placeholder="修正依頼対象"
              isSearchable={true}
              value={subjectSelect}
              onChange={handleSubjectChange}
              options={selectOptions}
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
        <Link
          to="/top"
          className="buttonUnderlineSt"
        >
          ＜＜ 戻る
        </Link>
        {/* <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 戻る
        </a> */}
        <Link
          to="/requestHistory"
          className="buttonUnderlineSt"
        >
          ＜＜ 修正依頼入力へ
        </Link>
        {/* <a className="buttonUnderlineSt" type="button" onClick={clickRequestHistory}>
          修正依頼履歴へ
        </a> */}
        <a className="buttonUnderlineSt" type="button" onClick={RequestInsert}>修正依頼送信 ＞＞</a>
      </div>
    </div>
  );
};


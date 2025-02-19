import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../css/RequestHistory.css';
import { RequestHistoryGet } from '../backend/Server_end';
import { Link } from "react-router-dom";


//　次回以降作成


const Yearlist = () => {
  let returnData: SelectOption[] = [];
  let today = new Date();
  const year = today.getFullYear();
  for (let i = 0; i < 10; i++){
    const setyear = year - i;
    const labeldata = setyear + "年";
    const DefAsArray: SelectOption = {
      value: setyear,
      label: labeldata,
    };
    returnData.push(DefAsArray);
  }
  return returnData;
};

const MonthList = () => {
  let returnData: SelectOption[] = [];
  for (let i = 0; i < 12; i++){
    const setdata = i + 1;
    const labeldata = setdata + "月";
    const DefAsArray: SelectOption = {
      value: setdata,
      label: labeldata,
    };
    returnData.push(DefAsArray);
  }
  return returnData;
};

interface SelectOption {
  value: number;
  label: string;
}

interface SettingProps {
  setisLoading: (value: boolean) => void;
}


export default function RequestHistory({ setisLoading }: SettingProps) {
  const [years, setyears] = useState<SelectOption>();
  const [yearsOptions, setyearsOptions] = useState<SelectOption[]>([]);
  const [months, setmonths] = useState<SelectOption>();
  const [monthsOptions, setmonthsOptions] = useState<SelectOption[]>([]);
  const storename = localStorage.getItem('StoreSetName') || '';
  const [historydata, sethistorydata] = useState<any[]>([]);

  const handleyearChange = (selectedOption: SelectOption | []) => {
    setyears(selectedOption);
  };

  const handlemonthChange = (selectedOption: SelectOption | []) => {
    setmonths(selectedOption);
  };

  const historysearch = async () => {
    if (!years || !months) {
      alert("年または月が選択されていません");
      return;
    }
    setisLoading(true);
    const searchDate = `${years.value}/${months.value}`;
    const result = await RequestHistoryGet(searchDate,'修正依頼');
    sethistorydata(result);
    setisLoading(false);
  };

  const colorset = (value: string) => {
    if (value == '修正済'){
      return 'green';
    }else if(value == '未修正'){
      return 'red';
    }
  };


  useEffect(() => {
    const yearlist = Yearlist();
    setyearsOptions(yearlist);
    const monthlist = MonthList();
    setmonthsOptions(monthlist);

  },[])

  return (
    <div className="usedhistory-window">
      <div className="history-select-area">
        <Select
          className='year_Select'
          placeholder="年選択"
          isSearchable={true}
          value={years}
          onChange={handleyearChange}
          options={yearsOptions}
        />
        <div className="select-sepa">/</div>
        <Select
          className='month_Select'
          placeholder="月選択"
          isSearchable={true}
          value={months}
          onChange={handlemonthChange}
          options={monthsOptions}
        />
        <a className="buttonUnderlineH" id="main_back" type="button" onClick={historysearch}>
          検索
        </a>
      </div>
      <div className="usedhistory-area">
        <div>
          <table className="usedhistory-table">
            <thead>
                <tr>
                  <th className="requestDate">送信日時</th>
                  <th className="requestCode">修正対象</th>
                  <th className="requestName">修正内容</th>
                  <th className="requestNumber">修正状態</th>
                </tr>
              </thead>
          </table>
        </div>
        <div className='historydata-table'>
          <table className="requesthistory-table">
            <tbody>
              {historydata.map((data, index) => (
                <tr key={index}>
                  <td className="requestDate">{new Date(data[3]).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                      })}</td>
                  <td className="requestCode">{data[0]}</td>
                  <td className="requestName">
                    {data[1].split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </td>
                  <td className="requestNumber" style={{color: colorset(data[4])}}>{data[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="button_area">
        <Link
          to="/request"
          className="buttonUnderlineSt"
        >
          ＜＜ 修正依頼入力へ
        </Link>
        {/* <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 修正依頼入力へ
        </a> */}
      </div>
    </div>
  );
}

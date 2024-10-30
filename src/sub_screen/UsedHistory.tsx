
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../css/store.css';
import '../css/order_history.css';
import '../css/usedHistory.css';
import { HistoryGet, ExplanationImageGet } from '../backend/Server_end.ts';


const Yearlist = () => {
  let returnData = [];
  let today = new Date();
  const year = today.getFullYear();
  for (let i = 0; i < 10; i++){
    const setyear = year - i;
    const DefAsArray = {
      value: setyear,
      label: setyear,
      id: i,
    };
    returnData.push(DefAsArray);
  }
  return returnData;
};

const MonthList = () => {
  let returnData = [];
  for (let i = 0; i < 12; i++){
    const setdata = i + 1;
    const labeldata = setdata + "月";
    const DefAsArray = {
      value: setdata,
      label: labeldata,
      id: i,
    };
    returnData.push(DefAsArray);
  }
  return returnData;
};

interface SelectOption {
  value: string;
  label: string;
  id: number;
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}

function groupDataByFirstColumn(data) {
  const groupedData = {};
  data.forEach(row => {
    const key = row[0];
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(row);
  });
  return groupedData;
}


export default function UsedHistory({ setCurrentPage, setisLoading }: SettingProps) {
  const [years, setyears] = useState<SelectOption | null>(null);
  const [yearsOptions, setyearsOptions] = useState<SelectOption[]>([]);
  const [months, setmonths] = useState<SelectOption | null>(null);
  const [monthsOptions, setmonthsOptions] = useState<SelectOption[]>([]);
  const storename = localStorage.getItem('StoreSetName');
  const [historydata, sethistorydata] = useState<any[]>([]);
  const [explanationIMAGE, setexplanationIMAGE] = useState<string>('');
  const [processlist, setprocesslist] = useState([]);
  const [progressmax, setprogressmax] = useState<number>(0);

  const handleyearChange = (selectedOption: SelectOption | null) => {
    setyears(selectedOption);
  };

  const handlemonthChange = (selectedOption: SelectOption | null) => {
    setmonths(selectedOption);
  };

  const clickpage = () => {
    setCurrentPage('used');
  };

  const historysearch = async () => {
    setisLoading(true)
    const searchDate = `${years.value}/${months.value}`;
    const result = await HistoryGet(searchDate, storename, '店舗使用商品')
    //console.log(result);
    await sethistorydata(result);
    setisLoading(false);
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
          isSearchable={false}
          value={years}
          onChange={handleyearChange}
          options={yearsOptions}
        />
        <div className="select-sepa">/</div>
        <Select
          className='month_Select'
          placeholder="月選択"
          isSearchable={false}
          value={months}
          onChange={handlemonthChange}
          options={monthsOptions}
        />
        <a className="buttonUnderlineH" id="main_back" type="button" onClick={historysearch}>
          検索
        </a>
      </div>
      <div className="usedhistory-area">
        <table className="usedhistory-table">
          <thead>
            <tr>
              <th className="usedDate">月日</th>
              <th className="usedCode">商品ナンバー</th>
              <th className="usedName">商品名</th>
              <th className="usedNumber">数量</th>
              <th className="usedMethod">使用方法</th>
              <th className="usedIndividual">個人購入</th>
              <th className="usedremarks">備考</th>
            </tr>
          </thead>
          <tbody className='usedhistory-datail'>
            {historydata.map((data, index) => (
              <tr key={index}>
                <td>{new Date(data[0]).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                    })}</td>
                <td>{data[2]}</td>
                <td>{data[3]}</td>
                <td>{data[4]}</td>
                <td>{data[5]}</td>
                <td>{data[6]}</td>
                <td>{data[7]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 使用商品入力へ
        </a>
      </div>
    </div>
  );
}




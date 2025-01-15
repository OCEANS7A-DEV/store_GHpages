
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
//import '../css/store.css';
//import '../css/order_history.css';
import '../css/usedHistory.css';
import { HistoryGet } from '../backend/Server_end';


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
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}


export default function UsedHistory({ setCurrentPage, setisLoading }: SettingProps) {
  const [years, setyears] = useState<SelectOption>();
  const [yearsOptions, setyearsOptions] = useState<SelectOption[]>([]);
  const [months, setmonths] = useState<SelectOption>();
  const [monthsOptions, setmonthsOptions] = useState<SelectOption[]>([]);
  const storename = localStorage.getItem('StoreSetName') || '';
  const [historydata, sethistorydata] = useState<any[]>([]);

  const [totalAmount, setTotalAmount] = useState(0);

  const handleyearChange = (selectedOption: SelectOption | []) => {
    setyears(selectedOption);
  };

  const handlemonthChange = (selectedOption: SelectOption | []) => {
    setmonths(selectedOption);
  };

  const clickpage = () => {
    setCurrentPage('used');
  };

  const historysearch = async () => {
    if (!years || !months) {
      alert("年または月が選択されていません");
      return;
    }
    setisLoading(true);
    const searchDate = `${years.value}/${months.value}`;
    const result = await HistoryGet(searchDate, storename, '店舗使用商品','yyyy/MM');
    console.log(result)
    let total = 0;
    for (let i = 0; i < result.length; i++){
      total += result[i][6]
    }
    console.log(total)
    setTotalAmount(total)
    sethistorydata(result);
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
        <div className="usedtotalAmount">
          <h2>{storename} 店: 月間使用合計金額 ¥{totalAmount.toLocaleString('ja-JP')}</h2>
        </div>
      </div>
      <div className="usedhistory-area">
        <div>
          <table className="usedhistory-table">
            <thead>
                <tr>
                  <th className="usedDate">月日</th>
                  <th className="usedCode">商品ナンバー</th>
                  <th className="usedName">商品名</th>
                  <th className="usedNumber">数量</th>
                  <th className="usedNums-th">商品単価</th>
                  <th className="usedNums-th">合計金額</th>
                  <th className="usedMethod">使用方法</th>
                  <th className="usedIndividual">個人購入</th>
                  <th className="usedremarks">備考</th>
                </tr>
              </thead>
          </table>
        </div>
        <div className='historydata-table'>
          <table className="usedhistory-table">
            <tbody>
              {historydata.map((data, index) => (
                <tr key={index}>
                  <td className="dataDate">{new Date(data[0]).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                      })}</td>
                  <td className="dataCode">{data[2]}</td>
                  <td className="usedName">{data[3]}</td>
                  <td className="usedNumber">{data[4]}</td>
                  <td className="usedNums-td">{data[5].toLocaleString('ja-JP')}</td>
                  <td className="usedNums-td">{data[6].toLocaleString('ja-JP')}</td>
                  <td className="dataIndividual">{data[7]}</td>
                  <td className="dataIndividual">{data[8]}</td>
                  <td className="dataRemarks">{data[9]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={() => {setCurrentPage('InventoryNumsSet')}}>
          ＜＜ 在庫数入力へ
        </a>
      </div>
    </div>
  );
}




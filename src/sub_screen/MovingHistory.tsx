
import { useState, useEffect } from 'react';
import Select from 'react-select';
//import '../css/store.css';
//import '../css/order_history.css';
import '../css/MovingHistory.css';
import { MovingHistoryGet } from '../backend/Server_end';


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


export default function MovingHistory({ setCurrentPage, setisLoading }: SettingProps) {
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

  const clickpage = () => {
    setCurrentPage('Moving');
  };

  const historysearch = async () => {
    if (!years || !months) {
      alert("年または月が選択されていません");
      return;
    }
    setisLoading(true);
    const searchDate = `${years.value}/${months.value}`;
    const result = await MovingHistoryGet(searchDate,'店舗間移動');
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
        <div>
          <table className="usedhistory-table">
            <thead>
                <tr>
                  <th className="usedDate">月日</th>
                  <th className="usedMethod">出庫店舗</th>
                  <th className="usedIndividual">入庫店舗</th>
                  <th className="usedCode">商品ナンバー</th>
                  <th className="usedName">商品名</th>
                  <th className="usedNumber">数量</th>
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
                  <td className="dataMethod">{data[1]}</td>    
                  <td className="dataIndividual">{data[2]}</td>
                  <td className="dataCode">{data[3]}</td>
                  <td className="dataName">{data[4]}</td>
                  <td className="dataNumber">{data[5]}</td>
                  <td className="dataRemarks">{data[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 店舗間移動入力へ
        </a>
      </div>
    </div>
  );
}




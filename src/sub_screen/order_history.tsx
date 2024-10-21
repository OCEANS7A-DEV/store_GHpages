import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../css/store.css';
import '../css/order_history.css';
import { HistoryGet, ExplanationImageGet } from '../backend/Server_end.ts';
import OutOfStockStatus from './Out_of_stock_status.tsx';


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


export default function OrderHistory({ setCurrentPage }: SettingProps) {
  const [years, setyears] = useState<SelectOption | null>(null);
  const [yearsOptions, setyearsOptions] = useState<SelectOption[]>([]);
  const [months, setmonths] = useState<SelectOption | null>(null);
  const [monthsOptions, setmonthsOptions] = useState<SelectOption[]>([]);
  const storename = localStorage.getItem('StoreSetName');
  const [historydata, sethistorydata] = useState<any[]>([]);
  const [orderdata, setorderdata] = useState<any>([]);
  const [historyDialogOpen, sethistoryDialogOpen] = useState(false);
  const [historydate, sethistorydate] = useState<string>('');
  const message = `${historydate}の発注です`;
  const [explanationIMAGE, setexplanationIMAGE] = useState<string>('');

  const handleyearChange = (selectedOption: SelectOption | null) => {
    setyears(selectedOption);
  };

  const handlemonthChange = (selectedOption: SelectOption | null) => {
    setmonths(selectedOption);
  };

  const clickpage = () => {
    setCurrentPage('storePage');
  };

  const historysearch = async () => {
    const searchDate = `${years.value}/${months.value}`;
    const result = await HistoryGet(searchDate, storename, '店舗へ')
    const groupeddata = groupDataByFirstColumn(result);
    console.log(groupeddata);
    sethistorydata(groupeddata);
  };

  const handleOpenhistoryDialog = (date) => {
    const validDate = new Date(date);
    if (!isNaN(validDate.getTime())) {
      const Hidata = validDate.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      sethistorydate(Hidata);
    const historyOrderData = historydata[date];
    setorderdata(historyOrderData);
    sethistoryDialogOpen(true);
  }};

  const historyhandleConfirm = () => {
    sethistoryDialogOpen(false);
  };

  const processingdata = (data) => {
    let processing = '';
    if (data === "未印刷"){
      processing = '発注済';
    }else if (data === "印刷済"){
      processing = '処理中';
    }else if (data === "出荷済"){
      processing = '配送中';
    }else if (data === "入庫済"){
      processing = '納品済'
    }
    return processing;
  };

  const progress = (data) => {
    let processing = 0;
    if (data === "未印刷"){
      processing = 1;
    }else if (data === "印刷済"){
      processing = 2;
    }else if (data === "出荷済"){
      processing = 3;
    }else if (data === "入庫済"){
      processing = 4;
    }
    return processing;
  };



  useEffect(() => {
    const yearlist = Yearlist();
    setyearsOptions(yearlist);
    const monthlist = MonthList();
    setmonthsOptions(monthlist);
    const Explanationimageset = async () => {
      const ImageURL = await ExplanationImageGet('進行度合い説明');
      console.log(ImageURL);
      setexplanationIMAGE(ImageURL);
    };
    Explanationimageset();

  },[])
  return (
    <div className="history-window">
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
      <div className="history-area">
        <div className="historys">
          <table className="history-table">
            <thead>
              <tr>
                <th>発注日</th>
                <th>進行状況</th>
                <th>処理状況</th>
              </tr>
            </thead>
            <tbody className='history-datail'>
              {Object.keys(historydata).map((key, index) => (
                <tr key={index}>
                  <td className="history-date">
                    <a className="buttonUnderlineD"  role="button" href="#" onClick={() => handleOpenhistoryDialog(key)}>
                      {new Date(key).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                      })}
                    </a>
                  </td>
                  <OutOfStockStatus
                    title="発注データ"
                    message={message}
                    tableData={orderdata}
                    onConfirm={historyhandleConfirm}
                    isOpen={historyDialogOpen}
                  />
                  <td className="history-progress">
                    <p className="progress">{progress(historydata[key][0][historydata[key][0].length - 1])}/4</p>
                    <progress value={progress(historydata[key][0][historydata[key][0].length - 1])} max="4"/>
                  </td>
                  <td className="history-processing">{processingdata(historydata[key][0][historydata[key][0].length - 1])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hisrtory-explanation">
          <iframe src={explanationIMAGE} className="explanation-image"></iframe>
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineS" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 発注ページへ
        </a>
      </div>
    </div>
  );
}

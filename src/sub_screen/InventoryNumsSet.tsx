import React, { useState, useEffect, ChangeEvent } from 'react';
import Select from 'react-select';
import '../css/store.css';
import { StoreInventoryGet, PeriodDateGet, HistoryGet, CurrentlyAvailableDataGet, syncDataGet, GASPostInsertStore } from '../backend/Server_end';
import '../css/StoreInventory.css';
import HistoryInsertCheck, {HistoryUsedCheck} from './historycheckDialog';
import '../css/usedHistory.css';

interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}

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

interface InsertData {
  商品コード: string;
  商品名: string;
  在庫数: string;
  商品単価: number;
}







export default function StoreInventoryNumsSet({ setCurrentPage, setisLoading }: SettingProps) {
  const [years, setyears] = useState<SelectOption>();
  const [yearsOptions, setyearsOptions] = useState<SelectOption[]>([]);
  const [months, setmonths] = useState<SelectOption>();
  const [monthsOptions, setmonthsOptions] = useState<SelectOption[]>([]);
  const storename = localStorage.getItem('StoreSetName');
  const [AvailableData, setAvailableData] = useState([]);

  const [InventoryNumsData, setInventoryNumsData] = useState([])


  
  const storageGet = JSON.parse(sessionStorage.getItem('data') ?? '');



  const handleyearChange = (selectedOption: SelectOption | []) => {
    setyears(selectedOption);
  };

  const handlemonthChange = (selectedOption: SelectOption | []) => {
    setmonths(selectedOption);
  };

  const syncData = async (column: number, ResultData:any) => {
    const searchData = []
    const data = await syncDataGet();
    for (let i = 0; i < ResultData.length; i++){
      let rowdata = data.find(row => row[0] === ResultData[i][0]);
      searchData.push({
        商品コード: rowdata[0],
        商品名: rowdata[1],
        在庫数: rowdata[column],
      })
    }
    setInventoryNumsData(searchData);
  };


  const findColumnIndex = async () => {
    try {
      // データ取得
      const data = await CurrentlyAvailableDataGet();
      if (!data || data.length < 2) {
        console.error("Data is invalid or empty.");
        return;
      }
  
      // カラムインデックスを取得
      const columnIndex = data[1].indexOf(storename);
      if (columnIndex === -1) {
        console.error("Store name not found in data.");
        return;
      }
  
      // 条件に一致する行をフィルタ
      const ResultData = data.filter(row => row[columnIndex] === true);
      syncData(columnIndex,ResultData)
      // 在庫データ作成
      const InventoryData = ResultData.map(row => {
        const rowdata = storageGet.find(item => item[1] === row[0]);
        if (!rowdata) {
          console.warn("Matching row not found in storageGet for:", row[0]);
          return null; // 見つからない場合はスキップ
        }
        return {
          商品コード: rowdata[1],
          商品名: rowdata[2],
          在庫数: '', // 必要に応じて在庫数を更新
          商品単価: rowdata[4],
          商品タイプ: rowdata[7]
        };
      }).filter(item => item !== null); // nullを削除
  
      // 商品タイプでソート
      const sortedProducts = InventoryData.sort((a, b) => {
        const typeA = parseInt(a.商品タイプ.match(/\[(\d+)\]/)?.[1] || '0', 10);
        const typeB = parseInt(b.商品タイプ.match(/\[(\d+)\]/)?.[1] || '0', 10);
        return typeA - typeB;
      });
  
      // データをセット
      //console.log(sortedProducts);
      setAvailableData(sortedProducts);
    } catch (error) {
      console.error("Error in findColumnIndex:", error);
    }
  };



  const getLastDayOfMonth = (year: number, month: number): string  => {
    // 月は 1 月を 1、2 月を 2 と指定するが、Date コンストラクタでは 0 ベースなので調整
    const lastDate = new Date(year, month, 0); // 翌月の 0 日はその月の月末
    const yyyy = lastDate.getFullYear();
    const mm = String(lastDate.getMonth() + 1).padStart(2, "0");
    const dd = String(lastDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  //修正
  const InventoryDifferenceNumber = () => {
    //console.log(InventoryNumsData)
    if (!years || !months) {
      alert("年または月が選択されていません");
      return;
    }
    const UsedDate = getLastDayOfMonth(years.value, months.value)
    const formatted = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
    const id = sessionStorage.getItem('LoginID');

    const ResultData = []
    for (let i = 0; i < InventoryNumsData.length; i++){

      let resultrow = AvailableData.find(row => row["商品コード"] == InventoryNumsData[i]["商品コード"])
      console.log(resultrow)
      let setnum = 0
      if(resultrow['在庫数'] !== ""){
        setnum += Number(resultrow['在庫数'])
      }

      let resultnum = InventoryNumsData[i]['在庫数'] - setnum
      if (resultnum !== 0) {
        ResultData.push([
          UsedDate,
          storename,
          resultrow['商品コード'],
          resultrow['商品名'],
          resultnum,
          resultrow['商品単価'],
          '=SUM(INDIRECT("E"&ROW()) * INDIRECT("F"&ROW()))',
          '業務',
          '',
          '現在の在庫数により自動計算',
          id,
          formatted,
        ])
      }
    }
    console.log(ResultData)
    //return
    GASPostInsertStore('insert', '店舗使用商品', ResultData)
  }



  const numberchange = async (
    index: number,
    field: keyof InsertData,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const CodeValue = event.target.value.replace(/[^0-9A-Za-z\-]/g, '');
    const newFormData = [...AvailableData];
    newFormData[index][field] = CodeValue;
    setAvailableData(newFormData);
  };


  useEffect(() => {
    const fetchData = async () => {
      setisLoading(true);
      await findColumnIndex()
      const yearlist = Yearlist();
      setyearsOptions(yearlist);
      const monthlist = MonthList();
      setmonthsOptions(monthlist);
      setisLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="store-inventory-window">
      <div className="date-select-area">
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
        <h2 className="store-inventory-h2">{storename}店　在庫数入力</h2>
      </div>
      <div className="in-table-area">
        <div>
          <table className="inventory-head">
            <thead>
              <tr>
                <th className="in-stock-code">商品ナンバー</th>
                <th className="in-stock-name">商品名</th>
                <th className="in-stock-number">在庫数入力</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="inventory-table-area">
          <table className="inventory-table">
            <tbody className="in-stock-table-body">
              {AvailableData.map((row, index) => (
                <tr key={index}>
                  <td className="in-stock-code">{row.商品コード}</td>
                  <td className="in-stock-name">{row.商品名}</td>
                  <td className="in-stock-number">
                    <input
                      type="text"
                      pattern="^[0-9]+$"
                      placeholder="数量"
                      className="in-stock-quantity"
                      inputMode="numeric"
                      value={row.在庫数}
                      onChange={(e) => numberchange(index, '在庫数', e)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={() => setCurrentPage('topPage')}>
          ＜＜ 店舗選択へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={() => setCurrentPage('storeinventory')}>
          店舗在庫一覧
        </a>
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={() => setCurrentPage('usedHistory')}>
          履歴へ
        </a>
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={InventoryDifferenceNumber}>
          在庫数データ送信
        </a>
      </div>
    </div>
  );
}

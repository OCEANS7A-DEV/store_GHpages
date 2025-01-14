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

interface InventoryRow {
  DIcode: string;
  DIname: string;
  DInumber: number;
}

interface InsertData {
  商品コード: string;
  商品名: string;
  在庫数: string;
  商品単価: number;
}


const productSearch = (code: number) => {
  const storageGet = JSON.parse(sessionStorage.getItem('data') ?? '');
  const product = storageGet.find(item => item[1] === code);
  return product;
};




export default function StoreInventoryNumsSet({ setCurrentPage, setisLoading }: SettingProps) {
  const [years, setyears] = useState<SelectOption>();
  const [yearsOptions, setyearsOptions] = useState<SelectOption[]>([]);
  const [months, setmonths] = useState<SelectOption>();
  const [monthsOptions, setmonthsOptions] = useState<SelectOption[]>([]);
  const [InventoryData, setInventoryData] = useState<InventoryRow[]>([]);
  const storename = localStorage.getItem('StoreSetName');
  const [periodDate, setPeriodDate] = useState([]);
  const [monthinsert, setmonthinsert] = useState([]);
  const [monthused, setmonthused] = useState([]);
  const [historyDialogOpenInsert, sethistoryDialogOpenInsert] = useState(false);
  const [historyDialogOpenUsed, sethistoryDialogOpenUsed] = useState(false);
  const [Dialogdata, setDialogdata] = useState([]);
  const [DialogdataU, setDialogdataU] = useState([]);
  const [message, setmessage] = useState<string>('');
  const [AvailableData, setAvailableData] = useState([]);

  const [InventoryNumsData, setInventoryNumsData] = useState([])


  
  const storageGet = JSON.parse(sessionStorage.getItem('data') ?? '');


  const clickpage = () => {
    setCurrentPage('used');
  };

  const Arraymap = (array1, array2, column) => {
    const array2Map = new Map(array2.map(item => [item[0], item]));
    array1.map(item => {
      const number = item[3];
      const quantityToAdd = item[6];
      const matchingArray2 = array2Map.get(number);
      if (matchingArray2) {
        matchingArray2[column] += quantityToAdd;
      }
      return item;
    });
    return Array.from(array2Map.values())
  };

  const ArrayUsedmap = (array1, array2, column) => {
    const array2Map = new Map(array2.map(item => [item[0], item]));
    array1.map(item => {
      const number = item[2];
      const quantityToAdd = item[4];
      const matchingArray2 = array2Map.get(number);
      if (matchingArray2) {
        matchingArray2[column] += quantityToAdd;
      }
      return item;
    });
    return Array.from(array2Map.values())
  };

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
    const id = sessionStorage.getItem('LoginID');
    const data = await CurrentlyAvailableDataGet();
    const columnIndex = data[1].indexOf(storename);
    const ResultData = await data.filter(row => row[columnIndex] === true)
    //console.log(ResultData)
    syncData(columnIndex,ResultData)
    const InventoryData = []
    for (let i = 0; i < ResultData.length; i++){
      let rowdata = storageGet.find(row => row[1] === ResultData[i][0]);
      InventoryData.push({
        商品コード: rowdata[1],
        商品名: rowdata[2],
        在庫数: '',
        商品単価: rowdata[4],
      })
    }
    console.log(InventoryData)
    setAvailableData(InventoryData)
  }

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
    console.log(InventoryNumsData)
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
      //console.log(resultrow) // resultrow[2] ?? 0
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
    return
    GASPostInsertStore('insert', '店舗商品使用', ResultData)
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
      findColumnIndex()


      const yearlist = Yearlist();
      setyearsOptions(yearlist);
      const monthlist = MonthList();
      setmonthsOptions(monthlist);
      const dataget = async () => {
        try {
          const Date = await PeriodDateGet();
          //console.log(Date)
          setPeriodDate(Date);
          const orderData = await HistoryGet(`${Date[0]}/${Date[1]}`, storename, '店舗へ');
          const data = await StoreInventoryGet(storename);
          const Ordermap = await Arraymap(orderData,data,5)
          setmonthinsert(orderData);
          const UsedData = await HistoryGet(`${Date[0]}/${Date[1]}`, storename, '店舗使用商品');
          const RESULTmap = ArrayUsedmap(UsedData,Ordermap,6)
          setmonthused(UsedData);
          setInventoryData(RESULTmap);
        } catch (error) {
          console.error("在庫データの取得中にエラーが発生しました:", error);
        }
      };
      setisLoading(true);
      await dataget();
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
          <HistoryInsertCheck
            title="入庫"
            message={message}
            tableData={Dialogdata}
            onConfirm={() => sethistoryDialogOpenInsert(false)}
            isOpen={historyDialogOpenInsert}
          />
          <HistoryUsedCheck
            title="出庫"
            message={message}
            tableData={DialogdataU}
            onConfirm={() => sethistoryDialogOpenUsed(false)}
            isOpen={historyDialogOpenUsed}
          />
        </div>
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 使用商品入力へ
        </a>
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={InventoryDifferenceNumber}>
          データ確認
        </a>
      </div>
    </div>
  );
}
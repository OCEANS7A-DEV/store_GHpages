import React, { useState, useEffect } from 'react';
import '../css/store.css';
import { StoreInventoryGet, PeriodDateGet, HistoryGet } from '../backend/Server_end.ts';
import '../css/StoreInventory.css';
import HistoryInsertCheck, {HistoryUsedCheck} from './historycheckDialog.tsx';


interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}

interface InventoryRow {
  DIcode: string;
  DIname: string;
  DInumber: number;
}

export default function StoreInventoryList({ setCurrentPage, setisLoading }: SettingProps) {
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

  const clickpage = () => {
    setCurrentPage('used');
  };

  const colorset = (value) => {
    if (value[0] == '+'){
      return 'green';
    }else if(value[0] == '-'){
      return 'red';
    }
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

  const monthInsertDialog = (row) => {
    setmessage(`${row[1]}の${periodDate[0]}年${periodDate[1]}月　入庫データです`);
    const returndata = monthinsert.filter((code) => code[3] == row[0])
    console.log(returndata)
    setDialogdata(returndata)
    sethistoryDialogOpenInsert(true);
  };

  const monthUsedDialog = (row) => {
    setmessage(`${row[1]}の${periodDate[0]}年${periodDate[1]}月　出庫データです`);
    const returndata = monthused.filter((code) => code[2] == row[0])
    console.log(returndata)
    setDialogdataU(returndata)
    sethistoryDialogOpenUsed(true)
  };





  useEffect(() => {
    const fetchData = async () => {
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
      <h2 className="store-inventory-h2">{storename}店　在庫表</h2>
      <div className="in-table-area">
        <div>
          <table className="inventory-head">
            <thead>
              <tr>
                <th className="thDIcode">商品ナンバー</th>
                <th className="thDIname">商品名</th>
                <th className="thDInumber">現状在庫</th>
                <th className="thDIprenumber">{periodDate[1]-1}月末</th>
                <th className="thDIorder">{periodDate[1]}月入</th>
                <th className="thDIused">{periodDate[1]}月出</th>
                <th className="thDIratio">{periodDate[1]-1}月比</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="inventory-table-area">
          <table className="inventory-table">
            <tbody className="inventory-table-body">
              {InventoryData.map((row, index) => (
                <tr key={index}>
                  <td className="DIcode">{row[0]}</td>
                  <td className="DIname">{row[1]}</td>
                  <td className="DInumber">{row[3]}</td>
                  <td className="DIprenumber">{row[2]}</td>
                  <td className="DIorder">
                    <a
                      className="buttonUnderlineIn"
                      role="button"
                      href="#"
                      onClick={() => monthInsertDialog(row)}
                    >
                      {row[5]}
                    </a>
                  </td>
                    <td className="DIused"><a
                      className="buttonUnderlineIn"
                      role="button"
                      href="#"
                      onClick={() => monthUsedDialog(row)}
                    >
                      {row[6]}
                    </a></td>
                  <td className="DIratio" style={{color: colorset(row[4])}}>{row[4]}</td>
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
      </div>
    </div>
  );
}
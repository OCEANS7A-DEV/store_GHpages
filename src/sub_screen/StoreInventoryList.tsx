import React, { useState, useEffect } from 'react';
import '../css/store.css';
import { StoreInventoryGet, PeriodDateGet } from '../backend/Server_end.ts';
import '../css/StoreInventory.css';


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

  useEffect(() => {
    const fetchData = async () => {
      const dataget = async () => {
        try {
          const Date = await PeriodDateGet();
          setPeriodDate(Date);
          console.log(Date)
          const data = await StoreInventoryGet(storename);
          setInventoryData(data);
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
      <div className="in-table-area">
        <div>
          <table className="inventory-head">
            <thead>
              <tr>
                <th className="thDIcode">商品ナンバー</th>
                <th className="thDIname">商品名</th>
                <th className="thDIprenumber">{periodDate[1]}月末</th>
                <th className="thDInumber">現状在庫</th>
                <th className="thDIratio">{periodDate[1]}月比</th>
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
                  <td className="DIprenumber">{row[2]}</td>
                  <td className="DInumber">{row[3]}</td>
                  <td className="DIratio" style={{color: colorset(row[4])}}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
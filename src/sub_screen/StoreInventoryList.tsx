import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/store.css';
import { StoreInventoryGet, HistoryGet } from '../backend/Server_end.ts';
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
  const clickpage = () => {
    setCurrentPage('used');
  };


  useEffect(() => {
    const fetchData = async () => {
      setisLoading(false);
      const dataget = async () => {
        try {
          const data = await StoreInventoryGet('西条東');
          setInventoryData(data);
        } catch (error) {
          console.error("在庫データの取得中にエラーが発生しました:", error);
        }
      };
      await dataget();
      setisLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="store-inventory-window">
      <div className="inventory-table-area">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>商品ナンバー</th>
              <th>商品名</th>
              <th>現状在庫</th>
            </tr>
          </thead>
          <tbody>
            {InventoryData.map((row, index) => (
              <tr key={index}>
                <td className="DIcode">{row[0]}</td>
                <td className="DIname">{row[1]}</td>
                <td className="DInumber">{row[2]}</td>
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
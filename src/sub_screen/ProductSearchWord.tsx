import React, { useState, ChangeEvent, MouseEvent } from 'react';
import '../css/ProductSearchWord.css';
//import '../css/store.css';
import { searchStr } from '../backend/WebStorage';
import DetailDialog from './ProductdetailDialog.tsx';
import { IMAGEGET, InventorySearch } from '../backend/Server_end';


interface SearchProps {
  setsearchData: (data: any) => void;
  setDetailisDialogOpen: (result: boolean) => void;
  setDetailIMAGE: (imageresult: string) => void;
  setisLoading: (loading: boolean) => void;
}

export default function WordSearch({ setsearchData, setDetailisDialogOpen, setDetailIMAGE, setisLoading }: SearchProps) {
  const [SWord, setSWord] = useState<string>(''); // 検索ワードの状態
  const [tableData, setTableData] = useState<any[]>([]); // 検索結果を保存する状態


  // テキスト入力が変更されたときに実行される関数
  const handlewordchange = (event: ChangeEvent<HTMLInputElement>) => {
    setSWord(event.target.value); // 入力された値をSWordにセット
  };

  // 商品の再検索を行い、結果を状態に保存
  const productReSearch = async () => {
    const result = await searchStr(SWord); // 検索関数を実行
    setTableData(result); // 結果を状態にセット
  };

  const handleOpenDetailDialog = async (row: any) => {
    setisLoading(true);
    var match = 'https://drive.google.com/file/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm/preview';// 画像がないとき用のURL
    const image = await InventorySearch(row[1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){// 商品画像のURLがあればそのURLを上書き
      match = image[2];
    }
    await setDetailIMAGE(match);//画像をセット
    await setsearchData(row);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };





  return (
    <div className="WordSearch-area">
      <div className="search-input">
        <input
          type="text"
          value={SWord}
          onChange={handlewordchange}
          placeholder="検索ワードを入力"
        />
        <a className="buttonUnderlineS" type="button" onClick={productReSearch}>
          検索
        </a>
      </div>
      <div className="search-table">
        <table className="search-data-table">
          <thead>
            <tr>
              <th className='stcode'>商品ナンバー</th>
              <th className='stname'>商品名</th>
            </tr>
          </thead>
          <tbody className='datail'>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="scode">{row[1]}</td>
                <td className="sname">
                  <a className="buttonUnderlineD"  role="button" href="#" onClick={() => handleOpenDetailDialog(row)}>{row[2]}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

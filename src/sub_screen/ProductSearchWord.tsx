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
  setsearchtabledata: (tabledata:any) => void;
  searchtabledata: any;
  setsearchDataIndex: (numberdata: number) => void;
  searchDataIndex: number,
}

export default function WordSearch({ setsearchData, setDetailisDialogOpen, setDetailIMAGE, setisLoading, setsearchtabledata, searchtabledata, setsearchDataIndex ,searchDataIndex }: SearchProps) {
  const [SWord, setSWord] = useState<string>('');


  // テキスト入力が変更されたときに実行される関数
  const handlewordchange = (event: ChangeEvent<HTMLInputElement>) => {
    setSWord(event.target.value); // 入力された値をSWordにセット
  };

  // 商品の再検索を行い、結果を状態に保存
  const productReSearch = async () => {
    const result = await searchStr(SWord); // 検索関数を実行
    setsearchtabledata(result); // 結果を状態にセット
  };


  const handleOpenDetailDialog = async (index: any) => {
    console.log(index)
    setsearchDataIndex(index);//ここでエラー
    setisLoading(true);
    var match = 'https://drive.google.com/file/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm/preview';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[index][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){// 商品画像のURLがあればそのURLを上書き
      match = image[2];
    }
    await setDetailIMAGE(match);//画像をセット
    await setsearchData(searchtabledata[index]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };





  return (
    <div className="WordSearch-area">
      <div className="search-input">
        <input
          type="text"
          value={SWord}
          pattern="^[ぁ-ん]+$"
          onChange={handlewordchange}
          placeholder="検索ワードを入力"
        />
        <a className="buttonUnderlineSe" onClick={productReSearch}>
          検索
        </a>
      </div>
      <div className="search-head">
        <table className="search-head">
          <thead>
            <tr>
              <th className="stcode">商品ナンバー</th>
              <th className="stname">商品名</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="search-table">
        <div className="scrollable-table">
          <table className="search-data-table">
            <tbody className="datail">
              {searchtabledata.map((row, index) => (
                <tr key={index}>
                  <td className="scode">{row[1]}</td>
                  <td className="sname">
                    <a
                      className="buttonUnderlineD"
                      role="button"
                      href="#"
                      onClick={() => handleOpenDetailDialog(index)}
                    >
                      {row[2]}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
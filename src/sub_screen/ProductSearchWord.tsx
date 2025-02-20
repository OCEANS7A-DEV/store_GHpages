import { useState, ChangeEvent, useEffect } from 'react';
import '../css/ProductSearchWord.css';
import { searchStr } from '../backend/WebStorage';

import DetailDialog from './ProductdetailDialog';


interface SearchProps {
  setisLoading: (loading: boolean) => void;
  insert: (data: any) => void;
  addButtonName: string;
}

export default function WordSearch({ setisLoading, insert, addButtonName }: SearchProps) {
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);// ダイアログの開閉
  const [searchWord, setSearchWord] = useState<string>('');//　検索ワード
  const [Index, setIndex] = useState(0);// 対象商品の行番号
  const [searchtabledata, setsearchtabledata] = useState<any>([]);// 検索結果

  const [OCtitle,setOCtitle] = useState<string>('商品検索ウィンドウを開きます');
  const [searchArea, setsearchArea] = useState(false);
  const [OCcondition, setOCcondition] = useState<string>(">>");




  const productReSearch = async () => {
    const result = await searchStr(searchWord);
    setsearchtabledata(result);
  };


  const handleOpenDetailDialog = async (index: any) => {
    setIndex(index)
    setisLoading(true);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key == 'Enter'){
      productReSearch();
    }
  };

  const searchAreaconfirm = () => {
    setsearchArea((prevState) => !prevState);
    if (searchArea == true){
      setOCcondition('>>');
      setOCtitle('商品検索ウィンドウを開きます');
    }else{
      setOCcondition('<<');
      setOCtitle('商品検索ウィンドウを閉じます');
    }
  };





  return (
    <>
      <div
        className="searchareawindow"
        style={{
          width: searchArea ? "360px" : "0px", // 表示状態で幅を変える
          overflow: "hidden",
          transition: "width 0.3s ease", // スムーズな変更
        }}
      >
        <div className="WordSearch-area">
          <div className="search-input">
            <input
              type="text"
              value={searchWord}
              pattern="^[ぁ-ん]+$"
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="検索ワードを入力"
              onKeyDown={(e) => handleKeyDown(e)}
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
                      <td className="scode">
                        <a
                          className="buttonUnderlineDR"
                          role="button"
                          href="#"
                          onClick={() => insert(row)}
                        >
                          {row[1]}
                        </a>
                      </td>
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
            <DetailDialog
              onConfirm={() => setDetailisDialogOpen(false)}
              isOpen={DetailisDialogOpen}
              insert={insert}
              searchtabledata={searchtabledata}
              searchDataIndex={Index}
              addButtonName={addButtonName}
            />
          </div>
        </div>
      </div>
      <a
        className="buttonUnderlineOC"
        type="button"
        onClick={searchAreaconfirm}
        title={OCtitle}
      >
        {OCcondition}
      </a>
    </>
  );
}
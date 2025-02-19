import React, { useState, ChangeEvent } from 'react';
import { FormDataKeepSet, KeepFormDataGet } from '../backend/WebStorage';
import { InventorySearch, ImageUrlSet } from '../backend/Server_end';
import WordSearch from './catalogSearch';
import CatalogDetailDialog from './catalog_Dialog';
import '../css/Ocean_catalog.css';
import { Link } from "react-router-dom";


interface SettingProps {
  setisLoading: (value: boolean) => void;
}


export default function OceanCatalog({ setisLoading }: SettingProps) {
  const [searchData, setsearchData] = useState<any>([]);
  const DetailMessage = `業者名: ${searchData[0] || ''}　　||　　商品ナンバー: ${searchData[1] || ''}\n商品単価: ${(searchData[3] !== undefined && searchData[3] !== null) ? searchData[3].toLocaleString() : ''}円　　||　　店販価格: ${(searchData[5] !== undefined && searchData[5] !== null) ? searchData[5].toLocaleString() : ''}`
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [DetailIMAGE, setDetailIMAGE] = useState<string>('');
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [searchDataIndex, setsearchDataIndex] = useState<number>(0);

  const nextDatail = async () => {
    const updateindex = searchDataIndex + 1
    setDetailisDialogOpen(false);
    setsearchDataIndex(updateindex);
    setisLoading(true);
    var match = 'https://lh3.googleusercontent.com/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){// 商品画像のURLがあればそのURLを上書き
      match = ImageUrlSet(image[2]);
    }
    await setDetailIMAGE(match);//画像をセット
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };

  const beforeDatail = async () => {
    const updateindex = searchDataIndex - 1
    setDetailisDialogOpen(false);
    setsearchDataIndex(updateindex);
    setisLoading(true);
    var match = 'https://lh3.googleusercontent.com/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){// 商品画像のURLがあればそのURLを上書き
      match = ImageUrlSet(image[2]);
    }
    await setDetailIMAGE(match);//画像をセット
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };

  const DetailhandleConfirm = () => {
    setDetailisDialogOpen(false);
  };
  const DetailhandleConfirmAdd = () => {
    return
  }






  return (
    <div className="Staff">
      <div className="StaffsearchArea">
        <WordSearch
          className="searcharea"
          setsearchData={setsearchData}
          setDetailisDialogOpen={setDetailisDialogOpen}
          setDetailIMAGE={setDetailIMAGE}
          setisLoading={setisLoading}
          setsearchtabledata={setsearchtabledata}
          searchtabledata={searchtabledata}
          setsearchDataIndex={setsearchDataIndex}
        />
        <CatalogDetailDialog
          Data={searchData}
          title={searchData[2]}
          message={DetailMessage}
          onConfirm={DetailhandleConfirm}
          isOpen={DetailisDialogOpen}
          image={DetailIMAGE}
          insert={DetailhandleConfirmAdd}
          nextDatail={nextDatail}
          beforeDatail={beforeDatail}
          searchtabledata={searchtabledata} searchDataIndex={0}
        />
      </div>
    </div>
  );
}
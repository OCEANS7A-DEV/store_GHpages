import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/InventoryUsed.css';
import { InventorySearch, GASPostInsertStore, processlistGet, ProcessingMethodGet } from '../backend/Server_end';
import MovingDialog from './MovingDialog';
import WordSearch from './ProductSearchWord';
import DetailDialog from './ProductdetailDialog.tsx';



interface UsedInsertData {
  月日: string;
  商品コード: string;
  商品名: string;
  数量: string;
  備考: string;
  出庫店舗: { value: string; label: string }[];
  入庫店舗: { value: string; label: string }[];
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}



interface SelectOption {
  value: string;
  label: string;
}


const colorlistGet = async (code: any) => {
  let returnData: SelectOption[] = [];
  const colorData = await JSON.parse(sessionStorage.getItem(String(code)) ?? '');
  for (let i = 0; i < colorData.length; i++) {
    const DefAsArray = {
      value: colorData[i],
      label: colorData[i],
    };
    returnData.push(DefAsArray);
  }
  return returnData;
};

const usedfieldDataList = ['月日', '商品コード', '商品名', '商品詳細', '数量', '備考'];

const productSearch = (code: number) => {
  const storageGet = JSON.parse(sessionStorage.getItem('data') ?? '');
  const product = storageGet.find(item => item[1] === code);
  return product;
};

const ProcessingMethod: SelectOption[] = [];

const ProcessingMethodList = async () => {
  ProcessingMethod.length = 0;
  const MethodList = await ProcessingMethodGet();
  for (let i = 0; i < MethodList.length; i++) {
    const DefAsArray = {
      value: MethodList[i],
      label: MethodList[i],
    };
    ProcessingMethod.push(DefAsArray);
  }
};

const getCurrentDateTimeJST = () => {
  const date = new Date();
  const options = {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24時間表記
  };

  const formatter = new Intl.DateTimeFormat('ja-JP', options);
  const parts = formatter.formatToParts(date);
  const formattedDate = `${parts[0].value}-${parts[2].value}-${parts[4].value} ${parts[6].value}:${parts[8].value}:${parts[10].value}`;
  return formattedDate;
}


export default function InventoryMoving({ setCurrentPage, setisLoading }: SettingProps) {
  const [isusedDialogOpen, setusedDialogOpen] = useState(false);
  const initialRowCount = 20;
  const initialusedFormData = Array.from({ length: initialRowCount }, () => ({
    月日: '',
    商品コード: '',
    商品名: '',
    数量: '',
    出庫店舗: [],
    入庫店舗: [],
    備考: '',
  }));
  const [usedformData, setusedFormData] = useState<UsedInsertData[]>(initialusedFormData);
  const storename = localStorage.getItem('StoreSetName');
  const dateRefs = useRef([]);
  const outputStoreRefs = useRef([]);
  const inputStoreRefs = useRef([]);
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const remarksRefs = useRef([]);
  const message = "店舗間移動は以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const [searchData, setsearchData] = useState<any>([]);
  const DetailMessage = `業者名: ${searchData[0] || ''}　　||　　商品ナンバー: ${searchData[1] || ''}\n商品単価: ${(searchData[3] !== undefined && searchData[3] !== null) ? searchData[3].toLocaleString() : ''}円　　||　　店販価格: ${(searchData[5] !== undefined && searchData[5] !== null) ? searchData[5].toLocaleString() : ''}`
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [DetailIMAGE, setDetailIMAGE] = useState<string>('');
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [searchDataIndex, setsearchDataIndex] = useState<any>(0);
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [searchArea, setsearchArea] = useState(false);
  const [OCcondition, setOCcondition] = useState<string>(">>");
  const [OCtitle,setOCtitle] = useState<string>('商品検索ウィンドウを開きます');
  const [addType, setADDType] = useState(false);





  const clickpage = () => {
    setCurrentPage('topPage');
  };

  const handleChange = (
    index: number,
    field: keyof UsedInsertData,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newusedFormData = [...usedformData];
    newusedFormData[index][field] = event.target.value;
    setusedFormData(newusedFormData);
  };

  const addNewForm = () => {
    const newusedFormData = [...usedformData];
    for (let i = 0; i < 20; i++) {
      newusedFormData.push({
        月日: '',
        商品コード: '',
        商品名: '',
        数量: '',
        出庫店舗: [],
        入庫店舗: [],
        備考: '',
      });
    }
    setusedFormData(newusedFormData);
  };


  const usedsearchDataChange = async (
    index: number,
    value: any
  ) => {
    const searchresult = productSearch(value);
    const newusedFormData = [...usedformData];
    const updateFormData = (ResultData: any) => {
      if (ResultData !== null) {
        newusedFormData[index] = {
          ...newusedFormData[index],
          商品コード: ResultData[1],
          商品名: ResultData[2],
        };
      }
    };
    try {
      const [ResultData, options] = await Promise.all([
        productSearch(Number(value)),
        colorlistGet(Number(value)),
      ]);
      updateFormData(ResultData);
    } catch (error) {
      const ResultData = await productSearch(Number(value));
      updateFormData(ResultData);
    }
    setusedFormData(newusedFormData);
  };

  const numberchange = async (
    index: number,
    field: keyof UsedInsertData,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const CodeValue = event.target.value.replace(/[^0-9]/g, '');
    const newusedFormData = [...usedformData];
    newusedFormData[index][field] = CodeValue;
    setusedFormData(newusedFormData);
  };

  const insertPost = async () => {
    const formResult = [];
    const date = getCurrentDateTimeJST();
    const id = sessionStorage.getItem('LoginID');
    const filterData = usedformData.filter(row => row.商品コード !== "");

    for (let i = 0; i < filterData.length; i++){
      let setData = [
        filterData[i].月日,
        filterData[i].出庫店舗.value,
        filterData[i].入庫店舗.value,
        filterData[i].商品コード,
        filterData[i].商品名,
        filterData[i].数量,
        filterData[i].備考,
        id,
        date
      ];
      formResult.push(setData)
    }
    GASPostInsertStore('insert', '店舗間移動', formResult);
  };

  const removeForm = (index: number) => {
    const newusedFormData = usedformData.filter((_, i) => i !== index);
    newusedFormData.push({
      月日: '',
      商品コード: '',
      商品名: '',
      数量: '',
      出庫店舗: [],
      入庫店舗: [],
      備考: '',
    });
    setusedFormData(newusedFormData);
    codeRefs.current.splice(index, 1);
    quantityRefs.current.splice(index, 1);
  };

  const handleKeyDown = async (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string) => {
    if (e.key === 'Enter') {
      if (fieldType === '商品コード') {
        if (quantityRefs.current[index]) {
          quantityRefs.current[index].focus();
        }
      }else if(fieldType === '月日'){
        if (outputStoreRefs.current[index]) {
          outputStoreRefs.current[index].focus();
        }
      }else if(fieldType === '出庫'){
        if (inputStoreRefs.current[index]) {
          inputStoreRefs.current[index].focus();
        }
      }else if(fieldType === '入庫'){
        if (codeRefs.current[index]) {
          codeRefs.current[index].focus();
        }
      }else if (fieldType === '数量'){
        if (remarksRefs.current[index]) {
          remarksRefs.current[index].focus();
        }
      } else if (fieldType === '備考') {
        const nextIndex = index + 1;
        if (nextIndex < usedformData.length) {
          if (dateRefs.current[nextIndex]) {
            dateRefs.current[nextIndex].focus();
          }
        } else {
          addNewForm();
          setTimeout(() => {
            if (dateRefs.current[nextIndex]) {
              dateRefs.current[nextIndex].focus();
            }
          }, 0);
        }
      }
    }
  };

  const handleBlur = (index: number, fieldType: '商品コード') => {
    if (usedformData[index][fieldType]) {
      usedsearchDataChange(index, usedformData[index][fieldType]);
    }
  };

  const handleOpenDialog = () => {
    setusedDialogOpen(true);
  };

  const handleConfirm = async () => {
    setisLoading(true);
    var nullset = ['エラー']
    var cancelcount = 0
    var rownumber = 1
    for (const row of usedformData) {
      if (row.商品名 !== "" && row.商品コード == "") {
        nullset.push(`${rownumber}つ目のデータ、商品名はあるが、商品ナンバーが入力されていません。`);
        cancelcount ++
      }
      if (row.月日 == "" && (row.商品名 !== "" || row.商品コード!== "")){
        nullset.push(`${rownumber}つ目のデータ、月日が入力されていません。`);
        cancelcount ++
      }
      if ((row.商品名 !== "" || row.商品コード !== "") && (!row.数量 || row.数量.trim() === "")) {
        nullset.push(`${rownumber}つ目のデータで、商品名または商品ナンバーは入力されていますが、数量が入力されていません。`);
        cancelcount++;
      }
      if ((row.商品名 !== "" || row.商品コード !== "") && (row.出庫店舗 == null || row.入庫店舗 == null)){
        nullset.push(`${rownumber}つ目のデータで、商品名または商品ナンバーは入力されていますが、出庫店舗または入庫店舗が指定されていません。`);
        cancelcount++;
      }

      rownumber ++
    }
    if (cancelcount >= 1) {
      setusedDialogOpen(false);
      alert(nullset.join('\n'));
      setisLoading(false);
      return;
    }
    
    insertPost();
    setusedDialogOpen(false);
    setisLoading(false);
    alert('店舗間移動の入力が完了しました。\n修正があれば修正依頼より修正内容を入力し\n送信してください。');
    localStorage.setItem('Already_ordered', JSON.stringify(usedformData));
    setusedFormData(initialusedFormData);
    localStorage.removeItem(storename);
    setisLoading(false);
  };

  const handleCancel = () => {
    alert('キャンセルされました');
    setusedDialogOpen(false);
  };

  const DetailhandleConfirm = () => {
    setDetailisDialogOpen(false);
  };

  const DetailhandleConfirmAdd = async (data: any) => {
    const Vacant = usedformData.findIndex(({ 商品コード }) => 商品コード === '');
    let returnData = [...usedformData];
    const newData = {
      商品コード: data[1],
      商品名: data[2]
    };

    if (Vacant !== -1){
      if (!usedformData[Vacant].月日){
        newData.月日 = usedformData[Vacant-1].月日
      }
      returnData[Vacant] = {
        ...returnData[Vacant],
        ...newData
      };
    }else{
      setADDType(true);
      if (!usedformData[returnData.length - 1].月日){
        newData.月日 = usedformData[returnData.length - 1].月日
      }
      returnData.push({
        月日: newData.月日,
        商品コード: newData.商品コード,
        商品名: newData.商品名,
        数量: '',
        出庫店舗: [],
        入庫店舗: [],
        備考: '',
      });
    }
    

    await setusedFormData(returnData);
    setDetailisDialogOpen(false);
  };

  useEffect(() => {
    if (addType){
      addNewForm()
      setADDType(false);
    }
  },[addType])

  const clickcheckpage = () => {
    setCurrentPage('MovingHistory');
  };

  const nextDatail = async () => {
    const updateindex = searchDataIndex + 1
    setDetailisDialogOpen(false);
    setsearchDataIndex(updateindex);
    setisLoading(true);
    var match = 'https://drive.google.com/file/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm/preview';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){
      match = image[2];
    }
    await setDetailIMAGE(match);
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };

  const beforeDatail = async () => {
    const updateindex = searchDataIndex - 1
    setDetailisDialogOpen(false);
    setsearchDataIndex(updateindex);
    setisLoading(true);
    var match = 'https://drive.google.com/file/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm/preview';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){
      match = image[2];
    }
    await setDetailIMAGE(match);
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };

  useEffect(() => {
    processlistGet();
    ProcessingMethodList();
    const cachedData = localStorage.getItem('storeData');
    setSelectOptions(cachedData ? JSON.parse(cachedData) : []);
  }, []);

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
    <div className="window_area">
      <div className='window_top'>
        <h2 className='store_name'>店舗間移動用ページ</h2>
      </div>
      <div className='form_area'>
      <div className="searchArea">
          <div
            className="searchareawindow"
            style={{
              width: searchArea ? "360px" : "0px", // 表示状態で幅を変える
              overflow: "hidden",
              transition: "width 0.3s ease", // スムーズな変更
            }}
          >
            <WordSearch
              className="searcharea"
              setsearchData={setsearchData}
              setDetailisDialogOpen={setDetailisDialogOpen}
              setDetailIMAGE={setDetailIMAGE}
              setisLoading={setisLoading}
              setsearchtabledata={setsearchtabledata}
              searchtabledata={searchtabledata}
              setsearchDataIndex={setsearchDataIndex}
              insert={DetailhandleConfirmAdd}
            />
            <DetailDialog
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
              addButtonName='商品移動に追加'
            />
          </div>
          <a
            className="buttonUnderlineOC"
            type="button"
            onClick={searchAreaconfirm}
            title={OCtitle}
            >
            {OCcondition}
          </a>
        </div>
        <div className='in-area'>
          {usedformData.map((data, index) => (
          <div key={index} className="insert_area">
            <input
              type="date"
              className="insert_date"
              max="9999-12-31"
              value={data.月日}
              ref={(el) => (dateRefs.current[index] = el)}
              onKeyDown={(e) => handleKeyDown(index, e, '月日')}
              onChange={(e) => handleChange(index, '月日', e)}
            />            
            <Select
              className="insert_Select"
              key={index}
              options={selectOptions}
              value={usedformData[index].出庫店舗 || []}
              isSearchable={true}
              ref={(el) => (outputStoreRefs.current[index] = el)}
              onKeyDown={(e) => handleKeyDown(index, e, '出庫')}
              onChange={(selectOptions) => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].出庫店舗 = selectOptions;
                setusedFormData(newusedFormData);
              }}
              onFocus={() => {
                const newusedFormData = [...usedformData];
                if(!usedformData[index].月日 && index > 0){
                  newusedFormData[index].月日 = usedformData[index-1].月日
                  setusedFormData(newusedFormData);
                }
                newusedFormData[index].出庫店舗.menuIsOpen = true; // フォーカス時にメニューを開く
                setusedFormData(newusedFormData);
              }}
              onBlur={() => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].出庫店舗.menuIsOpen = false; // フォーカス外れ時にメニューを閉じる
                setusedFormData(newusedFormData);
              }}
              menuPlacement="auto"
              menuPortalTarget={document.body}
              menuIsOpen={usedformData[index].出庫店舗.menuIsOpen}
              placeholder="出庫店舗選択"
            />
            <Select
              className="insert_Select"
              key={index}
              options={selectOptions}
              value={usedformData[index].入庫店舗 || []}
              isSearchable={true}
              ref={(el) => (inputStoreRefs.current[index] = el)}
              onKeyDown={(e) => handleKeyDown(index, e, '入庫')}
              onChange={(selectOptions) => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].入庫店舗 = selectOptions;
                setusedFormData(newusedFormData);
              }}
              onFocus={() => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].入庫店舗.menuIsOpen = true; // フォーカス時にメニューを開く
                setusedFormData(newusedFormData);
              }}
              onBlur={() => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].入庫店舗.menuIsOpen = false; // フォーカス外れ時にメニューを閉じる
                setusedFormData(newusedFormData);
              }}
              menuPlacement="auto"
              menuPortalTarget={document.body}
              menuIsOpen={usedformData[index].入庫店舗.menuIsOpen}
              placeholder="入庫店舗選択"
            />
            <input
              title="入力は半角のみです"
              type="tel"
              pattern="^[0-9\-\/]+$"
              placeholder="商品ナンバー"
              className="insert_code"
              value={data.商品コード}
              ref={(el) => (codeRefs.current[index] = el)}
              onChange={(e) => numberchange(index, '商品コード', e)}
              onKeyDown={(e) => handleKeyDown(index, e, '商品コード')}
              onBlur={() => handleBlur(index, '商品コード')}
              inputMode="numeric"
            />
            <input
              type="text"
              placeholder="商品名"
              className="insert_name"
              value={data.商品名}
              onChange={(e) => handleChange(index, '商品名', e)}
            />
            <input
              type="text"
              pattern="^[0-9]+$"
              placeholder="数量"
              className="insert_quantity"
              inputMode="numeric"
              value={data.数量}
              ref={(el) => (quantityRefs.current[index] = el)}
              onChange={(e) => numberchange(index, '数量', e)}
              onKeyDown={(e) => handleKeyDown(index, e, '数量')}
            />
            <input
              type="text"
              placeholder="備考"
              className="remarks"
              value={data.備考}
              ref={(el) => (remarksRefs.current[index] = el)}
              onChange={(e) => handleChange(index, '備考', e)}
              onKeyDown={(e) => handleKeyDown(index, e, '備考')}
            />
            <button type="button" className="delete_button" onClick={() => removeForm(index)}>
              削除
            </button>
          </div>
        ))}
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 戻る
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={addNewForm}>
          入力枠追加
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={clickcheckpage}>
          履歴へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={handleOpenDialog}>入力内容送信 ＞＞</a>
        <MovingDialog
          title="確認"
          message={message}
          tableData={usedformData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isOpen={isusedDialogOpen}
        />
      </div>
      </div>
    </div>
  );
}
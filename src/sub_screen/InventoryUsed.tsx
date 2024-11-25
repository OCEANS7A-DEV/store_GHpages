import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/InventoryUsed.css';
import { InventorySearch, GASPostInsertStore, processlistGet, ProcessingMethodGet } from '../backend/Server_end';
import UsedDialog from './usedDialog';
import WordSearch from './ProductSearchWord';
import DetailDialog from './ProductdetailDialog.tsx';



interface UsedInsertData {
  月日: string;
  商品コード: string;
  商品名: string;
  数量: string;
  個人購入: string;
  備考: string;
  使用方法: { value: string; label: string }[];
  ProcessingMethod: { value: string; label: string }[];
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

const usedfieldDataList = ['月日', '商品コード', '商品名','数量', '使用方法', '個人購入', '備考'];

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



export default function InventoryUsed({ setCurrentPage, setisLoading }: SettingProps) {
  const [isusedDialogOpen, setusedDialogOpen] = useState(false);
  const initialRowCount = 20;
  const initialusedFormData = Array.from({ length: initialRowCount }, () => ({
    月日: '',
    商品コード: '',
    商品名: '',
    数量: '',
    使用方法: [],
    個人購入: '',
    備考: '',
    ProcessingMethod: []
  }));
  const [usedformData, setusedFormData] = useState<UsedInsertData[]>(initialusedFormData);
  const storename = localStorage.getItem('StoreSetName');
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const personalRefs = useRef([]);
  const remarksRefs = useRef([]);
  const HowToUseRefs = useRef([]);
  const message = "使用商品は以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const CautionaryNote = '日付の確認、使用商品の種類、使用方法、個人購入なら名前の入力など\n間違いがないかよく確認しておいてください。';
  const [searchData, setsearchData] = useState<any>([]);
  const DetailMessage = `業者名: ${searchData[0] || ''}　　||　　商品ナンバー: ${searchData[1] || ''}\n商品単価: ${(searchData[3] !== undefined && searchData[3] !== null) ? searchData[3].toLocaleString() : ''}円　　||　　店販価格: ${(searchData[5] !== undefined && searchData[5] !== null) ? searchData[5].toLocaleString() : ''}`
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [DetailIMAGE, setDetailIMAGE] = useState<string>('');
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [searchDataIndex, setsearchDataIndex] = useState<any>(0);
  const [searchArea, setsearchArea] = useState(false);
  const [OCcondition, setOCcondition] = useState<string>(">>");
  const [OCtitle,setOCtitle] = useState<string>('商品検索ウィンドウを開きます');
  




  const clickpage = () => {
    setCurrentPage('topPage');
  };

  const clickInventorypage = () => {
    setCurrentPage('storeinventory');
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
        使用方法: [],
        個人購入: '',
        備考: '',
        ProcessingMethod: []
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
    await GASPostInsertStore('usedinsert', '店舗使用商品', usedformData, storename);
  };

  const removeForm = (index: number) => {
    const newusedFormData = usedformData.filter((_, i) => i !== index);
    newusedFormData.push({
      月日: '',
      商品コード: '',
      商品名: '',
      数量: '',
      使用方法: [],
      個人購入: '',
      備考: '',
      ProcessingMethod: []
    });
    setusedFormData(newusedFormData);
    codeRefs.current.splice(index, 1);
    quantityRefs.current.splice(index, 1);
  };

  const handleKeyDown = async (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newusedFormData = [...usedformData];
        newusedFormData[index].使用方法 = ProcessingMethod;
      console.log(newusedFormData[index].使用方法[1])
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldType === '商品コード') {
        if (quantityRefs.current[index]) {
          quantityRefs.current[index].focus();
        }
      } else if (fieldType === '数量'){
        if (HowToUseRefs.current[index]) {
          HowToUseRefs.current[index].focus();
        }
      }else if (fieldType === '使用方法'){
        const newusedFormData = [...usedformData];
        newusedFormData[index].使用方法 = ProcessingMethod;
        setusedFormData(newusedFormData);
        if (personalRefs.current[index]) {
          personalRefs.current[index].focus();
        }
      } else if (fieldType === '個人購入'){
        if (remarksRefs.current[index]) {
          remarksRefs.current[index].focus();
        }
      } else if (fieldType === '備考') {
        const nextIndex = index + 1;
        if (nextIndex < usedformData.length) {
          if (codeRefs.current[nextIndex]) {
            codeRefs.current[nextIndex].focus();
          }
        } else {
          addNewForm();
          setTimeout(() => {
            if (codeRefs.current[nextIndex]) {
              codeRefs.current[nextIndex].focus();
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
    if (usedformData[index].商品コード == '' && index >= 1 && usedformData[index].月日 === usedformData[index-1].月日){
      const newusedFormData = [...usedformData];
      newusedFormData[index].月日 = '';
      setusedFormData(newusedFormData);

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
      if ((row.商品名 !== "" || row.商品コード !== "") && row.使用方法 == null){
        nullset.push(`${rownumber}つ目のデータで、商品名または商品ナンバーは入力されていますが、使用方法が指定されていません。`);
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
    alert('使用商品の入力が完了しました。\n修正があれば本部連絡ください。');
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
    let returnData = [...usedformData];
    const newData = {
      商品コード: data[1],
      商品名: data[2]
    };
    let index = 0;
    let dataAdded = false;
    for (let i = 0; i < returnData.length; i++) {
      if (!dataAdded && returnData[i].商品コード === '') {
        if (!usedformData[i].月日){
          newData.月日 = usedformData[i-1].月日
        }
        returnData[i] = {
          ...returnData[i],
          ...newData
        };
        dataAdded = true;
        index = i;
        break;
      }
    }
    if (quantityRefs.current[index]) {
      quantityRefs.current[index].focus();
    }
    setusedFormData(returnData);
    setDetailisDialogOpen(false);
  };
  const clickcheckpage = () => {
    setCurrentPage('usedHistory');
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
  const SelecthandleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string) => {
    if (e.key === 'Enter') {
      if (fieldType === '使用方法'){
        if (personalRefs.current[index]) {
          personalRefs.current[index].focus();
        }
      }
    }
  };

  return (
    <div className="window_area">
      <div className='window_top'>
        <h2 className='store_name'>使用商品入力: {storename} 店</h2>
      </div>
      <div className='form_area'>
      <div className="searchArea">
          <div
            className="searchareawindow"
            style={{
              width: searchArea ? "310px" : "0px", // 表示状態で幅を変える
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
              addButtonName='注文に追加'
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
              value={data.月日}
              onChange={(e) => handleChange(index, '月日', e)}
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
              onFocus={() => {
                const newusedFormData = [...usedformData];
                if(!usedformData[index].月日 && index > 0){
                  newusedFormData[index].月日 = usedformData[index-1].月日
                  setusedFormData(newusedFormData);
                }
              }}
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
            <Select
              className="insert_Select"
              key={index}
              options={ProcessingMethod}
              value={data.使用方法}
              isSearchable={false}
              onChange={(ProcessingMethod) => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].使用方法 = ProcessingMethod;
                setusedFormData(newusedFormData);
                newusedFormData[index].menuIsOpen = false;
              }}
              onFocus={() => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].menuIsOpen = true; // フォーカス時にメニューを開く
                setusedFormData(newusedFormData);
              }}
              onBlur={() => {
                const newusedFormData = [...usedformData];
                newusedFormData[index].menuIsOpen = false; // フォーカス外れ時にメニューを閉じる
                setusedFormData(newusedFormData);
              }}
              menuIsOpen={usedformData[index].menuIsOpen}
              ref={(el) => (HowToUseRefs.current[index] = el)}
              onKeyDown={(e) => SelecthandleKeyDown(index, e, '使用方法')}
              menuPlacement="auto"
              menuPortalTarget={document.body}
              placeholder="方法を選択"
            />
            <input
              type="text"
              placeholder="個人購入"
              className="personal"
              value={data.個人購入}
              ref={(el) => (personalRefs.current[index] = el)}
              onChange={(e) => handleChange(index, '個人購入', e)}
              onKeyDown={(e) => handleKeyDown(index, e, '個人購入')}
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
          ＜＜ 店舗選択へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={addNewForm}>
          入力枠追加
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={clickcheckpage}>
          履歴へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={clickInventorypage}>
          店舗在庫一覧
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={handleOpenDialog}>使用商品送信 ＞＞</a>
        <UsedDialog
          title="確認"
          message={message}
          tableData={usedformData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isOpen={isusedDialogOpen}
          CautionaryNote={CautionaryNote}
        />
      </div>
      </div>
    </div>
  );
}
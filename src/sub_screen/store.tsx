import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/store.css';
import { InventorySearch, GASPostInsertStore, judgmentPOST, processlistGet } from '../backend/Server_end';
import ConfirmDialog from './orderDialog';
import { FormDataKeepSet, KeepFormDataGet } from '../backend/WebStorage';
import WordSearch from './ProductSearchWord';
import SaveConfirmDialog from './SaveConfirmDialog';
import DetailDialog from './ProductdetailDialog.tsx';
import NonConfirmDialog from './NonOrderDialog.tsx';

interface SelectData {
  value: string;
  label: string;
}

interface InsertData {
  業者: string;
  商品コード: string;
  商品名: string;
  商品詳細: { value: string; label: string }[];
  数量: string;
  個人購入: string;
  備考: string;
  selectOptions: { value: string; label: string; id: number }[];
  商品単価: string;
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}

const nullData = [
];





const colorlistGet = async (code: any) => {
  let returnData = [];
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

const fieldDataList = ['業者', '商品コード', '商品名', '商品詳細', '数量', '個人購入', '備考'];

const productSearch = (code: number) => {
  const storageGet = JSON.parse(sessionStorage.getItem('data') ?? '');
  const product = storageGet.find(item => item[1] === code);
  return product;
};

const getNearestMonday = () => {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek <= 3 ? 1 - dayOfWeek : 8 - dayOfWeek;
  const nearestMonday = new Date(date);
  nearestMonday.setDate(date.getDate() + diffToMonday);

  // 年月日を取得してゼロ埋め
  const year = nearestMonday.getFullYear();
  const month = String(nearestMonday.getMonth() + 1).padStart(2, "0"); // 月は0始まりなので+1
  const day = String(nearestMonday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // yyyy-mm-dd形式で返す
};




export default function StorePage({ setCurrentPage, setisLoading }: SettingProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const initialRowCount = 20;
  const initialFormData = Array.from({ length: initialRowCount }, () => ({
    業者: '',
    商品コード: '',
    商品名: '',
    商品詳細: [],
    数量: '',
    個人購入: '',
    備考: '',
    selectOptions: [],
    商品単価: ''
  }));
  const [formData, setFormData] = useState<InsertData[]>(initialFormData);
  const storename = localStorage.getItem('StoreSetName');
  const nonOrderData = [{業者: '-', 商品コード: '-', 商品名: '-', 商品詳細: '-', 数量: '-', 商品単価: '-', 個人購入: '-', 備考: '-'}];
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const personalRefs = useRef([]);
  const remarksRefs = useRef([]);
  const detailRefs = useRef([]);
  const message = "注文内容は以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const [SaveMessage, setSaveMessage] = useState<string>('');
  const [SaveisDialogOpen, setSaveDialogOpen] = useState(false);
  const [Savetype, setSavetype] = useState<string>('');
  const [searchData, setsearchData] = useState<any>([]);
  const DetailMessage = `業者名: ${searchData[0] || ''}　　||　　商品ナンバー: ${searchData[1] || ''}\n商品単価: ${(searchData[3] !== undefined && searchData[3] !== null) ? searchData[3].toLocaleString() : ''}円　　||　　店販価格: ${(searchData[5] !== undefined && searchData[5] !== null) ? searchData[5].toLocaleString() : ''}`
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [DetailIMAGE, setDetailIMAGE] = useState<string>('');
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [searchDataIndex, setsearchDataIndex] = useState<number>(0);
  const [NonisDialogOpen, setNonisDialogOpen] = useState(false);
  const [searchArea, setsearchArea] = useState(false);
  const [OCcondition, setOCcondition] = useState<string>(">>");
  const [OCtitle,setOCtitle] = useState<string>('商品検索ウィンドウを開きます');
  const [addType, setADDType] = useState(false);
  const [defaultDate, setDefaultDate] = useState('');

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultDate(event.target.value);
  };

  const clickpage = () => {
    setCurrentPage('topPage');
  };

  const handleChange = (
    index: number,
    field: keyof InsertData,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newFormData = [...formData];
    newFormData[index][field] = event.target.value;
    setFormData(newFormData);
  };

  const addNewForm = () => {
    const newFormData = [...formData];
    for (let i = 0; i < 20; i++) {
      newFormData.push({
        業者: '',
        商品コード: '',
        商品名: '',
        商品詳細: [],
        数量: '',
        個人購入: '',
        備考: '',
        selectOptions: [],
        商品単価: ''
      });
    }
    setFormData(newFormData);
  };


  const searchDataChange = async (
    index: number,
    value: any
  ) => {
    const searchresult = productSearch(value);
    const newFormData = [...formData];
    const updateFormData = (ResultData: any) => {
      if (ResultData !== null) {
        newFormData[index] = {
          ...newFormData[index],
          ...ResultData.slice(0, 4).reduce((obj, item, i) => ({
            ...obj,
            [fieldDataList[i]]: item,
          }), {}),
          商品単価: ResultData[3],
          商品詳細: formData[index].商品詳細,
        };
      }
    };
    try {
      const [ResultData, options] = await Promise.all([
        productSearch(Number(value)),
        colorlistGet(Number(value)),
      ]);
      if(ResultData[10] === false){
        alert(`商品ナンバー: ${ResultData[1]}, 商品名: ${ResultData[2]}\nこの商品は本部への注文ができません。`)
        const DataIndex = formData.findIndex(({商品コード}) => 商品コード == ResultData[1])
        removeForm(DataIndex)
        return
      }
      updateFormData(ResultData);
      newFormData[index].selectOptions = options || nullData;
    } catch (error) {
      const ResultData = await productSearch(Number(value));
      if(ResultData[10] === false){
        alert(`商品ナンバー: ${ResultData[1]}, 商品名: ${ResultData[2]}\nこの商品は本部への注文ができません。`)
        const DataIndex = formData.findIndex(({商品コード}) => 商品コード == ResultData[1])

        removeForm(DataIndex)
        return
      }
      updateFormData(ResultData);
      newFormData[index].selectOptions = nullData;
    }
    setFormData(newFormData);
  };

  const numberchange = async (
    index: number,
    field: keyof InsertData,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const CodeValue = event.target.value.replace(/[^0-9\-]/g, '');
    const newFormData = [...formData];
    newFormData[index][field] = CodeValue;
    setFormData(newFormData);
  };

  const insertPost = async () => {
    await GASPostInsertStore('insert', '店舗へ', formData, storename, defaultDate);
  };

  const removeForm = (index: number) => {
    const newFormData = formData.filter((_, i) => i !== index);
    newFormData.push({
      業者: '',
      商品コード: '',
      商品名: '',
      商品詳細: [],
      数量: '',
      個人購入: '',
      備考: '',
      selectOptions: [],
      商品単価: ''
    });
    setFormData(newFormData);
    codeRefs.current.splice(index, 1);
    quantityRefs.current.splice(index, 1);
  };

  const handleKeyDown = async (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string,) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldType === '商品コード') {
        if (detailRefs.current[index]) {
          detailRefs.current[index].focus();
          detailRefs.current[index].openMenu();
        }
      }else if (fieldType === '商品詳細'){
        if (quantityRefs.current[index]) {
          quantityRefs.current[index].focus();
        }
      } else if (fieldType === '数量'){
        if (personalRefs.current[index]) {
          personalRefs.current[index].focus();
        }
      } else if (fieldType === '個人購入'){
        if (remarksRefs.current[index]) {
          remarksRefs.current[index].focus();
        }
      } else if (fieldType === '備考') {
        const nextIndex = index + 1;
        if (nextIndex < formData.length) {
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

  const SelecthandleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string) => {
    if (e.key === 'Enter') {
      if (fieldType === '商品詳細'){
        if (quantityRefs.current[index]) {
          quantityRefs.current[index].focus();
        }
      }
    }
  };

  const handleBlur = (index: number, fieldType: '商品コード') => {
    if (formData[index][fieldType]) {
      searchDataChange(index, formData[index][fieldType]);
    }
  };

  const handleOpenDialog = () => {
    console.log(formData)
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setisLoading(true);
    const judgment = await judgmentPOST();
    if (judgment === '発注不可'){
      alert('今回の注文は締め切られています\n次回の注文日で再度お願いします');
      setDialogOpen(false);
    }else{
      var nullset = ['注文データのエラー']
      var cancelcount = 0
      var rownumber = 1
      
      for (const row of formData) {
        console.log(row.商品詳細)
        console.log(row.selectOptions)
        if (row.商品名 !== "" && row.商品コード == "") {
          nullset.push(`${rownumber}つ目のデータ、商品名はあるが、商品ナンバーが入力されていません。`);
          cancelcount ++
        }
        if (row.selectOptions.length > 0 && row.商品詳細 == '') {
          nullset.push(`${rownumber}つ目のデータ、選択肢があるのに、商品詳細が選ばれていません。`);
          cancelcount ++
        }
        if (row.業者 == "" && row.商品名 !== ""){
          nullset.push(`${rownumber}つ目のデータ、商品名はあるが、業者名が入力されていません。`);
          cancelcount ++
        }
        if ((row.商品名 !== "" || row.商品コード !== "") && (!row.数量 || row.数量.trim() === "")) {
          nullset.push(`${rownumber}つ目のデータで、商品名または商品ナンバーは入力されていますが、数量が入力されていません。`);
          cancelcount++;
        }
      }
      if (cancelcount >= 1) {
        setisLoading(false);
        alert(nullset.join('\n'));
        setDialogOpen(false);
        return;
      }
      setisLoading(false);
      insertPost();
      setDialogOpen(false);
      setisLoading(false);
      alert('発注が完了しました\n保存してあるデータは自動で削除されます');
      localStorage.setItem('Already_ordered', JSON.stringify(formData));
      setFormData(initialFormData);
      localStorage.removeItem(storename);
    }
    setisLoading(false);
  };

  const handleCancel = () => {
    alert('キャンセルされました');
    setDialogOpen(false);
  };

  const handleSaveConfirmMessage = (action: string) => {
    if (action === 'save'){
      setSaveMessage("現在の入力内容を保存しますか？");
    }else{
      setSaveMessage("保存済みのデータで現在の入力内容を上書きしますか？");
    }
    setSavetype(action)
    setSaveDialogOpen(true)
  };

  const handleConfirmSave = async () => {
    const result = Savetype;
    if (result === 'save') {
      FormDataKeepSet(formData, storename);
    } else {
      const Data = KeepFormDataGet(storename);
      const saveData: any[] = [];
      const nullData = [];
      for (let i = 0; i < Data.length; i++) {
        let colordata: any[] = [];
        let searchresult: any[] = [];
        if (Data[i].商品コード !== ''){
          try {
            [searchresult, colordata] = await Promise.all([
              productSearch(Number(Data[i].商品コード)),
              colorlistGet(Number(Data[i].商品コード)),
            ]);
            colordata = colordata || [];
          } catch (error) {
            searchresult = await productSearch(Number(Data[i].商品コード));
            colordata = [];
          }
          const pushdata = {
            業者: searchresult[0],  // searchresult が期待通りの構造か要確認
            商品コード: Data[i].商品コード,
            商品名: searchresult[2],
            商品詳細: Data[i].商品詳細,
            数量: Data[i].数量,
            個人購入: Data[i].個人購入,
            備考: Data[i].備考,
            selectOptions: colordata,
            商品単価: searchresult[3],
          };
          saveData.push(pushdata);
        }else{
          saveData.push({
            業者: '',
            商品コード: '',
            商品名: '',
            商品詳細: [],
            数量: '',
            個人購入: '',
            備考: '',
            selectOptions: [],
            商品単価: ''
          });
        }
      }
      setFormData(saveData);
    }
    setSaveDialogOpen(false);
  };

  const handleCancelSave = () => {
    alert('キャンセルされました');
    setSaveDialogOpen(false);
  }

  const DetailhandleConfirm = () => {
    setDetailisDialogOpen(false);
  };

  const DetailhandleConfirmAdd = async (data: any) => {
    if(data[10] === false){
      alert('この商品は注文できません。')
      return
    }
    const Vacant = formData.findIndex(({ 商品コード }) => 商品コード === '');
    let returnData: any[] = [...formData];
    let colordata: any[] = [];
    try {
      colordata = await colorlistGet(Number(data[1]))
      colordata = colordata || [];
    } catch (error) {
      colordata = [];
    }
    const pushdata = {
      業者: data[0],
      商品コード: data[1],
      商品名: data[2],
      商品詳細: [],
      数量: '',
      個人購入: '',
      備考: '',
      selectOptions: colordata,
      商品単価: data[3],
    };

    if (Vacant !== -1){
      returnData[Vacant] = pushdata
    }else{
      setADDType(true);
      returnData.push(pushdata);
    }
    if (detailRefs.current[Vacant]) {
      detailRefs.current[Vacant].focus();
      setTimeout(() => {
        detailRefs.current[Vacant].openMenu();
      }, 10);
      

    }

    
    setFormData(returnData);
    setDetailisDialogOpen(false);
  };


  const clickcheckpage = () => {
    setCurrentPage('History');
  };

  const nextDatail = async () => {
    const updateindex = searchDataIndex + 1
    setDetailisDialogOpen(false);
    setsearchDataIndex(updateindex);
    setisLoading(true);
    var match = 'https://drive.google.com/file/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm/preview';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){// 商品画像のURLがあればそのURLを上書き
      match = image[2];
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
    var match = 'https://drive.google.com/file/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm/preview';// 画像がないとき用のURL
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");// 商品画像検索
    if (image[2] !== ''){// 商品画像のURLがあればそのURLを上書き
      match = image[2];
    }
    await setDetailIMAGE(match);//画像をセット
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
  };

  const NonhandleOpenDialog = () => {
    setNonisDialogOpen(true);
  };

  const NonhandleConfirm = async () => {
    await setisLoading(true);
    await GASPostInsertStore('Noninsert', '店舗へ', nonOrderData, storename);
    setNonisDialogOpen(false);
    setisLoading(false);
    alert('注文無しで送信されました\n注文がある場合はこのまま注文してください');
  };

  const NonhandleCancel = () => {
    setNonisDialogOpen(false);
  };

  useEffect(() => {
    processlistGet();
    const setDate = getNearestMonday();
    setDefaultDate(setDate);
  }, []);

  useEffect(() => {
    if (addType){
      addNewForm()
      setADDType(false);
    }
  },[addType])

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
        <a className="buttonUnderlineSt" type="button" onClick={() => handleSaveConfirmMessage('set')}>
          保存データを反映
        </a>
        <h2 className='store_name'> 注文日:</h2>
        <input
          type="date"
          className="insert_order_date"
          max="9999-12-31"
          value={defaultDate}
          onChange={(e) => {handleDateChange(e)}}
        />
        <h2 className='store_name'> 注文商品入力: {storename} 店</h2>
        <a className="buttonUnderlineSt" type="button" onClick={() => handleSaveConfirmMessage('save')}>
          データを保存
        </a>
        <SaveConfirmDialog
          title="確認"
          message={SaveMessage}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
          isOpen={SaveisDialogOpen}
        />
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
          {formData.map((data, index) => (
          <div key={index} className="insert_area">
            <input
              type="text"
              placeholder="業者"
              className="insert_vendor"
              value={data.業者}
              onChange={(e) => handleChange(index, '業者', e)}
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
            <Select
              className="insert_Select"
              key={index}
              options={data.selectOptions}
              value={formData[index].商品詳細}
              isSearchable={true}
              ref={(el) => (detailRefs.current[index] = el)}
              menuIsOpen={formData[index].menuIsOpen}
              onChange={(selectedOption) => {
                const newFormData = [...formData];
                newFormData[index].商品詳細 = selectedOption;
                setFormData(newFormData);
                newFormData[index].menuIsOpen = false;
              }}
              onFocus={() => {
                const newFormData = [...formData];
                newFormData[index].menuIsOpen = true; // フォーカス時にメニューを開く
                setFormData(newFormData);
              }}
              onBlur={() => {
                const newFormData = [...formData];
                newFormData[index].menuIsOpen = false; // フォーカス外れ時にメニューを閉じる
                setFormData(newFormData);
              }}
              onKeyDown={(e) => SelecthandleKeyDown(index, e, '商品詳細')}
              menuPlacement="auto"
              menuPortalTarget={document.body}
              placeholder="詳細を選択"
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
      </div>
      <div className="button_area">
        <a className="buttonUnderlineSt" id="main_back" type="button" onClick={clickpage}>
          ＜＜ 店舗選択へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={addNewForm}>
          注文枠追加
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={clickcheckpage}>
          発注履歴へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={NonhandleOpenDialog}>
          注文無しの場合
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={handleOpenDialog}>本部へ注文 ＞＞</a>
        <ConfirmDialog
          title="確認"
          message={message}
          tableData={formData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isOpen={isDialogOpen}
        />
        <NonConfirmDialog
          title="確認"
          message={new Date().toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit",day: "2-digit"})}
          onConfirm={NonhandleConfirm}
          onCancel={NonhandleCancel}
          isOpen={NonisDialogOpen}
        />
      </div>
    </div>
  );
}
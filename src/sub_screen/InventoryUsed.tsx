import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/InventoryUsed.css';
import { InventorySearch, GASPostInsertStore, processlistGet, ProcessingMethodGet } from '../backend/Server_end';
import UsedDialog from './usedDialog';
import WordSearch from './ProductSearchWord';
import DetailDialog from './ProductdetailDialog';



interface UsedInsertData {
  月日: string;
  商品コード: string;
  商品名: string;
  数量: string;
  個人購入: string;
  備考: string;
  使用方法: { value: string; label: string }[];
  ProcessingMethod: { value: string; label: string }[];
  商品単価: number;
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
  const product = storageGet.find((item: number[]) => item[1] === code);
  return product;
};

const ProcessingMethod: SelectOption[] = [];

const ProcessingMethodList = async () => {
  const MethodList = await ProcessingMethodGet();
  
  // 新しい配列を生成して上書き
  const testMethod = MethodList.filter((row) => row[0] !== "");

  ProcessingMethod.splice(0, ProcessingMethod.length, ...testMethod.map(method => ({
    value: method[0],
    label: method[0],
  })));
  // ローカルストレージに保存
  localStorage.setItem('processMethodList', JSON.stringify(ProcessingMethod));
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
    ProcessingMethod: [],
    商品単価: 0
  }));
  const [usedformData, setusedFormData] = useState<UsedInsertData[]>(initialusedFormData);
  const storename = localStorage.getItem('StoreSetName');
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const personalRefs = useRef([]);
  const remarksRefs = useRef([]);
  const HowToUseRefs = useRef([]);
  const dateRefs = useRef([]);
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
  const [addType, setADDType] = useState(false);
  




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

  const addNewForm = async () => {
    console.log('空データ追加')
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
        ProcessingMethod: [],
        商品単価: 0
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
          商品単価: ResultData[4],
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
    const id = sessionStorage.getItem('LoginID');

    const now = new Date();

    const formatted = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);

    //console.log(defaultDate)
    const InsertData = [];
    const formfilter = usedformData.filter(row => row.商品コード !== "" && row.商品名 !== "");
    //console.log(formfilter)
    for (let i = 0; i < formfilter.length; i++) {
      let setdata = [
        formfilter[i].月日,
        storename,
        formfilter[i].商品コード,
        formfilter[i].商品名,
        formfilter[i].数量,
        formfilter[i].商品単価,
        '=SUM(INDIRECT("E"&ROW()) * INDIRECT("F"&ROW()))',
        formfilter[i].使用方法.value,
        formfilter[i].個人購入,
        formfilter[i].備考,
        id,
        formatted];
      InsertData.push(setdata);
      
    }
    await GASPostInsertStore('insert', '店舗使用商品', InsertData);
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
      ProcessingMethod: [],
      商品単価: 0
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
      }else if (fieldType === '月日'){
        if (codeRefs.current[index]) {
          codeRefs.current[index].focus();
        }
      }else if (fieldType === '数量'){
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
    alert('使用商品の入力が完了しました。\n修正があれば修正依頼より修正内容を入力し\n送信してください。');
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
    const newData: any = {
      商品コード: data[1],
      商品名: data[2],
    };
  
    console.log(Vacant);
  
    if (Vacant !== -1) {
      // Vacant のチェックと 月日 のガード処理
      if (usedformData[Vacant] && !usedformData[Vacant].月日) {
        newData.月日 = usedformData[Vacant - 1]?.月日 || 'デフォルト値'; // デフォルト値を設定
      }
      returnData[Vacant] = {
        ...returnData[Vacant],
        ...newData,
      };
    } else {
      setADDType(true);
  
      // returnData の長さに基づく 月日 のガード処理
      if (usedformData[returnData.length - 1] && !usedformData[returnData.length - 1].月日) {
        newData.月日 = usedformData[returnData.length - 1]?.月日 || 'デフォルト値';
      }
  
      returnData.push({
        月日: newData.月日,
        商品コード: newData.商品コード,
        商品名: newData.商品名,
        数量: '',
        使用方法: [],
        個人購入: '',
        備考: '',
        ProcessingMethod: [],
      });
    }
  
    // quantityRefs チェック
    if (quantityRefs.current[Vacant]) {
      quantityRefs.current[Vacant].focus();
    }
  
    // データの更新
    await setusedFormData(returnData);
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
    const method = JSON.parse(localStorage.getItem('processMethodList') || "[]");
    console.log(method)
  
    // ローカルストレージのデータをProcessingMethodに上書き
    ProcessingMethod.splice(0, ProcessingMethod.length, ...method);
  
    // ProcessingMethodListでデータを更新

    ProcessingMethodList();
    processlistGet();

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
              width: searchArea ? "360px" : "0px",
              overflow: "hidden",
              transition: "width 0.3s ease",
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
              addButtonName='使用商品に追加'
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
          <div className="in-area-header">
            <table className="order_table_header">
              <thead>
                <tr>
                  <th className="insert_date_header">月日</th>
                  <th className="insert_code_header">商品コード</th>
                  <th className="insert_name_header">商品名</th>
                  <th className="insert_quantity_header">数量</th>
                  <th className="insert_Select_header">使用方法</th>
                  <th className="personal_header">個人購入</th>
                  <th className="remarks_header">備考</th>
                  <th className="delete_button_header">削除<br/>ボタン</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="in-area-table">
            <table className="order_table">
              <tbody>
                {usedformData.map((data, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="date"
                        className="insert_date"
                        value={data.月日}
                        max="9999-12-31"
                        ref={(el) => (dateRefs.current[index] = el)}
                        onChange={(e) => handleChange(index, '月日', e)}
                        onKeyDown={(e) => handleKeyDown(index, e, '月日')}
                      />
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="商品名"
                        className="insert_name"
                        value={data.商品名}
                        onChange={(e) => handleChange(index, '商品名', e)}
                      />
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <Select
                        className="insert_Select"
                        key={index}
                        options={ProcessingMethod}
                        value={data.使用方法}
                        isSearchable={true}
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
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="個人購入"
                        className="personal"
                        value={data.個人購入}
                        ref={(el) => (personalRefs.current[index] = el)}
                        onChange={(e) => handleChange(index, '個人購入', e)}
                        onKeyDown={(e) => handleKeyDown(index, e, '個人購入')}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="備考"
                        className="remarks"
                        value={data.備考}
                        ref={(el) => (remarksRefs.current[index] = el)}
                        onChange={(e) => handleChange(index, '備考', e)}
                        onKeyDown={(e) => handleKeyDown(index, e, '備考')}
                      />
                    </td>
                    <td>
                      <button type="button" className="delete_button" onClick={() => removeForm(index)}>
                        削除
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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
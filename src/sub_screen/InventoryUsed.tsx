import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import '../css/InventoryUsed.css';
import { GASPostInsertStore, processlistGet, ProcessingMethodGet } from '../backend/Server_end';
import UsedDialog from './usedDialog';
import WordSearch from './ProductSearchWord';
import { handleChange,
  productSearch,
  addNewForm,
  removeForm,
  getLoginInfoAndFormattedTime
} from '../backend/BackEnd';


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
  menuIsOpen: boolean;
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}



interface SelectOption {
  value: string;
  label: string;
}

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
  const FormatFormData: UsedInsertData = {
    月日: '',
    商品コード: '',
    商品名: '',
    数量: '',
    使用方法: [],
    個人購入: '',
    備考: '',
    ProcessingMethod: [],
    商品単価: 0,
    menuIsOpen: false
  }
  const [isusedDialogOpen, setusedDialogOpen] = useState(false);
  const initialRowCount = 20;
  const initialusedFormData = Array.from({ length: initialRowCount }, () => (FormatFormData));
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
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [addType, setADDType] = useState(false);
  



  const usedsearchDataChange = async (
    index: number,
    value: any
  ) => {
    if (typeof value === 'number') {
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
      const ResultData = await productSearch(Number(value));
      updateFormData(ResultData);
      setusedFormData(newusedFormData);
    }
    
  };



  const insertPost = async () => {
    const [id, formatted] = await getLoginInfoAndFormattedTime()

    const InsertData = [];
    const formfilter = usedformData.filter(row => row.商品コード !== "" && row.商品名 !== "");
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
          setusedFormData(addNewForm(usedformData, FormatFormData));
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
        商品単価: 0,
        menuIsOpen: false
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


  useEffect(() => {
    const method = JSON.parse(localStorage.getItem('processMethodList') || "[]");
    ProcessingMethod.splice(0, ProcessingMethod.length, ...method);
    ProcessingMethodList();
    processlistGet();

  }, []);

  useEffect(() => {
    if (addType){
      setusedFormData(addNewForm(usedformData, FormatFormData));
      setADDType(false);
    }
  },[addType])


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
          <WordSearch
            className="searcharea"
            setDetailisDialogOpen={setDetailisDialogOpen}
            setisLoading={setisLoading}
            setsearchtabledata={setsearchtabledata}
            searchtabledata={searchtabledata}
            insert={DetailhandleConfirmAdd}
            isOpen={DetailisDialogOpen}
            onConfirm={() => setDetailisDialogOpen(false)}
            addButtonName='使用商品に追加'
          />
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
                        onChange={(e) => setusedFormData(handleChange(index, '月日', e, usedformData))}
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
                        onChange={(e) => setusedFormData(handleChange(index, '商品コード', e, usedformData))}
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
                        onChange={(e) => setusedFormData(handleChange(index, '商品名', e, usedformData))}
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
                        onChange={(e) => setusedFormData(handleChange(index, '数量', e, usedformData))}
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
                        onChange={(e) => setusedFormData(handleChange(index, '個人購入', e, usedformData))}
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
                        onChange={(e) => setusedFormData(handleChange(index, '備考', e, usedformData))}
                        onKeyDown={(e) => handleKeyDown(index, e, '備考')}
                      />
                    </td>
                    <td>
                      <button type="button" className="delete_button" onClick={() => setusedFormData(removeForm(index, usedformData, FormatFormData))}>
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
          <a className="buttonUnderlineSt" id="main_back" type="button" onClick={() => setCurrentPage('topPage')}>
            ＜＜ 店舗選択へ
          </a>
          <a className="buttonUnderlineSt" type="button" onClick={() => setusedFormData(addNewForm(usedformData, FormatFormData))}>
            入力枠追加
          </a>
          <a className="buttonUnderlineSt" type="button" onClick={() => setCurrentPage('usedHistory')}>
            履歴へ
          </a>
          <a className="buttonUnderlineSt" type="button" onClick={() => setCurrentPage('storeinventory')}>
            店舗在庫一覧
          </a>
          <a className="buttonUnderlineSt" type="button" onClick={() => setusedDialogOpen(true)}>使用商品送信 ＞＞</a>
          <UsedDialog
            title="確認"
            message={message}
            tableData={usedformData}
            onConfirm={handleConfirm}
            onCancel={() => {
              alert('キャンセルされました');
              setusedDialogOpen(false);
            }}
            isOpen={isusedDialogOpen}
            CautionaryNote={CautionaryNote}
          />
        </div>
      </div>
    </div>
  );
}
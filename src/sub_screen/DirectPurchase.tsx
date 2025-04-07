import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import '../css/InventoryUsed.css';
import '../css/Direct.css';
import { GASPostInsertStore } from '../backend/Server_end';
import DirectDialog from './DirectDialog';
import WordSearch from './ProductSearchWord';
import { Link } from "react-router-dom";


interface UsedInsertData {
  月日: string;
  商品コード: string;
  商品名: string;
  数量: string;
  備考: string;
}

interface SettingProps {
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


const productSearch = (code: number) => {
  const storageGet = JSON.parse(sessionStorage.getItem('data') ?? '');
  const product = storageGet.find(item => item[1] === code);
  return product;
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

export default function InventoryDirect({ setisLoading }: SettingProps) {
  const [isusedDialogOpen, setusedDialogOpen] = useState(false);
  const initialRowCount = 20;
  const initialusedFormData = Array.from({ length: initialRowCount }, () => ({
    月日: '',
    商品コード: '',
    商品名: '',
    数量: '',
    備考: '',
  }));
  const [usedformData, setusedFormData] = useState<UsedInsertData[]>(initialusedFormData);
  const storename = localStorage.getItem('StoreSetName');
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const dateRefs = useRef([]);
  const remarksRefs = useRef([]);
  const message = "店舗直接購入のデータは以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [searchDataIndex, setsearchDataIndex] = useState<any>(0);
  const [addType, setADDType] = useState(false);






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
        備考: '',
      });
    }
    setusedFormData(newusedFormData);
  };


  const usedsearchDataChange = async (
    index: number,
    value: any
  ) => {
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
    const CodeValue = event.target.value.replace(/[^0-9A-Za-z\-]/g, '');
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
        storename,
        filterData[i].商品コード,
        filterData[i].商品名,
        filterData[i].数量,
        filterData[i].備考,
        id,
        date
      ];
      formResult.push(setData)
    }
    GASPostInsertStore('insert', '直接購入', formResult);
  };

  const removeForm = (index: number) => {
    const newusedFormData = usedformData.filter((_, i) => i !== index);
    newusedFormData.push({
      月日: '',
      商品コード: '',
      商品名: '',
      数量: '',
      備考: '',
    });
    setusedFormData(newusedFormData);
    codeRefs.current.splice(index, 1);
    quantityRefs.current.splice(index, 1);
  };

  const handleKeyDown = async (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldType === '商品コード') {
        if (quantityRefs.current[index]) {
          quantityRefs.current[index].focus();
        }
      }else if (fieldType === '月日'){
        if (codeRefs.current[index]) {
          codeRefs.current[index].focus();
        }
      } else if (fieldType === '数量'){
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
            if (dateRefs.current[nextIndex]) {
              dateRefs.current[nextIndex].focus();
            }
          }, 0);
        }
      }
    }
  };

  const handleBlur = (index: number, fieldType: '商品コード') => {
    //console.log('handleBlur')
    if (usedformData[index][fieldType]) {
      //console.log(usedformData[index][fieldType])
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
    alert('直接購入での入庫の入力が完了しました。\n修正があれば本部連絡ください。');
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
        備考: '',
      });
    }
    if (quantityRefs.current[Vacant]) {
      quantityRefs.current[Vacant].focus();
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



  return (
    <div className="window_area">
      <div className='window_top'>
        <h2 className='store_name'>直接購入での入庫ページ: {storename} 店</h2>
      </div>
      <div className='form_area'>
        <div className="searchArea">
          <WordSearch
            className="searcharea"
            setDetailisDialogOpen={setDetailisDialogOpen}
            setisLoading={setisLoading}
            setsearchtabledata={setsearchtabledata}
            searchtabledata={searchtabledata}
            setsearchDataIndex={setsearchDataIndex}
            insert={DetailhandleConfirmAdd}
            isOpen={DetailisDialogOpen}
            onConfirm={DetailhandleConfirm}
            addButtonName='注文に追加'
          />
        </div>
        <div className='in-area' id='Direct'>
          <div className="in-area-header">
            <table className="order_table_header">
              <thead>
                <tr>
                  <th className="insert_date_header">月日</th>
                  <th className="insert_code_header">商品ナンバー</th>
                  <th className="insert_name_header">商品名</th>
                  <th className="insert_quantity_header">数量</th>
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
                  <td className="insertRowNumber">{index + 1}</td>
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
                  <td className="insert_code_td">
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
        <Link
          to="/top"
          className="buttonUnderlineSt"
        >
          ＜＜ 戻る
        </Link>
          <a className="buttonUnderlineSt" type="button" onClick={addNewForm}>
            入力枠追加
          </a>
          <a className="buttonUnderlineSt" type="button" onClick={handleOpenDialog}>入力内容送信 ＞＞</a>
          <DirectDialog
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
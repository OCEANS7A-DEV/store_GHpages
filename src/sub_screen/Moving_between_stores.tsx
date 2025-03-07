import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import '../css/InventoryUsed.css';
import { GASPostInsertStore, processlistGet, ProcessingMethodGet } from '../backend/Server_end';
import MovingDialog from './MovingDialog';
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
  備考: string;
  出庫店舗: { value: string; label: string }[];
  出庫Open: boolean;
  入庫店舗: { value: string; label: string }[];
  入庫Open: boolean;
  商品単価: number;
}

interface SettingProps {
  setisLoading: (value: boolean) => void;
}



interface SelectOption {
  value: string;
  label: string;
}



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



export default function InventoryMoving({ setisLoading }: SettingProps) {
  const FormatFormData: UsedInsertData = {
    月日: '',
    商品コード: '',
    商品名: '',
    数量: '',
    出庫店舗: [],
    出庫Open: false,
    入庫店舗: [],
    入庫Open: false,
    備考: '',
    商品単価: 0,
  }
  const [isusedDialogOpen, setusedDialogOpen] = useState(false);
  const initialusedFormData = addNewForm([],FormatFormData)
  const [usedformData, setusedFormData] = useState<UsedInsertData[]>(initialusedFormData);
  const storename = localStorage.getItem('StoreSetName');
  const dateRefs = useRef([]);
  const outputStoreRefs = useRef([]);
  const inputStoreRefs = useRef([]);
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const remarksRefs = useRef([]);
  const nameRefs = useRef<HTMLInputElement[]>([]);
  const message = "店舗間移動は以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const [DetailisDialogOpen, setDetailisDialogOpen] = useState(false);
  const [searchtabledata, setsearchtabledata] = useState<any>([]);
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [addType, setADDType] = useState(false);



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
          商品単価: ResultData[4],
        };
      }
    };
    const ResultData = await productSearch(Number(value));
    if (!ResultData){
      if (nameRefs.current[index]) {
        nameRefs.current[index].focus();
      }
      return
    }
    updateFormData(ResultData);
    setusedFormData(newusedFormData);
    
  };



  const insertPost = async () => {
    const formResult = [];
    const [id, date] = await getLoginInfoAndFormattedTime()
    const filterData = usedformData.filter(row => row.商品コード !== "");
    console.log(usedformData)
    for (let i = 0; i < filterData.length; i++){
      let setData = [
        filterData[i].月日,
        filterData[i].出庫店舗[0].value,
        filterData[i].入庫店舗.value,
        filterData[i].商品コード,
        filterData[i].商品名,
        filterData[i].数量,
        filterData[i].商品単価,
        '=SUM(INDIRECT("F"&ROW()) * INDIRECT("G"&ROW()))',
        filterData[i].備考,
        id,
        date
      ];
      formResult.push(setData)
    }
    
    GASPostInsertStore('insert', '店舗間移動', formResult);
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
          addNewForm(usedformData,FormatFormData);
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
        商品単価: 0,
        出庫店舗: [],
        出庫Open: false,
        入庫店舗: [],
        入庫Open: false,
        備考: '',
      });
    }
    

    await setusedFormData(returnData);
    setDetailisDialogOpen(false);
  };

  useEffect(() => {
    if (addType){
      setusedFormData(addNewForm(usedformData, FormatFormData));
      setADDType(false);
    }
  },[addType])

  useEffect(() => {
    processlistGet();
    ProcessingMethodList();
    const cachedData = localStorage.getItem('storeData');
    setSelectOptions(cachedData ? JSON.parse(cachedData) : []);
  }, []);


  return (
    <div className="window_area">
      <div className='window_top'>
        <h2 className='store_name'>店舗間移動用ページ</h2>
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
            addButtonName='商品移動に追加'
          />
        </div>
        <div className='in-area'>
          <div className="in-area-header">
            <table className="order_table_header">
              <thead>
                <tr>
                  <th className="insert_date_header">月日</th>
                  <th className="insert_store_header">出庫店舗</th>
                  <th className="insert_store_header">入庫店舗</th>
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
                    <td>
                      <input
                        type="date"
                        className="insert_date"
                        max="9999-12-31"
                        value={data.月日}
                        ref={(el) => (dateRefs.current[index] = el)}
                        onKeyDown={(e) => handleKeyDown(index, e, '月日')}
                        onChange={(e) => setusedFormData(handleChange(index, '月日', e, usedformData))}
                      />
                    </td>
                    <td>
                      <Select
                        className="insert_Select"
                        key={index}
                        options={selectOptions}
                        value={data.出庫店舗 || []}
                        isSearchable={true}
                        ref={(el) => (outputStoreRefs.current[index] = el)}
                        onKeyDown={(e) => handleKeyDown(index, e, '出庫')}
                        onChange={(selectOptions) => {
                          const newusedFormData = [...usedformData];
                          console.log(newusedFormData)
                          newusedFormData[index].出庫店舗 = selectOptions ? [{ ...selectOptions }] : [];
                          usedformData[index].出庫Open = false;
                          setusedFormData(newusedFormData);
                        }}
                        onFocus={() => {
                          const newusedFormData = [...usedformData];
                          if(!usedformData[index].月日 && index > 0){
                            newusedFormData[index].月日 = usedformData[index-1].月日
                            setusedFormData(newusedFormData);
                          }
                          usedformData[index].出庫Open = true; // フォーカス時にメニューを開く
                          setusedFormData(newusedFormData);
                        }}
                        onBlur={() => {
                          const newusedFormData = [...usedformData];
                          usedformData[index].出庫Open = false; // フォーカス外れ時にメニューを閉じる
                          setusedFormData(newusedFormData);
                        }}
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuIsOpen={usedformData[index].出庫Open}
                        placeholder="出庫店舗選択"
                      />
                    </td>
                    <td>
                      <Select
                        className="insert_Select"
                        key={index}
                        options={selectOptions}
                        value={data.入庫店舗 || []}
                        isSearchable={false}
                        ref={(el) => (inputStoreRefs.current[index] = el)}
                        onKeyDown={(e) => handleKeyDown(index, e, '入庫')}
                        onChange={(selectOptions) => {
                          const newusedFormData = [...usedformData];
                          newusedFormData[index].入庫店舗 = selectOptions || [];
                          usedformData[index].入庫Open = false;
                          setusedFormData(newusedFormData);
                        }}
                        onFocus={() => {
                          const newusedFormData = [...usedformData];
                          usedformData[index].入庫Open = true; // フォーカス時にメニューを開く
                          setusedFormData(newusedFormData);
                        }}
                        onBlur={() => {
                          const newusedFormData = [...usedformData];
                          usedformData[index].入庫Open = false; // フォーカス外れ時にメニューを閉じる
                          setusedFormData(newusedFormData);
                        }}
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        menuIsOpen={usedformData[index].入庫Open}
                        placeholder="入庫店舗選択"
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
                        onChange={(e) => setusedFormData(handleChange(index, '商品コード', e, usedformData))}
                        onKeyDown={(e) => handleKeyDown(index, e, '商品コード')}
                        onBlur={() => handleBlur(index, '商品コード')}
                        inputMode="numeric"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="商品名"
                        className="insert_name"
                        value={data.商品名}
                        ref={(el) => {
                          if (el) {
                            nameRefs.current[index] = el
                          }
                        }}
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
          ＜＜ 戻る
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={() => setusedFormData(addNewForm(usedformData, FormatFormData))}>
          入力枠追加
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={() => setCurrentPage('MovingHistory')}>
          履歴へ
        </a>
        <a className="buttonUnderlineSt" type="button" onClick={() => setusedDialogOpen(true)}>入力内容送信 ＞＞</a>
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
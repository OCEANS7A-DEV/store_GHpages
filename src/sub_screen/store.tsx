import React, { useState, useRef, useEffect } from 'react';

import { Link } from "react-router-dom";

import Select from 'react-select';

import '../css/store.css';

import { HistoryGet, GASPostInsertStore, judgmentPOST, proccessReceiving } from '../backend/Server_end';

import ConfirmDialog from './orderDialog';

import { FormDataKeepSet, KeepFormDataGet } from '../backend/WebStorage';

import WordSearch from './ProductSearchWord';

import NonConfirmDialog from './NonOrderDialog';

import OutOfStockStatus from './Out_of_stock_status';


import { handleChange,
  productSearch,
  addNewForm,
  removeForm,
  colorlistGet,
  groupDataByFirstColumn,
  ProcessListGet,
  getLoginInfoAndFormattedTime
} from '../backend/BackEnd';



interface InsertData {
  業者: string;
  商品コード: string;
  商品名: string;
  商品詳細: { value: string; label: string; }[];
  数量: string;
  個人購入: string;
  備考: string;
  selectOptions: { value: string; label: string; }[];
  商品単価: string;
  menuIsOpen: boolean;
}

interface SettingProps {
  setisLoading: (value: boolean) => void;
}



const fieldDataList = ['業者', '商品コード', '商品名', '商品詳細', '数量', '個人購入', '備考'];


const getNearestMonday = () => {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek <= 3 ? 1 - dayOfWeek : 8 - dayOfWeek;
  const nearestMonday = new Date(date);
  nearestMonday.setDate(date.getDate() + diffToMonday);
  const year = nearestMonday.getFullYear();
  const month = String(nearestMonday.getMonth() + 1).padStart(2, "0");
  const day = String(nearestMonday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};






export default function StorePage({ setisLoading }: SettingProps) {
  const FormatFormData: InsertData = {
    業者: '',
    商品コード: '',
    商品名: '',
    商品詳細: [],
    数量: '',
    個人購入: '',
    備考: '',
    selectOptions: [],
    商品単価: '',
    menuIsOpen: false
  }
  const [isDialogOpen, setDialogOpen] = useState(false);
  const initialRowCount = 20;
  const initialFormData = Array.from({ length: initialRowCount }, () => (FormatFormData));
  const storename = localStorage.getItem('StoreSetName') ?? "";
  const [formData, setFormData] = useState<InsertData[]>(KeepFormDataGet(storename));

  const codeRefs = useRef<HTMLInputElement[]>([]);
  const quantityRefs = useRef<HTMLInputElement[]>([]);
  const personalRefs = useRef<HTMLInputElement[]>([]);
  const remarksRefs = useRef<HTMLInputElement[]>([]);
  const nameRefs = useRef<HTMLInputElement[]>([]);
  const detailRefs = useRef<HTMLInputElement[]>([]);

  const message = "注文内容は以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const [NonisDialogOpen, setNonisDialogOpen] = useState(false);
  const [addType, setADDType] = useState(false);
  const [defaultDate, setDefaultDate] = useState('');
  const [OrderStatus, setOrderStatus] = useState('更新中...');
  const [OrderStatusColor, setOrderStatusColor] = useState('black');
  const [historyDialogOpen, sethistoryDialogOpen] = useState(false);
  const [orderdata, setorderdata] = useState<any>([]);
  const [processlist, setprocesslist] = useState([]);
  const [progressmax, setprogressmax] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isDisabledTitle, setIsDisabledTitle] = useState('');

  const storeType = localStorage.getItem('StoreSetType');
  const progressColumnBehindNumber = 3;
  
  const confirmationMessage = `${new Date(defaultDate).toLocaleDateString("ja-JP")}の注文状況です`;


  const DateStatedata = async () => {
    //const status = sessionStorage.getItem()
    setOrderStatus('更新中...');
    setOrderStatusColor('black');
    const date = new Date(defaultDate);
    const year = date.getFullYear();
    const result = await HistoryGet(String(year), storename, '店舗へ', 'yyyy');
    const groupeddata = await groupDataByFirstColumn(result);
    const Dates = Object.keys(groupeddata);
    const status = sessionStorage.getItem(storename)
    if(status && status == date.toLocaleDateString("ja-JP")){
      console.log(status)
      setOrderStatus('注文有');
      setOrderStatusColor('green');
    }else{
      const japanDates = Dates.map(Dates => {
        const date = new Date(Dates);
        return date.toLocaleDateString("ja-JP");
      });
      const researchDate = date.toLocaleDateString("ja-JP");
      const dateIndex = japanDates.indexOf(researchDate);

      if (dateIndex !== -1) {  // 修正: `-1` かどうかをチェック
        const targetOrderDate = Dates[dateIndex];  // `dateIndex` が -1 のときエラー防止
        if (targetOrderDate) {  // `undefined` のチェック
          setorderdata(groupeddata[targetOrderDate]);
        }else {
          setorderdata([])
        }
        
      }

      if(japanDates.includes(researchDate)){
        setOrderStatus('注文有');
        setOrderStatusColor('green');
      }else{
        setOrderStatus('未注文');
        setOrderStatusColor('red');
      }
    }
    
  }


  const progress = () => {
    let processing = '';
    if(orderdata.length > 0){
      const data = orderdata[0][orderdata[0].length - progressColumnBehindNumber]
      processing = processlist[data][1];
    }
    console.log(processing);
    return processing;
  };

  useEffect(() => {
    DateStatedata();
  },[defaultDate])


  const searchDataChange = async (
    index: number,
    value: any
  ) => {

    const newFormData: InsertData[] = [...formData];

    const updateFormData = (resultData: any) => {
      let price = 0;
      if (storeType === "DM" || storeType === "FC"){
        price = resultData[4]
      }else{
        price = resultData[5]
      }
      if (resultData !== null) {
        newFormData[index] = {
          ...newFormData[index],
          ...resultData.slice(0, 4).reduce((obj, item, i) => ({
            ...obj,
            [fieldDataList[i]]: item,
          }), {}),
          商品単価: price,
          商品詳細: formData[index].商品詳細,
        };
      }
    };
    

    const [ResultData, options] = await Promise.all([
      productSearch(Number(value)),
      colorlistGet(Number(value)),
    ]);

    if (!ResultData){
      if (nameRefs.current[index]) {
        nameRefs.current[index].focus();
      }
      return
    }

    if(ResultData[9] === false){
      alert(`商品ナンバー: ${ResultData[1]}, 商品名: ${ResultData[2]}\nこの商品は本部への注文ができません。`)
      const DataIndex = formData.findIndex(({商品コード}) => 商品コード == ResultData[1])
      setFormData(removeForm(DataIndex,formData,FormatFormData))
      return
    }
    updateFormData(ResultData);
    newFormData[index].selectOptions = options || [];
    
    if(options.length === 0) {
      if (quantityRefs.current[index]) {
        quantityRefs.current[index].focus();
      }
    }else{
      if (detailRefs.current[index]) {
        detailRefs.current[index].focus(); 
        newFormData[index].menuIsOpen = true;
      };
    }
    setFormData(newFormData);
  
  };



  const insertPost = async () => {
    const [id, formatted] = await getLoginInfoAndFormattedTime()

    const InsertData = [];
    const formfilter = formData.filter(row => row.商品コード !== "" && row.商品名 !== "");

    for (let i = 0; i < formfilter.length; i++) {
      const detail = formfilter[i].商品詳細[0]?.value || '';
      let service = ''
      let ordernum = 0
      let count = 0
      if(storename == '会議室'){
        const data = await productSearch(formfilter[i].商品コード)
        if(data[10] !== ""){
          while(ordernum < formfilter[i].数量){
            ordernum = ordernum + data[11] + data[10]
            count ++
          }
          service = count * data[10]
        }
      }
      let setdata = [
        defaultDate,
        storename,
        formfilter[i].業者,
        formfilter[i].商品コード,
        formfilter[i].商品名,
        detail,
        formfilter[i].数量,
        service,
        formfilter[i].商品単価,
        '=SUM(INDIRECT("G"&ROW()) * INDIRECT("I"&ROW()))',
        formfilter[i].個人購入,
        formfilter[i].備考,
        "未印刷",
        id,
        formatted];
      InsertData.push(setdata);
    }

    GASPostInsertStore('insert', '店舗へ', InsertData);
    const date = new Date(defaultDate);
    sessionStorage.setItem(storename,date.toLocaleDateString("ja-JP"))
  };

  const valueset = (index:number) => {
    let searchValue = formData[index].商品コード;
    if(index >= 1 && formData[index].商品コード === ''){
      searchValue = formData[index - 1].商品コード
    }

    return searchValue;
  }


  const handleKeyDown = async (index: number, e: React.KeyboardEvent<HTMLInputElement>, fieldType: string,) => {
    
    if (e.key === 'Enter' && fieldType !== '商品詳細') {
      e.preventDefault();
      if (fieldType === '商品コード') {
        let searchValue = await valueset(index);
        searchDataChange(index, searchValue)
      }else if (fieldType === '業者') {
        if (codeRefs.current[index]) {
          codeRefs.current[index].focus();
        }
      }else if (fieldType === '商品名'){
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
          setFormData(addNewForm(formData, FormatFormData));
          setTimeout(() => {
            if (codeRefs.current[nextIndex]) {
              codeRefs.current[nextIndex].focus();
            }
          }, 0);
        }
      }
    }else if (e.key === 'Enter' && fieldType === '商品詳細') {
      if (quantityRefs.current[index]) {
        quantityRefs.current[index].focus();
      }
    }
  };


  const handleBlur = (index: number, fieldType: '商品コード', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (formData[index][fieldType]) {
      searchDataChange(index, formData[index][fieldType]);
    }
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
        if (row.商品名 !== "" && row.商品コード == "") {
          nullset.push(`${rownumber}つ目のデータ、商品名はあるが、商品ナンバーが入力されていません。`);
          cancelcount ++
        }
        if (row.selectOptions.length > 0 && !row.商品詳細) {
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
      //addNewForm([],FormatFormData)
      setFormData(addNewForm([],FormatFormData));
      localStorage.removeItem(storename);
    }
    setisLoading(false);
    DateStatedata();
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
      商品単価: data[4],
    };
    if (Vacant !== -1){
      returnData[Vacant] = pushdata
    }else{
      setADDType(true);
      returnData.push(pushdata);
    }
    // if (detailRefs.current[Vacant]) {
    //   detailRefs.current[Vacant].focus();
    // }

    
    setFormData(returnData);
    //setDetailisDialogOpen(false);
  };


  const NonhandleOpenDialog = () => {
    setNonisDialogOpen(true);
  };

  const NonhandleConfirm = async () => {
    await setisLoading(true);

    const [id, formatted] = await getLoginInfoAndFormattedTime()

    const nonOrderData = [[
      defaultDate,
      storename,
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "注文無",
      id,
      formatted],
    ]
    await GASPostInsertStore('insert', '店舗へ', nonOrderData);
    setNonisDialogOpen(false);
    setisLoading(false);
    alert('注文無しで送信されました\n注文がある場合はこのまま注文してください');
  };


  const DisabledChange = async () => {
    const userType = await sessionStorage.getItem('authority');
    if(userType !== '店舗'){
      setIsDisabled(false);
      setIsDisabledTitle('操作可能');
    }else{
      setIsDisabled(true);
      setIsDisabledTitle('自動で設定され、操作はできません。');
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const [processlistdata, dataLength] = await ProcessListGet();
      setprocesslist(processlistdata);
      setprogressmax(dataLength);
      setDefaultDate(getNearestMonday());
      DisabledChange();
      getLoginInfoAndFormattedTime()
    };
  
    fetchData();
  }, []);


  


  useEffect(() => {
    if (addType){
      setFormData(addNewForm(formData, FormatFormData));
      setADDType(false);
    }
  },[addType])


  useEffect(() => {
    FormDataKeepSet(formData, storename);
  },[formData])



  const historyhandleConfirm = () => {
    sethistoryDialogOpen(false);
  };


  const ExecuteGoodsReceipt = async () => {
    setisLoading(true)
    await proccessReceiving(new Date(defaultDate).toLocaleDateString('ja-JP'), storename)
    await sethistoryDialogOpen(false);
    setisLoading(false);
    alert('入庫処理をしました')
    //historysearch();
  };



  return (
    <>
      <div className="window_area">
        <div className='window_top'>
          <div className="order_top_area">
            <h2 className='store_name'> 注文日:</h2>
            <input
              type="date"
              className="insert_order_date"
              max="9999-12-31"
              value={defaultDate}
              disabled={isDisabled}
              title={isDisabledTitle}
              onChange={(e) => setDefaultDate(e.target.value)}
            />
            <div className="store_name_status" style={{ border: `1px solid ${OrderStatusColor}` }}>
              <a className="buttonUnderlineD"  role="button" href="#" style={{ color: OrderStatusColor, fontSize: '20px' }} onClick={() => sethistoryDialogOpen(true)}>
                {OrderStatus}
              </a>
            </div>
            <OutOfStockStatus
              title="注文確認"
              message={confirmationMessage}
              tableData={orderdata}
              onConfirm={historyhandleConfirm}
              isOpen={historyDialogOpen}
              processlistdata={processlist}
              ExecuteGoodsReceipt={ExecuteGoodsReceipt}
              Dialogmaxprocess={progressmax}
              progressdata={progress}
            />
            <h2 className='store_name'> 注文商品入力: {storename} 店</h2>
          </div>
        </div>
        <div className='form_area'>
          <div className="searchArea">
            <WordSearch
              setisLoading={setisLoading}
              insert={DetailhandleConfirmAdd}
              addButtonName='注文に追加'
            />
          </div>
          <div className='in-area'>

            <div className="in-area-header">
              <table className="order_table_header">
                <thead>
                  <tr>
                    <th className="insert_vendor_header">業者</th>
                    <th className="insert_code_header">商品ナンバー</th>
                    <th className="insert_name_header">商品名</th>
                    <th className="insert_Select_header">商品詳細</th>
                    <th className="insert_quantity_header">数量</th>
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
                  {formData.map((data, index) => (
                    
                    <tr key={index}>
                      <td className="insertRowNumber">{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          placeholder="業者"
                          title="商品ナンバーが商品一覧にあれば自動で入力されます"
                          className="insert_vendor"
                          value={data.業者}
                          onKeyDown={(e) => handleKeyDown(index, e, '業者')}
                          onChange={(e) => setFormData(handleChange(index, '業者', e, formData))}
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
                          ref={(el) => {
                            if (el) {
                              codeRefs.current[index] = el;
                            }
                          }}
                          onChange={(e) => setFormData(handleChange(index, '商品コード', e, formData))}
                          onKeyDown={(e) => handleKeyDown(index, e, '商品コード')}
                          onBlur={(e) => handleBlur(index, '商品コード', e)}
                          inputMode="numeric"
                        />
                      </td>
                      
                      <td>
                        <input
                          type="text"
                          placeholder="商品名"
                          className="insert_name"
                          value={data.商品名}
                          title="商品一覧にない時に入力してください"
                          ref={(el) => {
                            if (el) {
                              nameRefs.current[index] = el
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(index, e, '商品名')}
                          onChange={(e) => setFormData(handleChange(index, '商品名', e, formData))}
                        />
                      </td>
                      
                      <td>
                        <Select
                          className="insert_Select"
                          key={index}
                          options={data.selectOptions}
                          value={formData[index].商品詳細}
                          isSearchable={true}
                          ref={(el) => {
                            if(el) {
                              detailRefs.current[index] = el;
                            }
                          }}
                          menuIsOpen={formData[index].menuIsOpen}
                          onChange={(selectedOption) => {
                            const newFormData = [...formData];
                            newFormData[index].商品詳細 = selectedOption ? [{ ...selectedOption }] : [];
                            setFormData(newFormData);
                            newFormData[index].menuIsOpen = false;
                          }}
                          onFocus={() => {
                            const newFormData = [...formData];
                            newFormData[index].menuIsOpen = true;
                            setFormData(newFormData);

                          }}
                          onBlur={() => {
                            const newFormData = [...formData];
                            newFormData[index].menuIsOpen = false; // フォーカス外れ時にメニューを閉じる
                            setFormData(newFormData);
                          }}
                          onKeyDown={(e) => handleKeyDown(index, e, '商品詳細')}
                          menuPlacement="auto"
                          menuPortalTarget={document.body}
                          placeholder="詳細を選択"
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
                          ref={(el) => {
                            if (el) {
                              quantityRefs.current[index] = el;
                            }
                          }}
                          onChange={(e) => setFormData(handleChange(index, '数量', e, formData))}
                          onKeyDown={(e) => handleKeyDown(index, e, '数量')}
                        />
                      </td>
                      
                      <td>
                        <input
                          type="text"
                          placeholder="個人購入"
                          className="personal"
                          value={data.個人購入}
                          ref={(el) => {
                            if (el) {
                              personalRefs.current[index] = el
                            }
                          }}
                          onChange={(e) => setFormData(handleChange(index, '個人購入', e, formData))}
                          onKeyDown={(e) => handleKeyDown(index, e, '個人購入')}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="備考"
                          className="remarks"
                          value={data.備考}
                          ref={(el) => {
                            if (el) {
                              remarksRefs.current[index] = el;
                            }
                          }}
                          onChange={(e) => setFormData(handleChange(index, '備考', e, formData))}
                          onKeyDown={(e) => handleKeyDown(index, e, '備考')}
                        />
                      </td>

                      <td>
                        <button type="button" className="delete_button" onClick={() => setFormData(removeForm(index,formData,FormatFormData))}>
                          削除
                        </button>
                      </td>

                    </tr>
                      
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="button_area">
          <Link
            to="/top"
            className="buttonUnderlineSt"
          >
            ＜＜ 店舗選択へ
          </Link>
          {/* <a className="buttonUnderlineSt" id="main_back" type="button" onClick={() => setCurrentPage('topPage')}>
            ＜＜ 店舗選択へ
          </a> */}
          <a className="buttonUnderlineSt" type="button" onClick={() => setFormData(addNewForm(formData, FormatFormData))}>
            注文枠追加
          </a>
          <Link
            to="/history"
            className="buttonUnderlineSt"
          >
            発注履歴へ
          </Link>
          {/* <a className="buttonUnderlineSt" type="button" onClick={() => setCurrentPage('History')}>
            発注履歴へ
          </a> */}
          <a className="buttonUnderlineSt" type="button" onClick={NonhandleOpenDialog}>
            注文無しの場合
          </a>
          <a className="buttonUnderlineSt" type="button" onClick={() => setDialogOpen(true)}>本部へ注文 ＞＞</a>
          <ConfirmDialog
            title="確認"
            message={message}
            tableData={formData}
            onConfirm={handleConfirm}
            onCancel={() => {
              alert('キャンセルされました');
              setDialogOpen(false);
            }}
            isOpen={isDialogOpen}
          />
          <NonConfirmDialog
            title="確認"
            message={new Date().toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit",day: "2-digit"})}
            onConfirm={NonhandleConfirm}
            onCancel={() => setNonisDialogOpen(false)}
            isOpen={NonisDialogOpen}
          />
        </div>
      </div>
    </>
    
  );
}





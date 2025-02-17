import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Select from 'react-select';
import '../css/store.css';
import { HistoryGet, InventorySearch, GASPostInsertStore, judgmentPOST, processlistGet, ImageUrlSet, proccessReceiving } from '../backend/Server_end';
import ConfirmDialog from './orderDialog';
import { FormDataKeepSet, KeepFormDataGet } from '../backend/WebStorage';
import WordSearch from './ProductSearchWord';
import DetailDialog from './ProductdetailDialog';
import NonConfirmDialog from './NonOrderDialog';
import OutOfStockStatus from './Out_of_stock_status';
import { handleChange } from '../backend/BackEnd';



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


function groupDataByFirstColumn(data: any) {
  const groupedData = {};
  data.forEach(row => {
    const key = row[0];
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(row);
  });
  return groupedData;
}



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
  const storename = localStorage.getItem('StoreSetName') ?? "";
  const [formData, setFormData] = useState<InsertData[]>(KeepFormDataGet(storename));
  const codeRefs = useRef([]);
  const quantityRefs = useRef([]);
  const personalRefs = useRef([]);
  const remarksRefs = useRef([]);
  const detailRefs = useRef([]);
  const message = "注文内容は以下の通りです\n以下の内容でよろしければOKをクリックしてください\n内容の変更がある場合にはキャンセルをクリックしてください";
  const [searchData, setsearchData] = useState<any>([]);
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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultDate(event.target.value);
  };

  const DateStatedata = async () => {
    setOrderStatus('更新中...');
    setOrderStatusColor('black');
    const date = new Date(defaultDate);
    const year = date.getFullYear();
    const result = await HistoryGet(String(year), storename, '店舗へ', 'yyyy');
    const groupeddata = await groupDataByFirstColumn(result);
    const Dates = Object.keys(groupeddata);
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


  const progress = () => {
    let processing = '';
    if(orderdata.length > 0){
      const data = orderdata[0][orderdata[0].length - progressColumnBehindNumber]
      processing = processlist[data][1];
    }
    
    return processing;
  };

  useEffect(() => {
    DateStatedata();
  },[defaultDate])

  const clickpage = () => {
    setCurrentPage('topPage');
  };

  // const handleChange = (
  //   index: number,
  //   field: keyof InsertData,
  //   event: ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const newFormData = [...formData];
  //   newFormData[index][field] = event.target.value;
  //   setFormData(newFormData);
  // };

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
    //const searchresult = productSearch(value);
    const newFormData = [...formData];
    const updateFormData = (ResultData: any) => {
      let price = 0;
      if (storeType === "DM" || storeType === "FC"){
        price = ResultData[4]
      }else{
        price = ResultData[5]
      }
      if (ResultData !== null) {
        newFormData[index] = {
          ...newFormData[index],
          ...ResultData.slice(0, 4).reduce((obj, item, i) => ({
            ...obj,
            [fieldDataList[i]]: item,
          }), {}),
          商品単価: price,
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
      if (detailRefs.current[index]) {
        detailRefs.current[index].focus(); 
      };
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
      if (quantityRefs.current[index]) {
        quantityRefs.current[index].focus();
      }
    }
    setFormData(newFormData);
  };

  const numberchange = async (
    index: number,
    field: keyof InsertData,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const CodeValue = event.target.value.replace(/[^0-9A-Za-z\-]/g, '');
    const newFormData = [...formData];
    newFormData[index][field] = CodeValue;
    setFormData(newFormData);
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

    const InsertData = [];
    const formfilter = formData.filter(row => row.商品コード !== "" && row.商品名 !== "");
    for (let i = 0; i < formfilter.length; i++) {
      let setdata = [
        defaultDate,
        storename,
        formfilter[i].業者,
        formfilter[i].商品コード,
        formfilter[i].商品名,
        formfilter[i].商品詳細.value,
        formfilter[i].数量,
        "",
        Number(formfilter[i].商品単価),
        '=SUM(INDIRECT("G"&ROW()) * INDIRECT("I"&ROW()))',
        formfilter[i].個人購入,
        formfilter[i].備考,
        "未印刷",
        id,
        formatted];
      InsertData.push(setdata);
    }
    GASPostInsertStore('insert', '店舗へ', InsertData);
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
        searchDataChange(index, formData[index][fieldType])
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
    //console.log('handleBlur')
    if (formData[index][fieldType]) {
      // console.log(formData[index][fieldType])
      // console.log(index)
      searchDataChange(index, formData[index][fieldType]);
    }
  };

  const handleOpenDialog = () => {
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
    DateStatedata();
  };

  const handleCancel = () => {
    alert('キャンセルされました');
    setDialogOpen(false);
  };



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
      商品単価: data[4],
    };

    if (Vacant !== -1){
      returnData[Vacant] = pushdata
    }else{
      setADDType(true);
      returnData.push(pushdata);
    }
    if (detailRefs.current[Vacant]) {
      detailRefs.current[Vacant].focus();
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
    var match = 'https://lh3.googleusercontent.com/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm';
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");
    if (image[2] !== ''){
      match = ImageUrlSet(image[2]);
    }
    await setDetailIMAGE(match);
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
    console.log(searchtabledata[updateindex])
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

  const NonhandleOpenDialog = () => {
    setNonisDialogOpen(true);
  };

  const NonhandleConfirm = async () => {
    await setisLoading(true);

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

  const NonhandleCancel = () => {
    setNonisDialogOpen(false);
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
    processlistGet();
    const setDate = getNearestMonday();
    setDefaultDate(setDate);
    const processlistdata = localStorage.getItem('processlist');
    setprocesslist(JSON.parse(processlistdata));
    setprogressmax(Object.keys(JSON.parse(processlistdata)).length);
    DisabledChange();
  }, []);


  useEffect(() => {
    if (addType){
      addNewForm()
      setADDType(false);
    }
  },[addType])


  useEffect(() => {
    FormDataKeepSet(formData, storename);
  },[formData])


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
            onChange={(e) => {handleDateChange(e)}}
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
              isOpen={DetailisDialogOpen}
              onConfirm={DetailhandleConfirm}
              addButtonName='注文に追加'
            />
            {/* <DetailDialog
              Data={searchData}
              title={searchData[2]}
              onConfirm={DetailhandleConfirm}
              isOpen={DetailisDialogOpen}
              image={DetailIMAGE}
              insert={DetailhandleConfirmAdd}
              nextDatail={nextDatail}
              beforeDatail={beforeDatail}
              searchtabledata={searchtabledata} searchDataIndex={0}
              addButtonName='注文に追加'
            /> */}

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
                    <td>
                      <input
                        type="text"
                        placeholder="業者"
                        className="insert_vendor"
                        value={data.業者}
                        onChange={(e) => handleChange(index, '業者', e, formData)}
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
                        inputMode="numeric"
                      />
                    </td>
                    
                    <td>
                      <input
                        type="text"
                        placeholder="商品名"
                        className="insert_name"
                        value={data.商品名}
                        onChange={(e) => handleChange(index, '商品名', e,formData)}
                      />
                    </td>
                    
                    <td>
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
                        placeholder="個人購入"
                        className="personal"
                        value={data.個人購入}
                        ref={(el) => (personalRefs.current[index] = el)}
                        onChange={(e) => handleChange(index, '個人購入', e,formData)}
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
                        onChange={(e) => handleChange(index, '備考', e, formData)}
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





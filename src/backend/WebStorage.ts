import { ColorListGet, AllData, ListGet, processlistGet } from '../backend/Server_end';
import * as jaconv from 'jaconv';


export default function main(){}


export const localStoreSet = async () => {
  const storeData = await ListGet('A2:B');

  const options = storeData
    .filter((store: any) => store[1] !== '') // type が空文字列のデータを除外
    .map((store: any) => ({
      value: store[0],
      label: store[0],
      type: store[1]
    }));
  
  //console.log(options)
  localStorage.setItem('storeData', JSON.stringify(options));

  processlistGet();
  
  return options;
};

export const localCorrectionRequestListSet = async () => {
  const ListData = await ListGet('Q2:Q');
  const options = ListData.map((List: string) => ({
    value: List,
    label: List,
  }));
  localStorage.setItem('CorrectionRequestList', JSON.stringify(options))
  return options;
};

export const localStoreSetCash = async (storedata: any) => {
  if (!Array.isArray(storedata)) {
    console.error("storedata is not an array");
    return;
  }
  const options = storedata.map((store: string) => ({
    value: store,
    label: store,
  }));
  localStorage.setItem('storeData', JSON.stringify(options));
};


export const localStorageSet = async (
) => {
  const colorlist = await ColorListGet();
  const groupedData = {};
  colorlist.forEach(item => {
    const code = item[0];
    const color = item[1];
    if (!groupedData[code]) {
      groupedData[code] = [];
    }
    groupedData[code].push(color);
  });
  const keys = Object.keys(groupedData);
  for (let i = 0; i < keys.length; i++){
    localStorage.setItem(`${keys[i]}`, JSON.stringify(groupedData[keys[i]]))
  }
  const data = await AllData();
  localStorage.setItem('data', JSON.stringify(data));
};

export const localExclusion = (store: string, pageName: string) => {
  const data = JSON.parse(localStorage.getItem('data') ?? "");
  let result = [];
  if(store !== "SQ" && pageName === 'used'){
    result = data.filter(row => row[0] !== "社外製品等" && Number.isInteger(row[1]));
  }else if(pageName === 'storePage' || pageName === 'DirectPage'){
    result = data.filter(row => row[0] !== "社外製品等" && Number.isInteger(row[1]));
  }else{
    result = data.filter(row => Number.isInteger(row[1]));
  }
  
  sessionStorage.setItem('data', JSON.stringify(result));
};



export const searchStr = async (searchword: string) => {
  //console.log(searchword)
  const swKZ = jaconv.toKatakana(searchword);
  const swHZ = jaconv.toHiragana(swKZ);
  const swKH = jaconv.toHan(swKZ);
  const data = JSON.parse(localStorage.getItem('data') ?? '');
  if (!data || data.length === 0) {
    console.log('データが存在しません。');
    return [];
  }

  const result = data.filter((item: any[]) => {
    const productName = item[2];
    const productCode = String(item[1]);
    if (typeof productName !== 'string') {
      return false;
    }
    return (
      productName.indexOf(swKZ) !== -1 ||
      productName.indexOf(swKH) !== -1 ||
      productName.indexOf(swHZ) !== -1 ||
      productCode.indexOf(searchword) !== -1
    );
  });

  //console.log(result)
  const FiltereResult = result.filter(row => row[2] !== "");
  const Last = FiltereResult.filter(row => Number.isInteger(row[1]));
  return Last;
};

export const FormDataKeepSet = async (data: any, storename: any) => {
  localStorage.setItem(storename, JSON.stringify(data));
  return '注文データを保存しました'
};

export const KeepFormDataGet = (storename: any) => {
  const jsondata = localStorage.getItem(storename) ?? '';
  if (jsondata !== '') {
    const result = JSON.parse(jsondata);
    //console.log(result)
    return result;
  }else{
    const initialFormData = Array.from({ length: 20 }, () => ({
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
    return initialFormData
  }
};

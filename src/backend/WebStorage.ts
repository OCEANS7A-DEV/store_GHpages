import { ColorListGet, TESTPOST, ListGet } from '../backend/Server_end';
import * as jaconv from 'jaconv';


export default function main(){}

export const localStoreSet = async () => {
  const storeData = await ListGet();
  const options = storeData.map((store: string) => ({
    value: store,
    label: store,
  }));
  localStorage.setItem('storeData', JSON.stringify(options))
}

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
    sessionStorage.setItem(`${keys[i]}`, JSON.stringify(groupedData[keys[i]]))
  }
  const data = await TESTPOST();
  sessionStorage.setItem('data', JSON.stringify(data));
};

export const searchStr = async (searchword: string) => {
  const swKZ = jaconv.toKatakana(searchword);
  const swHZ = jaconv.toHiragana(swKZ);
  const swKH = jaconv.toHan(swKZ);
  const data = JSON.parse(sessionStorage.getItem('data'));
  if (!data || data.length === 0) {
    console.log('データが存在しません。');
    return [];
  }
  const result = data.filter((item: any[]) => {
    const productName = item[2];
    if (typeof productName !== 'string') {
      console.log('商品名が文字列ではありません:', productName);
      return false;
    }
    return (
      productName.indexOf(swKZ) !== -1 ||
      productName.indexOf(swKH) !== -1 ||
      productName.indexOf(swHZ) !== -1
    );
  });
  return result;
};

export const FormDataKeepSet = async (data: any, storename: any) => {
  localStorage.setItem(storename, JSON.stringify(data));
  return '注文データを保存しました'
};

export const KeepFormDataGet = (storename: any) => {
  //localStorage.setItem('FormData', JSON.stringify(data));
  const result = JSON.parse(localStorage.getItem(storename));

  return result;
};

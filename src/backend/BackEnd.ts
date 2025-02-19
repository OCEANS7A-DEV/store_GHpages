//同じ動きをする関数をここでまとめる
import { processlistGet } from '../backend/Server_end';

export const handleChange = (
  index: number,
  field: any,
  event: any,
  formData: any
) => {
  let value = event.target.value;
  if (field === '商品コード'){
    value = value.replace(/[^0-9A-Za-z\-]/g, '');
  }
  const newFormData = [...formData];
  newFormData[index][field] = value;
  return newFormData;
}

export const productSearch = (code: number) => {
  const storageGet = JSON.parse(localStorage.getItem('data') ?? '');
  const product = storageGet.find(item => item[1] === code);
  return product;
};

export const addNewForm = (formdata: any, pushdata: any) => {
  const newFormData = [...formdata];
  for (let i = 0; i < 20; i++) {
    newFormData.push(pushdata);
  }
  return newFormData
};

export const removeForm = (index: number, formdata: any, pushdata: any) => {
  const newFormData = formdata.filter((_, i) => i !== index);
  newFormData.push(pushdata);
  return newFormData
};

export const colorlistGet = async (code: any) => {
  let returnData = [];
  const getData = localStorage.getItem(String(code)) ?? '';
  if (getData !== ''){
    const colorData = await JSON.parse(getData);
    for (let i = 0; i < colorData.length; i++) {
      const DefAsArray = {
        value: colorData[i],
        label: colorData[i],
      };
      returnData.push(DefAsArray);
    }
  }
  
  return returnData;
};

export const groupDataByFirstColumn = (data: any) => {
  const groupedData = {};
  data.forEach(row => {
    const key = row[0];
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(row);
  });
  //console.log(groupedData)
  return groupedData;
}

export const ProcessListGet = async () => {
  const list = await processlistGet();
  const processlistdata = JSON.parse(localStorage.getItem('processlist') ?? list);
  const datalength = Object.keys(processlistdata).length
  return [processlistdata, datalength]
}

export const getLoginInfoAndFormattedTime = async () => {
  const id = sessionStorage.getItem('LoginID');
  const now = new Date();
  const DateTime = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  return [id, DateTime]

}

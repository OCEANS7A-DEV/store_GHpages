const URL_STRING = "https://script.google.com/macros/s/AKfycbyzFig3cgYpdipQY0jXwVq0AiF0AE-a2sPZCB-UIel6cgZb5VrExHpzhIVKvZrRkHnZ/exec";
export default async function main() {};

export const InventorySearch = async(
  SearchWord: any,
  SearchColumn: any,
  sheetname: string
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'inventoryGet',
          sub_action: 'get',
          searchWord: SearchWord,
          sheetName: sheetname,
          searchColumn: SearchColumn,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};


export const ColorListGet = async (
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'colorsGet',
          sub_action: 'get',
          sheetName: '商品詳細一覧',
          searchColumn: '商品コード',
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;

  }catch(e){
    return (e);
  }
};

export const ListGet = async (columnName: string) => {
  try {
    const response = await fetch(URL_STRING, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        sheetName: 'その他一覧',
        action: 'ListGet',
        select: columnName,
        sub_action: 'get',
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const GASPostInsert = async (
  actionName: string,
  sheet: string,
  datail: any,
) => {
  console.log(datail);
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: actionName,
          sub_action: 'post',
          sheetName: sheet,
          data: datail,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const GASPostInsertStore = async (
  actionName: string,
  sheet: string,
  datail: any,
  store: any,
  insertDate: string,
) => {
  const formatDate = insertDate.replace(/-/g, "/");
  const id = sessionStorage.getItem('LoginID')
  try {
    await fetch(
      URL_STRING,
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: actionName,
          sub_action: 'get',
          sheetName: sheet,
          data: datail,
          storeName: store,
          insertID: id,
          setDate: formatDate,
        }),
      },
    );
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const GASPostInsertMoving = async (
  actionName: string,
  sheet: string,
  datail: any,
) => {
  const id = sessionStorage.getItem('LoginID')
  try {
    await fetch(
      URL_STRING,
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: actionName,
          sub_action: 'get',
          sheetName: sheet,
          data: datail,
          insertID: id,
        }),
      },
    );
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const AllData = async(
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'allData',
          sub_action: 'get',
          sheetName: '在庫一覧',
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;

  }catch(e){
    return (e);
  }
};

export const judgmentPOST = async(
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'judgment',
          sub_action: 'get',
          sheetName: '店舗へ',
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};

export const IMAGEGET = async(
  code: Number
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'IMAGEGET',
          sub_action: 'get',
          sheetName: '商品画像',
          searchCode: code,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};


export const HistoryGet = async(
  SearchDate: string,
  Searchstore: string,
  sheetname: string
) => {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyzFig3cgYpdipQY0jXwVq0AiF0AE-a2sPZCB-UIel6cgZb5VrExHpzhIVKvZrRkHnZ/exec",
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'historyGet',
          sub_action: 'get',
          date: SearchDate,
          sheetName: sheetname,
          store: Searchstore,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};

export const MovingHistoryGet = async(
  SearchDate: string,
  sheetname: string
) => {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyzFig3cgYpdipQY0jXwVq0AiF0AE-a2sPZCB-UIel6cgZb5VrExHpzhIVKvZrRkHnZ/exec",
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'MovinghistoryGet',
          sub_action: 'get',
          date: SearchDate,
          sheetName: sheetname,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    console.log(result)
    return result;
  }catch(e){
    return (e);
  }
};



export const ExplanationImageGet = async(
  value: string
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'Explanation',
          sub_action: 'get',
          sheetName: 'その他一覧',
          searchValue: value,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};

export const processlistGet = async () => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'processlistGet',
          sub_action: 'get',
          sheetName: 'その他一覧',
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    localStorage.setItem('processlist', JSON.stringify(result));
    return result;
  }catch(e){
    return (e);
  }
};


export const proccessReceiving = async (
  date: any,
  StoreName: any
) => {
  try {
    await fetch(
      URL_STRING,
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'processReceiving',
          sub_action: 'post',
          sheetName: '店舗へ',
          storename: StoreName,
          dateset: date,
        }),
      },
    );
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const ProcessingMethodGet = async (
) => {
  try {
    const response = await fetch(URL_STRING, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        sheetName: 'その他一覧',
        action: 'storeGet',
        select: '商品使用方法',
        sub_action: 'get',
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result)
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export const StoreInventoryGet = async(
  store: string,
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'StoreInventoryListGet',
          sub_action: 'get',
          sheetName: '同期在庫',
          storeName: store,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};


export const PeriodDateGet = async () => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'PeriodDateGet',
          sub_action: 'get',
          sheetName: '期間在庫',
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};




export const Loginjudgement = async (
  loginID: string,
  passWord: string,
  device: string,
) => {
  try {
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'Loginjudgement',
          sub_action: 'get',
          sheetName: 'アカウント一覧',
          loginid: loginID,
          password: passWord,
          platform: device,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json();
    return result;
  }catch(e){
    return (e);
  }
};


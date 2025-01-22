const URL_STRING = "https://script.google.com/macros/s/AKfycbyzFig3cgYpdipQY0jXwVq0AiF0AE-a2sPZCB-UIel6cgZb5VrExHpzhIVKvZrRkHnZ/exec";

const LOGIN_URL = 'https://script.google.com/macros/s/AKfycbzST1TSt2AuocFqtXj3KMhoyb26BTzFmhzWIMHfe4bVDzSEhmMmCBuwMU-sXp_DyxLc/exec';

const Get_URL = 'https://script.google.com/macros/s/AKfycbwdZ3lhe2QH2BChceXrTsxzGAkUd9EgZ2AZ7pWXWlMJvwtOtOcjXDTOXUmdBRJgCs25/exec';


export default async function main() {};

export const InventorySearch = async(
  SearchWord: any,
  SearchColumn: any,
  sheetname: string
) => {
  try {
    const response = await fetch(
      Get_URL,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'inventoryGet',
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
      Get_URL,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'colorsGet',
          sheetName: '商品詳細一覧',
          searchColumn: '商品コード',
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    //console.log(result)
    return result;

  }catch(e){
    return (e);
  }
};

export const ListGet = async (Range: string) => {// Rangeは例'A2:B'のような形
  try {
    const response = await fetch(Get_URL, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        sheetName: 'その他一覧',
        action: 'ListGet',
        ranges: Range,
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    //console.log(result)
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
  try {
    const id = sessionStorage.getItem('LoginID')
    const response = await fetch(
      URL_STRING,
      {
        method: 'POST',
        body: JSON.stringify({
          action: actionName,
          sub_action: 'get',
          sheetName: sheet,
          data: datail,
          insertID: id
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const GASPostInsertStore = async (
  actionName: string,
  sheet: string,
  datail: any,
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
          action: actionName,
          sub_action: 'post',
          sheetName: sheet,
          data: datail,
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
      Get_URL,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'allData',
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
  sheetname: string,
  searchtype: string
) => {
  try {
    const response = await fetch(
      Get_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'historyGet',
          date: SearchDate,
          sheetName: sheetname,
          store: Searchstore,
          searchType: searchtype
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
      Get_URL,
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
    //console.log(result)
    return result;
  }catch(e){
    return (e);
  }
};

export const RequestHistoryGet = async(
  SearchDate: string,
  sheetname: string
) => {
  try {
    const loginID = sessionStorage.getItem('LoginID');
    const response = await fetch(
      Get_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'RequestGet',
          sub_action: 'get',
          date: SearchDate,
          sheetName: sheetname,
          id: loginID,
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    //console.log(result)
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
      Get_URL,
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
      Get_URL,
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
    const response = await fetch(Get_URL, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        sheetName: 'その他一覧',
        action: 'ProcessingMethodGet',
        select: '商品使用方法',
        sub_action: 'get',
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    //console.log(result)
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
    const response = await fetch(Get_URL,{
      method: 'POST',
      headers: {
        "Content-Type" : "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        action: 'storeInventoryListGet',
        sheetName: '同期在庫',
        storeName: store,
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    //console.log(result)
    return result;
  }catch(e){
    return (e);
  }
};


export const PeriodDateGet = async () => {
  try {
    const response = await fetch(
      Get_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'PeriodDateGet',
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
      LOGIN_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'Login',
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
    LoginLogInsert(result)
    return result;
  }catch(e){
    return (e);
  }
};

export const LoginLogInsert = async (
  data: any,
) => {
  try {
    
    const response = await fetch(
      LOGIN_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'Insert',
          datas: data
        })
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json();
    //console.log(result)
  
  }catch(e){
    return (e);
  }
};


export const CurrentlyAvailableDataGet = async () => {
  try {
    const response = await fetch(
      Get_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'CurrentlyAvailableDataGet',
          sub_action: 'get',
          sheetName: '店舗在庫一覧',
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

export const syncDataGet = async () => {
  try {
    const response = await fetch(
      Get_URL,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: 'CurrentlyAvailableDataGet',
          sub_action: 'get',
          sheetName: '同期在庫',
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
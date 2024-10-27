import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import { ListGet, ColorListGet, processlistGet } from './backend/Server_end.ts';
import { localStorageSet, localStoreSet } from './backend/WebStorage.ts';

import './css/top.css';

interface SelectOption {
  value: string;
  label: string;
  id: number;
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
}



const sleep = (time: number) => new Promise<void>((r) => setTimeout(r, time));

export default function TopPage({ setCurrentPage }: SettingProps) {
  const [storeSelect, setStoreSelect] = useState<SelectOption | null>(null);
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    localStorageSet();
    const getLocalStorageSize = async () => {
      const cachedData = localStorage.getItem('storeData');
      await setSelectOptions(JSON.parse(cachedData));
      await localStoreSet(cachedData);
      const cachedData2 = localStorage.getItem('storeData');
      await setSelectOptions(JSON.parse(cachedData2));
      await localStoreSet(cachedData2);
    }
    getLocalStorageSize()
    const setStore = localStorage.getItem('StoreSetName');
    const setSelect = {
      value: setStore, label: setStore
    }
    setStoreSelect(setSelect);
  }, []);

  const handleStoreChange = (selectedOption: SelectOption | null) => {
    console.log(selectedOption)
    setStoreSelect(selectedOption);
  };

  const setPage = (pageName) => {
    if (storeSelect) {
      const set = storeSelect.value;
      localStorage.setItem('StoreSetName', set);
      setCurrentPage(pageName);
    } else {
      alert('店舗を選択してください。');
    }
  };

  return (
    <div className="top-window">
      <div className="top-BG">
        <h2 className="top-title">店舗選択画面</h2>
        <div className="default-page">
          <Select
            className='Select_custom'
            placeholder="店舗選択"
            isSearchable={false}
            value={storeSelect}
            onChange={handleStoreChange}
            options={selectOptions}
          />
          <div className="SelectMethod">
            <a className="buttonUnderline" type="button" onClick={() => {setPage('storePage')}}>商品発注</a>
            <a className="buttonUnderline" type="button" onClick={() => {setPage('used')}}>使用商品</a>
          </div>
        </div>
      </div>
    </div>
  );
}

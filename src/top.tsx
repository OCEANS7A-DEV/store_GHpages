import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { localStorageSet, localStoreSet, localStoreSetCash } from './backend/WebStorage.ts';

import './css/top.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
}


export default function TopPage({ setCurrentPage }: SettingProps) {
  const [storeSelect, setStoreSelect] = useState<SelectOption | null>(null);
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    localStorageSet();
    const getLocalStorageSize = async () => {
      const cachedData = await localStorage.getItem('storeData');
      setSelectOptions(cachedData ? JSON.parse(cachedData) : []);
      const storeSelectupdate = await localStoreSet();
      setSelectOptions(storeSelectupdate);
      const setStore = localStorage.getItem('StoreSetName') ?? '';
      const setSelect: SelectOption = {
        value: setStore,
        label: setStore
      }
      setStoreSelect(setSelect);
    }
    getLocalStorageSize()
    
  }, []);

  const handleStoreChange = (selectedOption: SelectOption | null) => {
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

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





export default function TopPage({ setCurrentPage }: SettingProps) {
  const [storeSelect, setStoreSelect] = useState<SelectOption | null>(null);
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    localStorageSet();
    const getLocalStorageSize = async () => {
      const cachedData = localStorage.getItem('storeData');
      setSelectOptions(JSON.parse(cachedData));
      await localStoreSet(cachedData);
      const cachedData2 = localStorage.getItem('storeData');
      setSelectOptions(JSON.parse(cachedData2));
    }
    getLocalStorageSize()
    const cashdata = localStorage.getItem('StoreSetName');
    // if (cashdata !== null){
    //   autoSelectStore();
    // }
  }, []);
  
  const handleStoreChange = (selectedOption: SelectOption | null) => {
    setStoreSelect(selectedOption);
  };

  const setPage = () => {
    if (storeSelect) {
      const set = storeSelect.value;
      let pageName = '';
      if (set === '本部') {
        pageName = 'HQPage';
      } else {
        pageName = 'storePage';
      }
      localStorage.setItem('StoreSetName', set);
      setCurrentPage(pageName);
    } else {
      alert('店舗を選択してください。');
    }
  };

  // const autoSelectStore = () => {
  //   setCurrentPage('storePage');
  // };

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
          <a className="buttonUnderline" type="button" onClick={setPage}>決定</a>
        </div>
      </div>
    </div>
  );
}

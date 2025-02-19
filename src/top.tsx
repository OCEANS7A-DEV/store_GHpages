import { useState, useEffect } from 'react';
import Select from 'react-select';
import { localStorageSet, localStoreSet, localExclusion, localCorrectionRequestListSet } from './backend/WebStorage';
import { useNavigate } from 'react-router-dom';
import HelpDialog from './sub_screen/helpDialog';
import './css/top.css';
import { Link } from "react-router-dom";

interface SelectOption {
  value: string;
  label: string;
  type: string;
}

interface SettingProps {
  setisLoading: (value: boolean) => void;
}


export default function TopPage({ setisLoading }: SettingProps) {
  const [storeSelect, setStoreSelect] = useState<SelectOption>();
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [isHelpDialogOpen, setHelpDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorageSet();
    localCorrectionRequestListSet()
    const getLocalStorageSize = async () => {
      const cachedData = await localStorage.getItem('storeData');
      //console.log(cachedData ? JSON.parse(cachedData) : [])
      setSelectOptions(cachedData ? JSON.parse(cachedData) : []);
      const storeSelectupdate = await localStoreSet();
      const authorityType = sessionStorage.getItem('authority');
      if (authorityType === '本部') {
        storeSelectupdate.push(
          {
            value: '在庫調整',
            label: '在庫調整'
          }
        )
      }
      setSelectOptions(storeSelectupdate);
      const setStore = localStorage.getItem('StoreSetName') ?? '';
      const setType = localStorage.getItem('StoreSetType') ?? '';
      if(setStore !== '' && setType !== ''){
        const setSelect: SelectOption = {
          value: setStore,
          label: setStore,
          type: setType
        }
        setStoreSelect(setSelect);
      }
    }
    getLocalStorageSize()
    
  }, []);

  const handleStoreChange = (selectedOption: SelectOption | []) => {
    setStoreSelect(selectedOption);
  };

  const setPage = (pageName: string) => {
    if (storeSelect) {
      const set = storeSelect.value;
      localExclusion(set, pageName);
      localStorage.setItem('StoreSetName', set);
      localStorage.setItem('StoreSetType', storeSelect.type);
      navigate(`/${pageName}`)
      //setCurrentPage(pageName);
    } else {
      alert('店舗を選択してください。');
    }
  };
  const handleConfirm = async () => {
    setHelpDialogOpen(false)
  };
  const handleCancel = async () => {
    setHelpDialogOpen(false)
  };

  return (
    <>
      
      <div className="top-window">
        <div>
          <div className="top-BG">
            <h2 className="top-title">店舗選択画面</h2>
            <div className="default-page">
              <Select
                className='Select_custom'
                placeholder="店舗選択"
                isSearchable={true}
                value={storeSelect}
                onChange={handleStoreChange}
                options={selectOptions}
              />
              <div className="SelectMethod">
                <div>
                  <a className="buttonUnderline" type="button" onClick={() => {setPage('store')}}>注文発注</a>
                  {/* <a className="buttonUnderline" type="button" onClick={() => {setPage('used')}}>使用商品</a> */}
                  <a className="buttonUnderline" type="button" onClick={() => {setPage('inventoryNumsSet')}}>在庫数入力</a>
                  <a className="buttonUnderline" type="button" onClick={() => {setPage('direct')}}>直接購入</a>
                </div>
              </div>
            </div>
          </div>
          <div className="ToFrom">
            <h2 className="top-title">商品の店舗間移動</h2>
            <Link
              to="/moving"
              className="buttonUnderlineSt"
            >
              店舗間移動
            </Link>
            {/* <a className="buttonUnderline" type="button" onClick={() => {setCurrentPage('Moving')}}>店舗間移動</a> */}
          </div>
          <div className="ToFrom">
            <h2 className="top-title">送信済みデータや</h2>
            <h2 className="top-title">システムに関する修正依頼</h2>
            <Link
              to="/request"
              className="buttonUnderlineSt"
            >
              修正依頼
            </Link>
            {/* <a className="buttonUnderline" type="button" onClick={() => {setCurrentPage('Request')}}>修正依頼</a> */}
          </div>
        </div>
      </div>
    </>
  );
}

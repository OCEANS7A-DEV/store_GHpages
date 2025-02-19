import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import '../css/top.css';
import { Loginjudgement } from '../backend/Server_end';
import { localStorageSet } from '../backend/WebStorage';
import LoadingDisplay from "./loading";


interface LoginInputs {
  username: string;
  password: string;
}

interface SettingProps {
  setisLoading: (value: boolean) => void;
}


export default function LoginPage({ setisLoading }: SettingProps) {
  const [UserName, setUserName] = useState<string>('');
  const [PassWord, setPassWord] = useState<string>('');
  const navigate = useNavigate();

  const login = async () => {
    setisLoading(true);
    const platform = navigator.platform;
    const loginjudgement = await Loginjudgement(UserName, PassWord, platform)
    if (loginjudgement['result'][3]){
      sessionStorage.setItem('LoginID',UserName);
      sessionStorage.setItem('authority',loginjudgement['result'][5]);
      if(loginjudgement['result'][5] !== 'スタッフ'){
        navigate('/top')
      }else{
        await localStorageSet();
        navigate('/staff')
      }
      
    }else {
      alert('ログインID、またはパスワードが間違っています')
    }
    setisLoading(false)
  }



  return (
    <>
      <div className="top-window">
        <div className="top-BG">
          <h2 className="top-title">ログイン</h2>
          <div className="login-page">
            <div>
              <input className="loginInput" placeholder='ログインID' type='text' onChange={(e) => setUserName(e.target.value)}/>
            </div>
            <div>
              <input className="loginInput" placeholder='パスワード' type='password' onChange={(e) => setPassWord(e.target.value)}/>
            </div>
            <div>
              <a className="buttonUnderlineSt" id="main_back" type="button" onClick={login}>
                ログイン
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
    
  );
}

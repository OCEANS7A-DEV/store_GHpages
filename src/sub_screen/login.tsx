import React, { useState, useEffect, ChangeEvent } from 'react';
import '../css/login.css';
import '../css/top.css';
import { Loginjudgement } from '../backend/Server_end';

interface LoginInputs {
  username: string;
  password: string;
}

interface SettingProps {
  setCurrentPage: (page: string) => void;
  setisLoading: (value: boolean) => void;
}


export default function LoginPage({ setCurrentPage, setisLoading }: SettingProps) {
  const [UserName, setUserName] = useState<string>('');
  const [PassWord, setPassWord] = useState<string>('');

  const login = async () => {
    setisLoading(true);
    const platform = navigator.platform;
    const loginjudgement = await Loginjudgement(UserName, PassWord, platform)
    if (loginjudgement['result'][3]){
      sessionStorage.setItem('LoginID',UserName);
      sessionStorage.setItem('authority',loginjudgement['result'][5])
      setCurrentPage('topPage')
    }else {
      alert('ログインID、またはパスワードが間違っています')
    }
    setisLoading(false)
  }



  return (
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
  );
}

import React,{ useEffect, useState } from 'react';
import ReactDOM from 'react-dom';


import '../css/ProductDetailDialog.css';


interface ConfirmDialogProps {
  title: string;
  message: string;
  tableData: Array<any>;
  onConfirm: () => void;
  isOpen: boolean;
}



const HistoryInsertCheck: React.FC<ConfirmDialogProps> = ({ title, message, tableData, onConfirm, isOpen }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="detail-dialog-overlay">
      <div className="confirm-dialog">
        <div className="OutOfStockStatus-top">
          <div className="confirm-top">
            <h2>{title}</h2>
            <p>
              {message.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
        <div className="dialog-table">
          <table className='data-table'>
            <thead>
              <tr>
                <th>月日</th>
                <th>業者</th>
                <th>商品ナンバー</th>
                <th>商品名</th>
                <th>商品詳細</th>
                <th>数量</th>
                <th>個人購入</th>
                <th>備考</th>
                <th>処理状況</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td className="dataDate">{new Date(row[0]).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                    })}</td>
                  <td className='historycheckvendor'>{row[2]}</td>
                  <td className='historycheckcode'>{row[3]}</td>
                  <td className='historycheckname'>{row[4]}</td>
                  <td className='historycheckdetail'>{row[5]?.label || '-'}</td>
                  <td className='historycheckquantity'>{row[6]}</td>
                  <td className='historycheckpersonal'>{row[10]}</td>
                  <td className='historycheckremarks'>{row[11]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='confirm-dialog-button'>
          <button onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HistoryInsertCheck;

export const HistoryUsedCheck: React.FC<ConfirmDialogProps> = ({ title, message, tableData, onConfirm, isOpen }) => {
    if (!isOpen) return null;
  
    return ReactDOM.createPortal(
      <div className="confirm-dialog-overlay">
        <div className="confirm-dialog">
          <div className="OutOfStockStatus-top">
            <div className="confirm-top">
              <h2>{title}</h2>
              <p>
                {message.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
          <div className="dialog-table">
            <table className='data-table'>
              <thead>
                <tr>
                  <th>月日</th>
                  <th>商品ナンバー</th>
                  <th>商品名</th>
                  <th>数量</th>
                  <th>使用方法</th>
                  <th>個人購入</th>
                  <th>備考</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td className="dataDate">{new Date(row[0]).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                      })}</td>
                    <td className='historcheckycode'>{row[2]}</td>
                    <td className='historycheckname'>{row[3]}</td>
                    <td className='historycheckquantity'>{row[4]}</td>
                    <td className='historycheckpersonal'>{row[5]}</td>
                    <td className='historycheckremarks'>{row[6]}</td>
                    <td className='historycheckremarks'>{row[7]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='confirm-dialog-button'>
            <button onClick={onConfirm}>OK</button>
          </div>
        </div>
      </div>,
      document.body
    );
  };
// ConfirmDialog.tsx
import React,{ useEffect } from 'react';
import ReactDOM from 'react-dom';

import '../css/ProductDetailDialog.css';
import '../css/history_detail.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  tableData: Array<any>;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}



const OutOfStockStatus: React.FC<ConfirmDialogProps> = ({ title, message, tableData, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;
  const processingdata = (data) => {
    let processing = '';
    if (data === "未印刷"){
      processing = '発注済';
    }else if (data === "印刷済"){
      processing = '処理中';
    }else if (data === "出荷済"){
      processing = '配送中';
    }else if (data === "入庫済"){
      processing = '納品済'
    }
    return processing;
  };

  useEffect(() => {
    console.log(tableData)
  },[])

  return ReactDOM.createPortal(
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
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
        {/* テーブルを表示 */}
        <div className="dialog-table">
          <table className='data-table'>
            <thead>
              <tr>
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
                  <td className='historyvendor'>{row[2]}</td>
                  <td className='historycode'>{row[3]}</td>
                  <td className='historyname'>{row[4]}</td>
                  <td className='historydetail'>{row[5]?.label || '-'}</td>
                  <td className='historyquantity'>{row[6]}</td>
                  <td className='historypersonal'>{row[9]}</td>
                  <td className='historyremarks'>{row[10]}</td>
                  <td className='historyprogress'>{processingdata(row[11])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='confirm-dialog-button'>
            <button onClick={onConfirm}>OK</button>
            {/* <button onClick={onCancel}>キャンセル</button> */}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OutOfStockStatus;

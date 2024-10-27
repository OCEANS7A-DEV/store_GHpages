// ConfirmDialog.tsx
import React from 'react';
import ReactDOM from 'react-dom';

import '../css/usedDialog.css';

interface UsedDialogProps {
  title: string;
  message: string;
  tableData: Array<any>;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const UsedDialog: React.FC<UsedDialogProps> = ({ title, message, tableData, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;
  console.log(tableData)

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
              {tableData
                .filter((row) => {
                  const 商品コード = row.商品コード;
                  return typeof 商品コード === 'number' && 商品コード !== null;
                })
                .map((row, index) => (
                  <tr key={index}>
                    <td className='dtvendor'>{new Date(row.月日).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                    })}</td>
                    <td className='dtcode'>{row.商品コード}</td>
                    <td className='dtname'>{row.商品名}</td>
                    <td className='dtquantity'>{row.数量}</td>
                    <td className='dused'>{row.使用方法}</td>
                    <td className='dtpersonal'>{row.個人購入}</td>
                    <td className='dtremarks'>{row.備考}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className='confirm-dialog-button'>
            <button onClick={onConfirm}>OK</button>
            <button onClick={onCancel}>キャンセル</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UsedDialog;

// ConfirmDialog.tsx
import React from 'react';
import ReactDOM from 'react-dom';

import '../css/orderDialog.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  tableData: Array<any>;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, message, tableData, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

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
                    <td className='dtvendor'>{row.業者}</td>
                    <td className='dtcode'>{row.商品コード}</td>
                    <td className='dtname'>{row.商品名}</td>
                    <td className='dtdetail'>{row.商品詳細?.label || '-'}</td>
                    <td className='dtquantity'>{row.数量}</td>
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

export default ConfirmDialog;

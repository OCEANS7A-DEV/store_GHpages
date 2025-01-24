import React, { useState, useEffect, ChangeEvent } from 'react';
import ReactDOM from 'react-dom';
import '../css/orderDialog.css';
import { helpGet } from '../backend/Server_end';

interface HelpDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}


const HelpDialog: React.FC<HelpDialogProps> = ({ title, message, onConfirm, onCancel, isOpen }) => {

  if (!isOpen) return null;
  
  const [nowStatus, setNowStatus] = useState('');
  const [columnIndexNum, setColumnIndexNum] = useState(0);
  const [helpData, setHelpData] = useState([]);
  const [helpfilter, sethelpfilter] = useState([]);
  const [maxlength, setMaxlength] = useState(0);
  const [history, sethistory] = useState([]);
  const [nowLength, setNowLength] = useState(0);

  const helpDataSet = async() => {
    const Data = await helpGet()
    setHelpData(Data)
    setMaxlength(Data[0].length)
    sethelpfilter(Data);
  }

  const helpClicked = (set: string) => {
    if(columnIndexNum + 1 < maxlength ){
      setNowStatus(set);
      const historydata = history;
      historydata.push(set);
      sethistory(historydata)
      setNowLength(nowLength + 1);
      setColumnIndexNum(columnIndexNum + 1);
    }
  }

  const backClick = () => {
    if(columnIndexNum !== 0){
      setColumnIndexNum(columnIndexNum - 1);
      setNowLength(nowLength - 1);
      const historydata = history;
      historydata.pop();
      sethistory(historydata)
    }
    
  }


  useEffect(() => {
    if (columnIndexNum > 0){
      const filtered = helpData.filter(row => row[columnIndexNum-1] == history[nowLength-1])
      sethelpfilter(filtered)
    }else{
      sethelpfilter(helpData)
    }
  },[columnIndexNum])



  useEffect(() => {
    helpDataSet()
  },[])


  return ReactDOM.createPortal(
    <div className="order-confirm-dialog-overlay">
      <div className="order-confirm-dialog">
        
        <div className="help-top">
          <div className="help-button-area">
            <div className="backButton">
              <button onClick={backClick}>⇐戻る</button>
            </div>
            <div className="closeButton">
              <a
                className="Closebutton"
                role="button"
                href="#"
                onClick={onConfirm}
              >
                ☒
              </a>
            </div>
          </div>
          
          <h2>操作ヘルプ</h2>
        </div>
        <div className="help-detail">
          {
            helpfilter.map((row,index) => (
              <div key={index}>
                <div>
                {columnIndexNum !== maxlength - 1 ? (
                  <a
                    className="buttonUnderlineHelp"
                    role="button"
                    href="#"
                    onClick={() => helpClicked(row[columnIndexNum])}
                  >
                    {row[columnIndexNum]}
                  </a>
                  ) : (
                    <span>
                      {row[columnIndexNum].split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </span>
                  )
                }
                  
                </div>
              </div>
            ))
          }
        </div>
        <div className='order-confirm-dialog-button'>
          <button onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>,
    document.body
  );
};


export default HelpDialog;
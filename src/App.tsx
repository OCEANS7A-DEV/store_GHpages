import { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './App.css';
import { useRef } from 'react';
import StorePage from './sub_screen/store';
import OrderHistory from './sub_screen/order_history';
import InventoryUsed from './sub_screen/InventoryUsed';
import UsedHistory from './sub_screen/UsedHistory';
import MovingHistory from './sub_screen/MovingHistory'
import StoreInventoryList from './sub_screen/StoreInventoryList'
import LoadingDisplay from './sub_screen/loading';
import LoginPage from './sub_screen/login';
import InventoryMoving from './sub_screen/Moving_between_stores';
import InventoryDirect from './sub_screen/DirectPurchase';
import OceanCatalog from './sub_screen/Ocean_catalog';
import CorrectionRequest from './sub_screen/CorrectionRequest';
import RequestHistory from './sub_screen/Request_History';
import StoreInventoryNumsSet from './sub_screen/InventoryNumsSet';
import { Toaster } from 'react-hot-toast';



import TopPage from './top';


export default function App() {
  const [currentPage, setCurrentPage] = useState('loginPage');
  const nodeRef = useRef(null);
  const [isLoading, setisLoading] = useState(false);


  const getPageComponent = (page: string) => {
    switch (page) {
      case 'topPage':
        return <TopPage setCurrentPage={setCurrentPage}/>;
      case 'storePage':
        return <StorePage setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'History':
        return <OrderHistory setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'used':
        return <InventoryUsed setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'usedHistory':
        return <UsedHistory setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'storeinventory':
        return <StoreInventoryList setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'loginPage':
        return <LoginPage setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'Moving':
        return <InventoryMoving setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'MovingHistory':
        return <MovingHistory setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'DirectPage':
        return <InventoryDirect setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'StaffPage':
        return <OceanCatalog setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'Request':
        return <CorrectionRequest setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'RequestHistory':
        return <RequestHistory setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      case 'InventoryNumsSet':
        return <StoreInventoryNumsSet setCurrentPage={setCurrentPage} setisLoading={setisLoading}/>;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster/>
      <TransitionGroup component={null}>
        <CSSTransition
          key={currentPage}
          timeout={{ enter: 500, exit: 300 }}
          classNames="fade"
          nodeRef={nodeRef}
          unmountOnExit
        >
          <div>
            <div ref={nodeRef} className="page">
              {getPageComponent(currentPage)}
            </div>
            <div className="Loadingarea">
              <LoadingDisplay isLoading={isLoading} />
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
    
  );
}



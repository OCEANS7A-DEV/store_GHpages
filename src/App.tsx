import { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './App.css';
import React, { useRef } from 'react';
import StorePage from './sub_screen/store.tsx';
import OrderHistory from './sub_screen/order_history.tsx';
import InventoryUsed from './sub_screen/InventoryUsed.tsx';
import UsedHistory from './sub_screen/UsedHistory.tsx';
import StoreInventoryList from './sub_screen/StoreInventoryList.tsx'
import LoadingDisplay from './sub_screen/loading.tsx';



import TopPage from './top.tsx';


export default function App() {
  const [currentPage, setCurrentPage] = useState('topPage');
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
      default:
        return null;
    }
  };

  return (
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
  );
}



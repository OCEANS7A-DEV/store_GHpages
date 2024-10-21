import { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './App.css';
import React, { useRef } from 'react';
import StorePage from './sub_screen/store.tsx';
import OrderHistory from './sub_screen/order_history.tsx';



import TopPage from './top.tsx';


export default function App() {
  const [currentPage, setCurrentPage] = useState('topPage');
  const nodeRef = useRef(null);


  const getPageComponent = (page: string) => {
    switch (page) {
      case 'topPage':
        return <TopPage setCurrentPage={setCurrentPage}/>;
      case 'storePage':
        return <StorePage setCurrentPage={setCurrentPage}/>;
      case 'History':
        return <OrderHistory setCurrentPage={setCurrentPage}/>
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
        <div ref={nodeRef} className="page">
          {getPageComponent(currentPage)}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}



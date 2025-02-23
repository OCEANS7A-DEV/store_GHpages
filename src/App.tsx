import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useRef, useState } from "react";
import "./App.css";

import TopPage from "./top";
import StorePage from "./sub_screen/store";
import OrderHistory from "./sub_screen/order_history";
import InventoryUsed from "./sub_screen/InventoryUsed";
import UsedHistory from "./sub_screen/UsedHistory";
import MovingHistory from "./sub_screen/MovingHistory";
import StoreInventoryList from "./sub_screen/StoreInventoryList";
import LoadingDisplay from "./sub_screen/loading";
import LoginPage from "./sub_screen/login";
import InventoryMoving from "./sub_screen/Moving_between_stores";
import InventoryDirect from "./sub_screen/DirectPurchase";
import OceanCatalog from "./sub_screen/Ocean_catalog";
import CorrectionRequest from "./sub_screen/CorrectionRequest";
import RequestHistory from "./sub_screen/Request_History";
import StoreInventoryNumsSet from "./sub_screen/InventoryNumsSet";
import { Toaster } from "react-hot-toast";
import HelpDialog from "./sub_screen/helpDialog";

const AnimatedRoutes = () => {
  const location = useLocation();
  const nodeRef = useRef(null);
  const [isLoading, setisLoading] = useState(false);
  const [isHelpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleConfirm = () => setHelpDialogOpen(false);
  const handleCancel = () => setHelpDialogOpen(false);

  return (
    <>
      <Toaster />
      <div className="help-information-button">
        <a
          className="buttonUnderlinehelp"
          role="button"
          type="button"
          title="ヘルプ"
          onClick={() => setHelpDialogOpen(true)}
        >
          ?
        </a>
        <HelpDialog
          title="ヘルプ表示テスト"
          message=""
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isOpen={isHelpDialogOpen}
        />
      </div>
      
      <TransitionGroup component={null}>
        <CSSTransition key={location.pathname} timeout={500} classNames="fade" nodeRef={nodeRef} unmountOnExit>
          <div ref={nodeRef} className="page">
            <Routes location={location}>
              <Route path="/" element={<LoginPage setisLoading={setisLoading} />} />
              <Route path="/top" element={<TopPage />} />
              <Route path="/store" element={<StorePage setisLoading={setisLoading} />} />
              <Route path="/history" element={<OrderHistory setisLoading={setisLoading} />} />
              <Route path="/used" element={<InventoryUsed setisLoading={setisLoading} />} />
              <Route path="/usedHistory" element={<UsedHistory setisLoading={setisLoading} />} />
              <Route path="/storeinventory" element={<StoreInventoryList setisLoading={setisLoading} />} />
              <Route path="/moving" element={<InventoryMoving setisLoading={setisLoading} />} />
              <Route path="/movingHistory" element={<MovingHistory setisLoading={setisLoading} />} />
              <Route path="/direct" element={<InventoryDirect setisLoading={setisLoading} />} />
              <Route path="/staff" element={<OceanCatalog setisLoading={setisLoading} />} />
              <Route path="/request" element={<CorrectionRequest setisLoading={setisLoading} />} />
              <Route path="/requestHistory" element={<RequestHistory setisLoading={setisLoading} />} />
              <Route path="/inventoryNumsSet" element={<StoreInventoryNumsSet setisLoading={setisLoading} />} />
            </Routes>
            <div className="Loadingarea">
              <LoadingDisplay isLoading={isLoading} />
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}




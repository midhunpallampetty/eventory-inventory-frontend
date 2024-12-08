import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import RegisterPage from "./pages/register";
import Inventory from "./pages/Inventory";
import CustomerManagement from "./pages/CustomerManagement";
import SalesReport from "./pages/SalesReport";
import ItemsReport from "./pages/ItemsSales";
import CustomerLedgerPage from "./pages/CustomerLedger";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/salesreport" element={<SalesReport />} />
        <Route path="/itemreport" element={<ItemsReport />} />
        <Route path="/customer-ledger" element={<CustomerLedgerPage />} />
        

      </Routes>
    </Router>
  );
};

export default App;

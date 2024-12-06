import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import RegisterPage from "./pages/register";
import Inventory from "./pages/Inventory";
import CustomerManagement from "./pages/CustomerManagement";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/customers" element={<CustomerManagement />} />
      </Routes>
    </Router>
  );
};

export default App;

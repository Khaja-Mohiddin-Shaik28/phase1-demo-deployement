import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Redirect from "./pages/public-pages/Redirect";
import Home from "./pages/public-pages/Home";
import Login from './pages/public-pages/Login';
import Register from './pages/public-pages/Register';
import ForgotPassword from "./pages/public-pages/ForgotPassword";
import VerifyOtp from "./pages/public-pages/VerifyOtp";
import ResetPassword from "./pages/public-pages/ResetPassword";
import DistributorDashboard from "./pages/private-pages/distributor/DistributorDashboard";
import RetailerDashboard from "./pages/private-pages/retailer/RetailerDashboard";

function App() {

  return (

    <div>
      <BrowserRouter>
        <Routes>
          {/* Routes for Register and login*/}
          <Route path="/" element={<Redirect />} />
          <Route path="/unified-health-tech" element={<Home />} />
          <Route path="/unified-health-tech/register" element={<Register />} />
          <Route path="/unified-health-tech/login" element={<Login />} />
          <Route path="/unified-health-tech/login/forgot-password" element={<ForgotPassword />} />
          <Route path="/unified-health-tech/login/verify-otp" element={<VerifyOtp />} />
          <Route path="/unified-health-tech/login/reset-password" element={<ResetPassword />} />


          {/* Routes for Distributor dashboard */}
          <Route path="/unified-health-tech/distributor/dashboard/:userId" element={<DistributorDashboard />} />

        {/* Routes for Retailer dashboard */}
          <Route path="/unified-health-tech/retailer/dashboard/:userId" element={<RetailerDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>


  )
}

export default App

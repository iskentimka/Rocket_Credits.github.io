import React from "react";
import { HashRouter,Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RocketCreditsProvider } from "./context/RocketCreditsContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Subscription from "./pages/Subscription";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Home from "./pages/Home";

// Regular Private Route
const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" />;
};

// Admin Route (Your existing logic)
const AdminRoute = ({ element }) => {
  const { user } = useAuth();
  return user && user.email === 'admin@example.com' ? element : <Navigate to="/" />;
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <RocketCreditsProvider>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            {/* Private Routes */}
            <Route path="/subscribe" element={<PrivateRoute element={<Subscription />} />} />
            <Route path="/payment" element={<PrivateRoute element={<Payment />} />} />
            <Route path="/payment-success" element={<PrivateRoute element={<PaymentSuccess />} />} />
            
            {/* Default Route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <Footer />
        </RocketCreditsProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
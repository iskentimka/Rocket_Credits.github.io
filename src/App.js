import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Subscription from "./pages/Subscription";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RocketCreditsProvider } from "./context/RocketCreditsContext";

// Regular Private Route
const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" />;
};

// Admin Route Protection
const AdminRoute = ({ element }) => {
  const { user } = useAuth();
  // Check if user is logged in and is admin
  if (!user) {
    return <Navigate to="/login" />;
  }
  // Check if user is admin
  if (user.email !== 'admin@example.com') {
    console.log('Not admin, redirecting to home');
    return <Navigate to="/" />;
  }
  return element;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <RocketCreditsProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Admin route should be before other protected routes */}
                <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
                
                {/* Protected routes */}
                <Route path="/subscribe" element={<PrivateRoute element={<Subscription />} />} />
                <Route path="/payment" element={<PrivateRoute element={<Payment />} />} />
                <Route path="/payment-success" element={<PrivateRoute element={<PaymentSuccess />} />} />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </RocketCreditsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
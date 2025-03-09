import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = login(email, password);
      if (response.success) {
        // Check if user is admin
        if (email.toLowerCase() === 'admin@example.com') {
          navigate("/admin");
        } else {
          navigate("/subscribe");
        }
      } else {
        setError(response.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center"> {/* Center the form */}
      <h2 className="text-2xl font-bold text-center">Login</h2>
      
      {/* Subscription information message */}
      <div className="bg-gray-800 p-4 rounded-lg mt-4 mb-4 max-w-md text-center border-l-4 border-green-500">
        <h3 className="text-lg font-semibold mb-2">Want to subscribe to our service?</h3>
        <p className="text-gray-300">
          You need to be logged in to purchase a subscription. Please login or create an account to continue.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-800 p-4 rounded-lg mt-2 mb-4 max-w-md text-center border-l-4 border-red-500">
          <p className="text-white">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-red-600"
        >
          Login
        </button>
      </form>
      <p className="text-center mt-2">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-600">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // assuming login function is exposed

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if (response.success) {
        if (email.toLowerCase() === 'admin@example.com') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setError(response.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="mt-4 flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
      <p className="text-center mt-2">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
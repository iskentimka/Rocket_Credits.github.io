import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";


const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await signup(email, password);
      if (response.success) {
        navigate("/subscribe");
      } else {
        setError(response.message || "User already exists.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold text-center">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSignup} className="mt-4 flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
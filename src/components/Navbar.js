import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 p-4 text-white flex justify-between items-center">
      <Link to="/">
        <img src="/logo.png" alt="StreamFlix Logo" className="h-6 navbar-logo" />
      </Link>
      <div className="flex space-x-6"> {/* Added space between buttons */}
        {user ? (
          <>
            <span className="mr-4">Welcome, {user.email}</span>
            <p> </p>
            <Link to="/subscribe" className="px-4 py-2 bg-gray-700 rounded">Subscribe</Link>
            <button onClick={logout} className="bg-red-100 px-1 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 bg-gray-700 rounded">Login</Link>
            <p></p>
            <Link to="/signup" className="bg-blue-600 px-4 py-2 rounded">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

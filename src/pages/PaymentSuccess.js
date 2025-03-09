import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
      <p>Thank you for your subscription.</p>
      <Link to="/home" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded">Go to Home</Link>
    </div>
  );
};

export default PaymentSuccess;
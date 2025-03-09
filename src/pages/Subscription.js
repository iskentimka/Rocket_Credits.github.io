import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Subscription = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic Plan",
      price: 5.99,
      features: ["SD Streaming", "1 Device", "No Downloads"]
    },
    {
      name: "Standard Plan",
      price: 9.99,
      features: ["HD Streaming", "2 Devices", "Downloads Available"]
    },
    {
      name: "Premium Plan",
      price: 14.99,
      features: ["Ultra HD & 4K Streaming", "4 Devices", "Unlimited Downloads"]
    }
  ];

  const handlePlanSelect = (plan) => {
    navigate("/payment", { state: { planDetails: plan } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      {/* Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="mt-2 text-lg">Pay using Card, PayPal, or Rocket Credits.</p>
      </div>

      {/* Single Row, 3 Columns (Table Centered) */}
      <div className="subscription-plans-container">
        <table className="table-auto">
          <tbody>
            <tr>
              {plans.map((plan, index) => (
                <td key={index} className="align-top p-4">
                  <div className="border p-6 rounded-lg shadow-lg bg-gray-800 w-72">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-gray-300">${plan.price} / month</p>
                    <ul className="mt-4 text-gray-400 list-none">
                      {plan.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded text-lg w-full"
                    >
                      Choose Plan
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Method Icons */}
      <div className="flex justify-center gap-10 mt-6">
        <img src={`${process.env.PUBLIC_URL}/images/card.png`} alt="Credit Card" className="payment-icon card" />
        <img src={`${process.env.PUBLIC_URL}/images/paypal.png`} alt="PayPal" className="payment-icon paypal" />
        <img src={`${process.env.PUBLIC_URL}/images/rocket.png`} alt="Rocket Credits" className="payment-icon rocket" />
      </div>
    </div>
  );
};

export default Subscription;
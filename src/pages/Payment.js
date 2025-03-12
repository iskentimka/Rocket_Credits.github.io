import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Payment = () => {
  const location = useLocation();
  const planDetails = location.state?.planDetails || { name: "Standard Plan", price: 9.99 };
  
  const [method, setMethod] = useState("card");
  const [showRocketInfo, setShowRocketInfo] = useState(false);
  const [rocketPaymentType, setRocketPaymentType] = useState("credit"); // "credit" or "installment"
  const [returnDate, setReturnDate] = useState("");
  const [returnAmount, setReturnAmount] = useState(0);
  const [installmentPeriod, setInstallmentPeriod] = useState(3); // Default 3 months
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });
  const [paypalDetails, setPaypalDetails] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { user, canUseRocketCredits, increaseRiskScore } = useAuth();
  const navigate = useNavigate();

  // Calculate monthly installment amount
  const monthlyInstallment = (planDetails.price * (installmentPeriod > 3 ? 1.4 : 1.2) / installmentPeriod).toFixed(2);

  // Check if user can use Rocket Credits
  useEffect(() => {
    if (method === "rocket" && user) {
      const rocketEligibility = canUseRocketCredits(user.email);
      if (!rocketEligibility.allowed) {
        setError(rocketEligibility.message);
        // Reset payment method to card
        setMethod("card");
      } else {
        setError("");
      }
    }
  }, [method, user, canUseRocketCredits]);

  // Check user status when component loads
  useEffect(() => {
    if (user) {
      // Get users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user
      const userData = users.find(u => u.email === user.email);
      
      // If user is marked as bad, show warning
      if (userData && userData.status === 'bad') {
        setError("Note: Due to your payment history, some payment methods may be restricted.");
      }
    }
  }, [user]);

  const handlePayment = async () => {
    // Clear previous errors and reset progress
    setError("");
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      if (method === "rocket") {
        // Get users array to check if user is bad
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = users.find(u => u.email === user.email);
        
        // Simulate payment processing with progress updates
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 5 steps * 600ms = 3 seconds total
          setLoadingProgress(i);
        }

        // After loading, check if user is bad and show error
        if (userData && userData.status === 'bad' || (userData && userData.email === 'baduser@example.com')) {
          setError("We apologize, but we cannot provide Rocket Credits at this time due to your payment history. Please try another payment method.");
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else if (method === "card") {
        // Validate card details
        if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
          setError("Please fill in all card details");
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Check for suspicious card behavior (demo purposes)
        if (cardDetails.cardNumber === "1111222233334444") {
          // This is a known bad card number for demo
          if (user) {
            increaseRiskScore(user.email, 30);
            setError("This card has been flagged for suspicious activity. Your account risk score has been increased.");
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }

        // Simulate payment processing with progress updates
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 600));
          setLoadingProgress(i);
        }
      } else if (method === "paypal") {
        // Validate PayPal details
        if (!paypalDetails.email || !paypalDetails.password) {
          setError("Please fill in all PayPal details");
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Simulate payment processing with progress updates
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 600));
          setLoadingProgress(i);
        }
      }

      // If we get here and it's not a bad user with Rocket Credits, payment was successful
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate("/payment-success");
    } catch (error) {
      setError("An error occurred while processing your payment. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleRocketSelect = () => {
    // Check if user can use Rocket Credits before setting method
    if (user) {
      const rocketEligibility = canUseRocketCredits(user.email);
      if (!rocketEligibility.allowed) {
        setError(rocketEligibility.message);
        // Keep current payment method instead of switching to rocket
        return;
      }
    }
    
    setMethod("rocket");
    setShowRocketInfo(true);
  };

  const closeRocketInfo = () => {
    setShowRocketInfo(false);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaypalChange = (e) => {
    const { name, value } = e.target;
    setPaypalDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReturnDateChange = (e) => {
    const selectedDate = e.target.value;
    setReturnDate(selectedDate);
    
    // Calculate return amount based on selected date
    const today = new Date();
    const returnDay = new Date(selectedDate);
    const diffTime = Math.abs(returnDay - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate return amount: shorter period = higher return percentage
    let returnPercentage = 0;
    if (diffDays <= 30) {
      returnPercentage = 1.1; 
    } else if (diffDays <= 60) {
      returnPercentage = 1.5;
    } else if (diffDays <= 90) {
      returnPercentage = 1.7;
    } else {
      returnPercentage = 2.0;
    }
    
    setReturnAmount((planDetails.price * returnPercentage).toFixed(2));
  };

  const handleInstallmentPeriodChange = (e) => {
    setInstallmentPeriod(parseInt(e.target.value));
  };

  // Get minimum date (today) and maximum date (1 year from now)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Calculate the circle's circumference and offset
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (loadingProgress / 100) * circumference;

  // Display error message with more prominence
  const renderErrorMessage = () => {
    if (!error) return null;
    
    // Check if it's a payment history related error
    const isPaymentHistoryError = error.includes("payment history") || 
                                 error.includes("suspicious payment") || 
                                 error.includes("risk assessment");
    
    return (
      <div className={`p-4 rounded-lg mt-4 mb-4 text-center border-l-4 ${isPaymentHistoryError ? 'bg-red-800 border-red-500' : 'bg-yellow-800 border-yellow-500'}`}>
        <p className="text-white font-medium">{error}</p>
        {isPaymentHistoryError && (
          <p className="text-gray-300 text-sm mt-2">
            You can still complete your purchase using other payment methods.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 text-center">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            {/* SVG Progress Circle */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="transform -rotate-90 w-24 h-24">
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              {/* Percentage text in the middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{loadingProgress}%</span>
              </div>
            </div>
            <p className="text-xl text-white">Processing your payment...</p>
            <p className="text-gray-400 mt-2">Please do not close this window.</p>
            {/* Loading steps */}
            <div className="mt-4 text-left text-sm text-gray-400">
              <p className={loadingProgress >= 20 ? 'text-green-400' : ''}>✓ Validating payment details...</p>
              <p className={loadingProgress >= 40 ? 'text-green-400' : ''}>✓ Securing transaction...</p>
              <p className={loadingProgress >= 60 ? 'text-green-400' : ''}>✓ Processing payment...</p>
              <p className={loadingProgress >= 80 ? 'text-green-400' : ''}>✓ Confirming transaction...</p>
              <p className={loadingProgress >= 100 ? 'text-green-400' : ''}>✓ Finalizing payment...</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-2">Selected Plan: {planDetails.name}</h3>
        <p className="text-gray-300">${planDetails.price} / month</p>
      </div>
      
      {renderErrorMessage()}
      
      <div className="flex justify-center gap-10 mt-4"> {/* Payment images layout */}
        <img 
          src={`${process.env.PUBLIC_URL}/images/card.png`} 
          alt="Credit Card" 
          className={`payment-icon ${method === "card" ? "selected" : ""}`} 
          onClick={() => { setMethod("card"); setError(""); }} 
        />
        <img 
          src={`${process.env.PUBLIC_URL}/images/paypal.png`} 
          alt="PayPal" 
          className={`payment-icon ${method === "paypal" ? "selected" : ""}`} 
          onClick={() => { setMethod("paypal"); setError(""); }} 
        />
        <img 
          src={`${process.env.PUBLIC_URL}/images/rocket.png`} 
          alt="Rocket Credits"
          className={`payment-icon ${method === "rocket" ? "selected" : ""}`} 
          onClick={handleRocketSelect} 
        />
      </div>

      {/* Payment Method Forms */}
      <div className="mt-6 max-w-md mx-auto">
        {/* Credit Card Form */}
        {method === "card" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Credit Card Details</h3>
            <div className="text-left">
              <div className="mb-3">
                <input 
                  type="text" 
                  name="cardNumber"
                  placeholder="Card Number:1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  className="w-full"
                />
              </div>
              <div className="mb-3">
                <input 
                  type="text" 
                  name="cardName"
                  placeholder="Cardholder Name: John Doe"
                  value={cardDetails.cardName}
                  onChange={handleCardChange}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <div className="mb-3 flex-1">
                  <input 
                    type="text" 
                    name="expiryDate"
                    placeholder="Expiry Date: MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardChange}
                    className="w-full"
                  />
                </div>
                <div className="mb-3 flex-1">
                  <input 
                    type="text" 
                    name="cvv"
                    placeholder="CVV: 123"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PayPal Form */}
        {method === "paypal" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">PayPal Login</h3>
            <div className="text-left">
              <div className="mb-3">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email: email@example.com"
                  value={paypalDetails.email}
                  onChange={handlePaypalChange}
                  className="w-full"
                />
              </div>
              <div className="mb-3">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password: Your PayPal password"
                  value={paypalDetails.password}
                  onChange={handlePaypalChange}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                You will be redirected to PayPal to complete your payment securely.
              </p>
            </div>
          </div>
        )}

        {/* Rocket Credits */}
        {method === "rocket" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Rocket Payment</h3>
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <div className="text-sm text-gray-300 flex flex-col items-center">
                <div className="paragraph">
                  <p>Rocket Credits is our secure payment solution that analyzes your account information to provide flexible payment options for your subscription.</p>
                </div>
                <div className="paragraph">
                  <p>Account Analysis: We scan and analyze your account information only after your explicit agreement with our platform.</p>
                </div>
                <div className="paragraph">
                  <p>Usage Restrictions: Rocket Credits can only be used for subscription payments on our platform. No other spending is allowed.</p>
                </div>
                <div className="paragraph">
                  <p>Payment Options: Choose between credit or installment payment plans.</p>
                </div>
                <div className="paragraph">
                  <p>Credit Terms: Longer repayment periods result in higher percentage rates added to the provided amount.</p>
                </div>
                <div className="paragraph">
                  <p>Installment Flexibility: Select your preferred payment period (weekly, monthly, or yearly). Longer periods incur higher percentage rates.</p>
                </div>
                <div className="paragraph">
                  <p className="text-red-400">Important Note: Rocket Credits reserves the right to reject credit applications without explanation.</p>
                </div>
              </div>
            </div>
            
            {/* Payment Type Selection */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Choose Payment Type</h4>
              <div className="flex justify-center gap-4">
                <button 
                  className={`px-4 py-2 rounded ${rocketPaymentType === "credit" ? "bg-green-600" : "bg-gray-700"}`}
                  onClick={() => setRocketPaymentType("credit")}
                >
                  Credit Plan
                </button>
                <button 
                  className={`px-4 py-2 rounded ${rocketPaymentType === "installment" ? "bg-green-600" : "bg-gray-700"}`}
                  onClick={() => setRocketPaymentType("installment")}
                >
                  Installment Plan
                </button>
              </div>
            </div>
            
            {/* Credit Plan Options */}
            {rocketPaymentType === "credit" && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold mb-3">Credit Plan</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Pay the full amount now (${planDetails.price}) and select a return date. The longer the period you choose, the higher the percentage rate will be added to your payment.
                </p>
                
                <div className="text-left mb-4">
                  <label className="block text-gray-300 mb-1">Return Date: </label>
                  <input 
                    type="date" 
                    min={today}
                    max={maxDateString}
                    value={returnDate}
                    onChange={handleReturnDateChange}
                    className="w-full"
                  />
                </div>
                
                {returnDate && (
                  <div className="bg-gray-700 p-3 rounded mb-3">
                    <p className="text-xl text-green-400">Your dept ${returnAmount} back</p>
                    <p className="text-xs text-gray-400 mt-1">
                      (The return amount increases the longer you avoid to pay)
                    </p>
                    <p className="text-xs text-red-400 mt-2">
                      Note: The percentage rate increases with longer return periods
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Installment Plan Options */}
            {rocketPaymentType === "installment" && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold mb-3">Installment Plan</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Split your payment into installments. Choose your preferred period (weekly, monthly, or yearly). The longer the period, the higher the percentage rate will be added to your total payment.
                </p>
                
                <div className="text-left mb-4">
                  <label className="block text-gray-300 mb-1">Payment Period: </label>
                  <select 
                    value={installmentPeriod} 
                    onChange={handleInstallmentPeriodChange}
                    className="w-full"
                  >
                    <option value="3">Monthly (3 months)</option>
                    <option value="6">Monthly (6 months)</option>
                    <option value="12">Monthly (1 year)</option>
                  </select>
                </div>
                
                <div className="bg-gray-700 p-3 rounded mb-3">
                  <p className="font-bold">Payment Schedule:</p>
                  <p className="text-md">Total: ${planDetails.price}</p>
                  <p className="text-xl text-green-400">${monthlyInstallment} / {installmentPeriod === '1' ? 'week' : 'month'} for {installmentPeriod} {installmentPeriod === '1' ? 'weeks' : 'months'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    First payment due today: ${monthlyInstallment}
                  </p>
                  <p className="text-xs text-red-400 mt-2">
                    Note: Longer payment periods will result in higher total costs due to increased percentage rates
                  </p>
                </div>
                
                <div className="bg-gray-700 p-3 rounded mb-3">
                  <h5 className="font-semibold mb-2">Important Terms:</h5>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Automatic payments required from your linked payment method</li>
                    <li>• Payment method must remain valid throughout the installment period</li>
                    <li>• Longer periods result in higher percentage rates</li>
                    <li>• Rocket Credits reserves the right to reject installment applications</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handlePayment} 
        disabled={isLoading}
        className={`mt-6 bg-green-600 max-w-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Processing...' : 'Complete Payment'}
      </button>

      {/* Rocket Credits Information Modal */}
      {showRocketInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">About Rocket Credits</h3>
            </div>
            
    
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;

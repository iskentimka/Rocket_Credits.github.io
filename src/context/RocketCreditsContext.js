import React, { createContext, useContext, useState } from "react";

// Create Context
const RocketCreditsContext = createContext();

// Provider Component
export const RocketCreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(50); // Default credits

  // Function to deduct credits for payment
  const deductCredits = (amount) => {
    if (credits >= amount) {
      setCredits((prev) => prev - amount);
      return true;
    }
    return false;
  };

  // Function to add credits (based on reputation)
  const addCredits = (amount) => {
    setCredits((prev) => prev + amount);
  };

  return (
    <RocketCreditsContext.Provider value={{ credits, deductCredits, addCredits }}>
      {children}
    </RocketCreditsContext.Provider>
  );
};

// Custom Hook for Accessing Context
export const useRocketCredits = () => {
  return useContext(RocketCreditsContext);
};
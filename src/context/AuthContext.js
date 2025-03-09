import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create Auth Context
const AuthContext = createContext();

// List of known bad users (in a real app, this would come from a database)
const BAD_USERS = [
  'baduser@example.com',
  'scammer@example.com',
  'fraud@example.com'
];

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores logged-in user
  const [badUsers, setBadUsers] = useState(BAD_USERS); // List of bad users
  const navigate = useNavigate();
  // Check for existing session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load bad users list from localStorage or use default
    const storedBadUsers = localStorage.getItem('badUsers');
    if (storedBadUsers) {
      setBadUsers(JSON.parse(storedBadUsers));
    } else {
      localStorage.setItem('badUsers', JSON.stringify(BAD_USERS));
    }
  }, []);

  // Signup Function
  const signup = (email, password) => {
    try {

      // Get existing users or initialize empty array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some(user => user.email === email)) {
        return { success: false, message: "User already exists." };
      }

      // Create new user with initial data
      const newUser = {
        email,
        password: btoa(password), // Basic encoding (in production, use proper hashing)
        createdAt: new Date().toISOString(),
        subscription: null,
        paymentHistory: [],
        status: 'good', // Default status is good
        riskScore: 0, // Risk score starts at 0
        profile: {
          name: '',
          phone: '',
          address: ''
        }
      };

      // Add new user to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: "An error occurred during signup." };
    }
  };

  // Login Function
  const login = (email, password) => {
    try {
      // Get users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user
      const userData = users.find(user => user.email === email);
      if (!userData) return { success: false, message: "User not found." };

      // Check password (in production, use proper password comparison)
      if (userData.password !== btoa(password)) return { success: false, message: "Invalid password." };

      // Remove sensitive data before storing in state
      const { password: _, ...userWithoutPassword } = userData;
      
      // Set current user
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: "An error occurred during login." };
    }
  };

  // Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate("/login");
  };

  // Update User Profile
  const updateProfile = (profileData) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === user.email);
      
      if (userIndex === -1) return false;

      // Update user profile
      users[userIndex].profile = {
        ...users[userIndex].profile,
        ...profileData
      };

      // Update localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user state
      const updatedUser = {
        ...user,
        profile: users[userIndex].profile
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  // Update Subscription
  const updateSubscription = (subscriptionData) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === user.email);
      
      if (userIndex === -1) return false;

      // Update user subscription
      users[userIndex].subscription = subscriptionData;

      // Add to payment history
      users[userIndex].paymentHistory.push({
        date: new Date().toISOString(),
        type: subscriptionData.type,
        amount: subscriptionData.price,
        status: 'completed'
      });

      // Update localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user state
      const updatedUser = {
        ...user,
        subscription: subscriptionData,
        paymentHistory: users[userIndex].paymentHistory
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Subscription update error:', error);
      return false;
    }
  };

  // Check if user can use Rocket Credits
  const canUseRocketCredits = (email) => {

    // Get users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const userData = users.find(user => user.email === email);
    if (!userData) return { allowed: false, message: "User not found." };

    // Check user status
    if (userData.status === 'bad') {
      return { allowed: true, message: "Your account has been flagged for suspicious payment activity. Rocket Credits can reject your application." };
    }

    // Check risk score
    if (userData.riskScore > 70) {
      return { allowed: true, message: "Due to your account's risk assessment, Rocket Credits can reject your application." };
    }

    return { allowed: true };
  };

  // Mark user as bad
  const markUserAsBad = (email, reason = "Suspicious activity") => {
    try {
      // Update bad users list
      const updatedBadUsers = [...badUsers, email.toLowerCase()];
      setBadUsers(updatedBadUsers);
      localStorage.setItem('badUsers', JSON.stringify(updatedBadUsers));

      // Update user status in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].status = 'bad';
        users[userIndex].riskScore = 100;
        users[userIndex].suspensionReason = reason;
        users[userIndex].suspensionDate = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
      }

      // If the current user is being marked as bad, log them out
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        logout();
      }

      return true;
    } catch (error) {
      console.error('Error marking user as bad:', error);
      return false;
    }
  };

  // Mark user as good
  const markUserAsGood = (email) => {
    try {
      // Remove from bad users list
      const updatedBadUsers = badUsers.filter(e => e.toLowerCase() !== email.toLowerCase());
      setBadUsers(updatedBadUsers);
      localStorage.setItem('badUsers', JSON.stringify(updatedBadUsers));

      // Update user status in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].status = 'good';
        users[userIndex].riskScore = Math.max(0, users[userIndex].riskScore - 50); // Reduce risk score
        users[userIndex].suspensionReason = null;
        users[userIndex].suspensionDate = null;
        localStorage.setItem('users', JSON.stringify(users));
      }

      return true;
    } catch (error) {
      console.error('Error marking user as good:', error);
      return false;
    }
  };

  // Increase user risk score
  const increaseRiskScore = (email, points = 10) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].riskScore = Math.min(100, (users[userIndex].riskScore || 0) + points);
        
        // If risk score exceeds threshold, mark as bad
        if (users[userIndex].riskScore >= 80 && users[userIndex].status !== 'bad') {
          users[userIndex].status = 'bad';
          
          // Also add to bad users list
          const updatedBadUsers = [...badUsers, email.toLowerCase()];
          setBadUsers(updatedBadUsers);
          localStorage.setItem('badUsers', JSON.stringify(updatedBadUsers));
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // If the current user's risk score is being increased, update their state
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
          const updatedUser = {
            ...user,
            riskScore: users[userIndex].riskScore,
            status: users[userIndex].status
          };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          // If user is now bad, log them out
          if (users[userIndex].status === 'bad') {
            logout();
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error increasing risk score:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout,
      updateProfile,
      updateSubscription,
      canUseRocketCredits,
      markUserAsBad,
      markUserAsGood,
      increaseRiskScore,
      badUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to Use Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};
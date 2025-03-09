import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [badUserEmail, setBadUserEmail] = useState('');
  const [badUserReason, setBadUserReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user, markUserAsBad, markUserAsGood, badUsers } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if current user is admin
    if (!user || user.email !== 'admin@example.com') {
      navigate('/login');
      return;
    }

    // Load users from localStorage
    const loadUsers = () => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(storedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [user, navigate, successMessage]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleMarkAsBad = (email, reason = badUserReason) => {
    if (markUserAsBad(email, reason)) {
      setSuccessMessage(`User ${email} has been marked as bad.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedUser(null);
      setBadUserEmail('');
      setBadUserReason('');
    }
  };

  const handleMarkAsGood = (email) => {
    if (markUserAsGood(email)) {
      setSuccessMessage(`User ${email} has been marked as good.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedUser(null);
    }
  };

  const handleAddBadUser = (e) => {
    e.preventDefault();
    if (!badUserEmail) return;
    
    handleMarkAsBad(badUserEmail);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {successMessage && (
        <div className="bg-green-600 p-4 rounded-lg mb-6 text-white">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - User Management */}
        <div className="md:col-span-1">
          {/* Add Bad User Form */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Bad User</h2>
            <form onSubmit={handleAddBadUser}>
              <div className="mb-3">
                <label className="block text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={badUserEmail}
                  onChange={(e) => setBadUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-300 mb-1">Reason</label>
                <input 
                  type="text" 
                  value={badUserReason}
                  onChange={(e) => setBadUserReason(e.target.value)}
                  placeholder="Reason for marking as bad"
                  className="w-full"
                />
              </div>
              <button 
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded w-full"
              >
                Add to Bad Users
              </button>
            </form>
          </div>
          
          {/* Users List */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {users.map((user, index) => (
                <div
                  key={index}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedUser?.email === user.email
                      ? 'bg-green-600'
                      : user.status === 'bad'
                        ? 'bg-red-800 hover:bg-red-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{user.email}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'bad' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {user.status || 'good'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Joined: {formatDate(user.createdAt)}
                  </p>
                  {user.riskScore > 0 && (
                    <p className="text-sm">
                      Risk Score: 
                      <span className={`ml-1 ${
                        user.riskScore > 70 ? 'text-red-400' : 
                        user.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {user.riskScore}/100
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - User Details */}
        <div className="md:col-span-2">
          {selectedUser ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold">User Details</h2>
                <div className="flex gap-2">
                  {selectedUser.status === 'bad' ? (
                    <button 
                      onClick={() => handleMarkAsGood(selectedUser.email)}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Mark as Good
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleMarkAsBad(selectedUser.email, "Admin action")}
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Mark as Bad
                    </button>
                  )}
                </div>
              </div>
              
              {/* Status Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Status Information</h3>
                <div className="bg-gray-700 rounded p-4">
                  <div className="flex items-center mb-2">
                    <p className="font-medium mr-2">Current Status:</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedUser.status === 'bad' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {selectedUser.status || 'good'}
                    </span>
                  </div>
                  <p><span className="font-medium">Risk Score:</span> {selectedUser.riskScore || 0}/100</p>
                  {selectedUser.suspensionReason && (
                    <p><span className="font-medium">Suspension Reason:</span> {selectedUser.suspensionReason}</p>
                  )}
                  {selectedUser.suspensionDate && (
                    <p><span className="font-medium">Suspended On:</span> {formatDate(selectedUser.suspensionDate)}</p>
                  )}
                </div>
              </div>
              
              {/* Profile Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Profile</h3>
                <div className="bg-gray-700 rounded p-4">
                  <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                  <p><span className="font-medium">Name:</span> {selectedUser.profile?.name || 'Not set'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedUser.profile?.phone || 'Not set'}</p>
                  <p><span className="font-medium">Address:</span> {selectedUser.profile?.address || 'Not set'}</p>
                  <p><span className="font-medium">Joined:</span> {formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Current Subscription</h3>
                <div className="bg-gray-700 rounded p-4">
                  {selectedUser.subscription ? (
                    <>
                      <p><span className="font-medium">Plan:</span> {selectedUser.subscription.type}</p>
                      <p><span className="font-medium">Price:</span> ${selectedUser.subscription.price}/month</p>
                    </>
                  ) : (
                    <p className="text-gray-400">No active subscription</p>
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-medium mb-2">Payment History</h3>
                <div className="bg-gray-700 rounded p-4">
                  {selectedUser.paymentHistory && selectedUser.paymentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.paymentHistory.map((payment, index) => (
                        <div key={index} className="border-b border-gray-600 last:border-0 pb-2">
                          <p className="font-medium">{payment.type}</p>
                          <p className="text-sm text-gray-300">Amount: ${payment.amount}</p>
                          <p className="text-sm text-gray-300">Date: {formatDate(payment.date)}</p>
                          <p className="text-sm text-gray-300">Status: {payment.status}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No payment history</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Bad Users List</h2>
              {badUsers && badUsers.length > 0 ? (
                <div className="bg-gray-700 rounded p-4">
                  <ul className="space-y-2">
                    {badUsers.map((email, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-gray-600 last:border-0 pb-2">
                        <span>{email}</span>
                        <button 
                          onClick={() => handleMarkAsGood(email)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Mark as Good
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-400">No bad users in the system</p>
              )}
              
              <div className="mt-6">
                <p className="text-gray-300">Select a user from the list to view details or manage their status.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
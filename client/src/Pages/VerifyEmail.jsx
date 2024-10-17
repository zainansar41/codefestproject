import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { verifyEmail } from '../Hooks/customHooks';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 

export default function VerifyEmail() {
  const [token, setToken] = useState('');
  const navigate = useNavigate(); // Initialize navigate
  
  // Custom hook to parse query params
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQuery(); // Call useQuery outside of useEffect

  useEffect(() => {
    const tokenFromQuery = query.get('token');
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [query]);

  // Function to handle verification
  const handleVerify = async () => {
    if (token) {
      console.log(`Verifying token: ${token}`);
      const response = await verifyEmail(token);
      if (response.success) {
        toast.success("Mail Verified");
        localStorage.setItem("token", token)
        navigate('/'); // Navigate to home page
      } else {
        toast.error("Verification failed");
      }
    } else {
      console.error('No token provided');
      toast.error("No token provided");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center p-6 border border-white rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
        {token ? (
          <p className="text-xl mb-6">
            Please verify your email by clicking the button below.
          </p>
        ) : (
          <p className="text-xl mb-6">
            Invalid or missing token.
          </p>
        )}
        <button 
          onClick={handleVerify} 
          className="bg-white text-black py-2 px-4 rounded-lg hover:bg-gray-300">
          Verify Now
        </button>
      </div>
    </div>
  );
}

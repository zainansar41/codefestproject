import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAcceptTeamLeadInvite } from '../Hooks/customHooks'; // Custom hook to accept invite
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InviteTeamLead() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const { acceptInvite } = useAcceptTeamLeadInvite(); // Destructure the custom hook function

  // Extract token from query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromQuery = searchParams.get('token');
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      toast.error('No token found, redirecting to login...');
      navigate('/login');
    }
    const teamLeadId = localStorage.getItem('userID');
    if(!teamLeadId){
        navigate('/login');
    }
    
  }, [location, navigate]);

  const handleAcceptInvite = async () => {
    const teamLeadId = localStorage.getItem('userID'); // Assuming you store teamLeadId in localStorage
    if (token && teamLeadId) {
      const response = await acceptInvite(token, teamLeadId);
      if (response.success) {
        toast.success('You have successfully accepted the invite!');
        // Navigate to workspace or another appropriate page
        navigate(`/workspace/${response.workspaceid}`);
      } else {
        toast.error(response.message || 'Failed to accept invitation');
      }
    } else {
      toast.error('Invalid token or teamLeadId');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center p-6 border border-white rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Team Lead Invitation</h1>
        <p className="text-xl mb-6">
          You have been invited to join as a Team Lead. Please accept the invite to proceed.
        </p>
        <button
          onClick={handleAcceptInvite}
          className="bg-white text-black py-2 px-4 rounded-lg hover:bg-gray-300"
        >
          Accept Invite
        </button>
      </div>
    </div>
  );
}

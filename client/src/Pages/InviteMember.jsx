import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAcceptTeamMemberInvite } from '../Hooks/customHooks'; // Import the custom hook

export default function InviteMember() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const { acceptInvite } = useAcceptTeamMemberInvite(); // Use the hook

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

    const memberID = localStorage.getItem('userID');
    if(!memberID){
        navigate('/login');
    }
  }, [location, navigate]);

  const handleAcceptInvite = async () => {
    const memberId = localStorage.getItem('userID'); // Assuming you store memberId in localStorage
    if (token && memberId) {
      const response = await acceptInvite(token, memberId);
      if (response.success) {
        toast.success('You have successfully accepted the invite!');
        // Navigate to workspace or another appropriate page
        navigate(`/workspace/${response.workspaceId}`);
      } else {
        toast.error(response.message || 'Failed to accept invitation');
      }
    } else {
      toast.error('Invalid token or memberId');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center p-6 border border-white rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Team Member Invitation</h1>
        <p className="text-xl mb-6">
          You have been invited to join as a Team Member. Please accept the invite to proceed.
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

import React, { useState, useEffect } from 'react';
import { getWorkspacewithUserRole, createWorkspace } from '../Hooks/customHooks';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Workspace() {
  const [createdWorkspaces, setCreatedWorkspaces] = useState([]);
  const [teamLeadWorkspaces, setTeamLeadWorkspaces] = useState([]);
  const [teamMemberWorkspaces, setTeamMemberWorkspaces] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  
  const navigate = useNavigate(); // Initialize navigate function

  const loadData = async () => {
    const data = await getWorkspacewithUserRole();
    setCreatedWorkspaces(data.createdWorkspaces);
    setTeamLeadWorkspaces(data.teamLeadWorkspaces);
    setTeamMemberWorkspaces(data.teamMemberWorkspaces);
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await createWorkspace({ newWorkspaceName, newWorkspaceDescription });

      if (response.workspace) {
        setCreatedWorkspaces((prev) => [...prev, response.workspace]);
        toast.success("Workspace created");
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleOpenWorkspace = (id) => {
    navigate(`/workspace/${id}`); // Navigate to workspace/:id
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="relative p-4 min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-center">Workspace Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Created Workspaces */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Created Workspaces</h3>
          {createdWorkspaces.length > 0 ? (
            createdWorkspaces.map((workspace, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow duration-300">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{workspace.name}</h4>
                <p className="text-gray-600 mb-4">{workspace.description}</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 transition-colors duration-300"
                  onClick={() => handleOpenWorkspace(workspace._id)} // Handle click to open workspace
                >
                  Open Workspace
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No created workspaces found.</p>
          )}
        </div>

        {/* Team Lead Workspaces */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Team Lead Workspaces</h3>
          {teamLeadWorkspaces.length > 0 ? (
            teamLeadWorkspaces.map((workspace, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow duration-300">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{workspace.name}</h4>
                <p className="text-gray-600 mb-4">{workspace.description}</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 transition-colors duration-300"
                  onClick={() => handleOpenWorkspace(workspace._id)} // Handle click to open workspace
                >
                  Open Workspace
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No team lead workspaces found.</p>
          )}
        </div>

        {/* Team Member Workspaces */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Team Member Workspaces</h3>
          {teamMemberWorkspaces.length > 0 ? (
            teamMemberWorkspaces.map((workspace, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow duration-300">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{workspace.name}</h4>
                <p className="text-gray-600 mb-4">{workspace.description}</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 transition-colors duration-300"
                  onClick={() => handleOpenWorkspace(workspace._id)} // Handle click to open workspace
                >
                  Open Workspace
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No team member workspaces found.</p>
          )}
        </div>
      </div>

      {/* Button to open modal */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        + Create Workspace
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
            <h3 className="text-lg font-semibold">Create New Workspace</h3>

            {/* Workspace Name Input */}
            <input
              type="text"
              placeholder="Workspace Name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full my-4"
            />

            {/* Workspace Description Input */}
            <textarea
              placeholder="Workspace Description"
              value={newWorkspaceDescription}
              onChange={(e) => setNewWorkspaceDescription(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full my-4"
              rows="4"
            />

            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 mr-2 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleCreateWorkspace}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

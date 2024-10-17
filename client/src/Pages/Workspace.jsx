import React, { useState, useEffect } from 'react';
import { getWorkspacewithUserRole, createWorkspace, startDailySession, endDailySession, getUserByID } from '../Hooks/customHooks';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function Workspace() {
    const [createdWorkspaces, setCreatedWorkspaces] = useState([]);
    const [teamLeadWorkspaces, setTeamLeadWorkspaces] = useState([]);
    const [teamMemberWorkspaces, setTeamMemberWorkspaces] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
    const [isSessionActive, setIsSessionActive] = useState(false); // To check if session is active
    const [timeSpent, setTimeSpent] = useState(0); // Track total time spent
    const [sessionStartTime, setSessionStartTime] = useState(null); // Track start time of current session
    const [totalTimeSpent, setTotalTimeSpent] = useState(0); // Keep track of total time spent for the day

    const navigate = useNavigate();

    const loadData = async () => {
        const token = await localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const data = await getWorkspacewithUserRole();
        setCreatedWorkspaces(data.createdWorkspaces);
        setTeamLeadWorkspaces(data.teamLeadWorkspaces);
        setTeamMemberWorkspaces(data.teamMemberWorkspaces);

        const userId = await localStorage.getItem('userID');
        const userData = await getUserByID(userId);

        // Safely access timeSpentPerDay array
        if (userData && Array.isArray(userData.timeSpentPerDay)) {
            const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

            // Check if there is an ongoing session (started but not ended today)
            const todaySession = userData.timeSpentPerDay.find(entry =>
                new Date(entry.date).toISOString().slice(0, 10) === today
            );

            if (todaySession) {
                // If session exists today, calculate the time already spent
                const previousTimeSpent = todaySession.timeSpent || 0;
                setTotalTimeSpent(previousTimeSpent);

                if (!todaySession.endTime) {
                    // If session is ongoing, set start time and mark session active
                    setIsSessionActive(true);
                    const sessionStart = new Date(todaySession.startTime);
                    setSessionStartTime(sessionStart);

                    // Calculate time already spent since session started
                    const currentTime = new Date();
                    const timeDifference = Math.floor((currentTime - sessionStart) / 1000); // Difference in seconds
                    setTimeSpent(timeDifference + previousTimeSpent);

                    // Store session state in localStorage
                    localStorage.setItem('sessionStartTime', sessionStart.toISOString()); // Store start time in localStorage
                    localStorage.setItem('isSessionActive', 'true'); // Mark session as active in localStorage
                } else {
                    setTimeSpent(previousTimeSpent);
                }
            }
        } else {
            console.error("User data or timeSpentPerDay is undefined or not an array");
        }

        // Restore session state from localStorage
        const savedSessionStartTime = localStorage.getItem('sessionStartTime');
        const savedIsSessionActive = localStorage.getItem('isSessionActive') === 'true';

        if (savedIsSessionActive && savedSessionStartTime) {
            setIsSessionActive(true);
            setSessionStartTime(new Date(savedSessionStartTime)); // Restore session start time
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleStartSession = async () => {
        const userId = localStorage.getItem('userID');
        const result = await startDailySession(userId);

        if (result.success) {
            setIsSessionActive(true);
            const startTime = new Date();
            setSessionStartTime(startTime); // Start tracking the time from now
            localStorage.setItem('sessionStartTime', startTime.toISOString()); // Save session start time in localStorage
            localStorage.setItem('isSessionActive', 'true'); // Save session active state in localStorage
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const handleEndSession = async () => {
        const userId = localStorage.getItem('userID');
        const result = await endDailySession(userId);

        if (result.success) {
            setIsSessionActive(false);
            setSessionStartTime(null);
            localStorage.removeItem('sessionStartTime'); // Remove session data from localStorage
            localStorage.removeItem('isSessionActive');
            setTotalTimeSpent(timeSpent); // Save the cumulative time spent before ending the session
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    useEffect(() => {
        let interval = null;

        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                const currentTime = new Date();
                const timeDifference = Math.floor((currentTime - sessionStartTime) / 1000); // Difference in seconds
                setTimeSpent(timeDifference + totalTimeSpent); // Add previous time spent
            }, 1000);
        } else if (!isSessionActive && interval) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isSessionActive, sessionStartTime, totalTimeSpent]);

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
        navigate(`/workspace/${id}`);
    };

    return (
        <div className="relative p-4 min-h-screen bg-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-center">Workspace Management</h2>

            {/* Session Controls */}
            <div className="mb-8 text-center">
                {isSessionActive ? (
                    <div>
                        <p className="text-xl mb-4">Session Active</p>
                        <p className="text-lg mb-4">Time Spent: {Math.floor(timeSpent / 60)} mins {timeSpent % 60} secs</p>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 transition-colors duration-300"
                            onClick={handleEndSession}
                        >
                            End Session
                        </button>
                    </div>
                ) : (
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 transition-colors duration-300"
                        onClick={handleStartSession}
                    >
                        Start Session
                    </button>
                )}
            </div>

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
                                    onClick={() => handleOpenWorkspace(workspace._id)}
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
                                    onClick={() => handleOpenWorkspace(workspace._id)}
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
                                    onClick={() => handleOpenWorkspace(workspace._id)}
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

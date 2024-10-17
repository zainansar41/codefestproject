import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTaskByUser } from '../Hooks/customHooks';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function YourTask() {
    const [pendingTasks, setPendingTasks] = useState([]);
    const [inProgressTasks, setInProgressTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch tasks when component mounts
        const fetchTasks = async () => {
            const token = await localStorage.getItem('token')
            if (!token) {
                navigate('/login')
                return
            }
            const data = await getTaskByUser();
            if (data) {
                setPendingTasks(data.pendingTasks);
                setInProgressTasks(data.inProgressTasks);
                setCompletedTasks(data.completedTasks);
            } else {
                toast.error('Failed to fetch tasks');
            }
        };
        fetchTasks();
    }, []);

    // Function to handle task navigation
    const handleNavigate = (taskId) => {
        navigate(`/task-details/${taskId}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-center mb-8">Your Tasks</h1>

            <div className="space-y-8">
                {/* Pending Tasks */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-yellow-600">Pending Tasks</h2>
                    <ul className="space-y-4">
                        {pendingTasks.length > 0 ? (
                            pendingTasks.map(task => (
                                <li key={task._id} className="bg-white shadow-lg p-4 rounded-md">
                                    <h3 className="text-lg font-semibold">{task.title}</h3>
                                    {/* Render HTML content in the description */}
                                    <p dangerouslySetInnerHTML={{ __html: task.description }}></p>
                                    <button
                                        onClick={() => handleNavigate(task._id)}
                                        className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
                                    >
                                        View Details
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>No Pending Tasks</p>
                        )}
                    </ul>
                </div>

                {/* In Progress Tasks */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-blue-600">In Progress Tasks</h2>
                    <ul className="space-y-4">
                        {inProgressTasks.length > 0 ? (
                            inProgressTasks.map(task => (
                                <li key={task._id} className="bg-white shadow-lg p-4 rounded-md">
                                    <h3 className="text-lg font-semibold">{task.title}</h3>
                                    {/* Render HTML content in the description */}
                                    <p dangerouslySetInnerHTML={{ __html: task.description }}></p>
                                    <button
                                        onClick={() => handleNavigate(task._id)}
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                                    >
                                        View Details
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>No In Progress Tasks</p>
                        )}
                    </ul>
                </div>

                {/* Completed Tasks */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-green-600">Completed Tasks</h2>
                    <ul className="space-y-4">
                        {completedTasks.length > 0 ? (
                            completedTasks.map(task => (
                                <li key={task._id} className="bg-white shadow-lg p-4 rounded-md">
                                    <h3 className="text-lg font-semibold">{task.title}</h3>
                                    {/* Render HTML content in the description */}
                                    <p dangerouslySetInnerHTML={{ __html: task.description }}></p>
                                    <button
                                        onClick={() => handleNavigate(task._id)}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                                    >
                                        View Details
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>No Completed Tasks</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

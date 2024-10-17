import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskbyId, startTask, endTask } from '../Hooks/customHooks'; // Import your custom hooks

export default function TaskDetail() {
    const { id } = useParams(); // Retrieve the task id from the URL
    const [task, setTask] = useState(null); // State to hold task data
    const [errorMessage, setErrorMessage] = useState('');
    const [isTaskStarted, setIsTaskStarted] = useState(false); // State to track if the task is started
    const [startTime, setStartTime] = useState(null); // State to hold start time
    const [timeSpent, setTimeSpent] = useState(null); // State to hold total time spent on the task
    const [currentTimeSpent, setCurrentTimeSpent] = useState(0); // State to track live time spent
    const intervalRef = useRef(null); // To store interval reference for clearing later
    const userID = localStorage.getItem('userID'); // Get userID from localStorage

    useEffect(() => {
        const fetchTask = async () => {
            const result = await getTaskbyId(id); // Call the custom hook to get task data
            if (result.success) {
                setTask(result.task); // Assuming the task data is inside `result.task`
                setTimeSpent(result.task.timeSpent || 0); // Set initial time spent from the task
            } else {
                setErrorMessage(result.message); // Handle error
            }
        };

        fetchTask();

        // Cleanup interval when component unmounts
        return () => clearInterval(intervalRef.current);
    }, [id]);

    // Function to format time in seconds to hours, minutes, and seconds
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours}h ${minutes}m ${secs}s`;
    };

    // Handle real-time time counting
    const startCountingTime = () => {
        intervalRef.current = setInterval(() => {
            const elapsedTime = Math.floor((new Date() - startTime) / 1000); // Calculate elapsed time in seconds
            setCurrentTimeSpent(elapsedTime);
        }, 1000);
    };

    // Handle task start/stop toggle
    const handleTaskToggle = async () => {
        if (isTaskStarted) {
            // Task is currently in progress, so stop it
            const result = await endTask(id); // Call endTask API
            if (result.success) {
                setIsTaskStarted(false);
                clearInterval(intervalRef.current); // Stop real-time counting
                setTimeSpent(result.task.timeSpent); // Update time spent from the response
            } else {
                setErrorMessage(result.message);
            }
        } else {
            // Task is currently stopped, so start it
            const result = await startTask(id); // Call startTask API
            if (result.success) {
                setIsTaskStarted(true);
                setStartTime(new Date()); // Record the current time as start time
                startCountingTime(); // Start real-time counting
            } else {
                setErrorMessage(result.message);
            }
        }
    };

    // Define assignee based on task.assignedTo
    const assignee = task && task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : null;

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-4xl font-bold mb-6 text-gray-800 border-b pb-4">
                Task Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Task Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Task ID:
                    </h3>
                    <p className="text-xl text-gray-800">{task?.id}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Title:
                    </h3>
                    <p className="text-xl text-gray-800">{task?.title}</p>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Description:
                    </h3>
                    <p
                        className="text-gray-700 text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: task?.description }}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Status:
                    </h3>
                    <p className="text-lg text-blue-600 font-medium">{isTaskStarted ? 'In Progress' : 'Not Started'}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Deadline:
                    </h3>
                    <p className="text-lg text-gray-800">
                        {task?.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Assigned To:
                    </h3>
                    {assignee ? (
                        <p className="text-lg text-gray-800">
                            Name: {assignee.name} <br />
                            Email: {assignee.email}
                        </p>
                    ) : (
                        <p className="text-lg text-gray-800">Unassigned</p>
                    )}
                </div>

                {/* Start/Stop Task Button */}
                {assignee && assignee._id === userID && (
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            onClick={handleTaskToggle}
                            className={`px-4 py-2 rounded-lg text-white ${
                                isTaskStarted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                            } transition duration-300`}
                        >
                            {isTaskStarted ? 'End Task' : 'Start Task'}
                        </button>
                    </div>
                )}

                {/* Display total time spent */}
                {!isTaskStarted ?
                    (timeSpent > 0 && (
                        <div className="md:col-span-2 flex justify-end">
                            <p className="text-lg text-gray-800">
                                Total Time Spent: {formatTime(timeSpent + (isTaskStarted ? currentTimeSpent : 0))}
                            </p>
                        </div>
                    ))
                    :
                    null
                }
            </div>
        </div>
    );
}

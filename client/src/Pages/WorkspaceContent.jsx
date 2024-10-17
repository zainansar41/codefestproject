import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
    getWorkSpaceWithID,
    getTaskByWorkspace,
    invitesendtoteamLead,
    useSendMemberInvitation,
    createTask,
    changeTaskStatus,
    fetchChatsForWorkspace,
    fetchAnalytics
} from '../Hooks/customHooks';
import JoditEditor from 'jodit-react';
import io from 'socket.io-client'; // Import Socket.IO client

// TaskCard Component
const TaskCard = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: task?._id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const navigate = useNavigate();

    const handleViewDetails = () => {
        // Navigate to the task detail page using the task id
        navigate(`/task-details/${task.id}`);
    };

    return (
        <div
            className="bg-white flex flex-col gap-2 p-4 mb-4 shadow-md rounded-lg"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <h4 className="text-lg font-bold">{task.title}</h4>

            {task.assignedTo && task.assignedTo[0] && (
                <h4 className="text-lg font-bold">{task.assignedTo[0]?.name}</h4>
            )}

            <span className="text-sm text-gray-500">
                Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
            <button
                className="mt-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
                onClick={handleViewDetails}
            >
                View Details
            </button>
        </div>
    );
};

// DroppableColumn Component
const DroppableColumn = ({ id, tasks }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{id}</h3>
            <SortableContext
                items={tasks.map((task) => task.id)}
                strategy={rectSortingStrategy}
            >
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </SortableContext>
        </div>
    );
};

const ChatWindow = ({ messages, setMessages, setChatOpen, socket, workspaceId }) => {
    const [newMessage, setNewMessage] = useState('');
    const currentUserId = localStorage.getItem('userID') || ''; // Ensure it's a string

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const messageData = {
            workspaceId,
            message: newMessage,
            senderId: currentUserId,
        };

        // Emit the message to the server via socket
        socket.emit('sendMessage', messageData);

        // Clear the input field after sending
        setNewMessage('');
    };

    return (
        <div className="fixed top-0 right-0 h-full w-full sm:w-1/3 bg-white shadow-lg z-40 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Workspace Chat</h2>
                <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setChatOpen(false)}
                >
                    &#x2715;
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex flex-col ${msg.sender?._id === currentUserId ? 'items-end' : 'items-start'}`}
                    >
                        <div className="text-sm text-gray-500">
                            <strong>{msg.sender?.name}</strong> •{' '}
                            {new Date(msg.createdAt).toLocaleString()}
                        </div>
                        <div
                            className={`p-2 rounded-lg ${msg.sender?._id === currentUserId
                                ? 'bg-green-200 text-black' // Your message style
                                : 'bg-gray-200 text-black' // Other messages style
                                }`}
                        >
                            {msg.message}
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t p-4 bg-white sticky bottom-0 left-0 w-full">
                <div className="flex">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full border rounded-l-lg p-2"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition duration-300"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};



export default function WorkspaceContent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [columns, setColumns] = useState({
        Pending: [],
        'In Progress': [],
        Completed: [],
    });

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [isAnalyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('teamMember');
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [deadline, setDeadline] = useState('');

    const { sendMemberInvitation } = useSendMemberInvitation();
    const userId = localStorage.getItem('userID');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // State for chat window visibility and messages
    const [isChatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);

    // Socket reference
    const socket = useRef(null);

    // useEffect to connect to socket
    useEffect(() => {
        // Connect to the socket.io server
        socket.current = io('http://localhost:5000', {
            transports: ['websocket'],
        });

        // Join the workspace room
        socket.current.emit('joinWorkspace', id);

        // Listen for 'receiveMessage' events
        socket.current.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Clean up when the component unmounts
        return () => {
            socket.current.disconnect();
        };
    }, [id]);

    // Fetch initial chats for the workspace
    useEffect(() => {
        const fetchChats = async () => {
            const fetchedChats = await fetchChatsForWorkspace(id);
            setMessages(fetchedChats);
        };

        fetchChats();
    }, [id]);

    useEffect(() => {
        const fetchWorkspace = async () => {
            const result = await getWorkSpaceWithID(id);

            if (!result.success) {
                if (result.message === 'No token found') {
                    navigate('/login');
                } else {
                    setErrorMessage(result.message);
                }
            } else {
                setWorkspace(result.workspace);
            }
        };

        fetchWorkspace();
    }, [id, navigate]);

    // Fetch tasks associated with the workspace
    useEffect(() => {
        const fetchTasks = async () => {
            const result = await getTaskByWorkspace(id);

            if (!result.success) {
                setErrorMessage(result.message);
            } else {
                // Ensure each task has an 'id' property
                const tasks = result.tasks.map((task) => ({
                    ...task,
                    id: task?._id, // Map the MongoDB _id field to the id property
                }));

                // Group tasks by their status and set them in the state accordingly
                const tasksByStatus = {
                    Pending: [],
                    'In Progress': [],
                    Completed: [],
                };

                tasks.forEach((task) => {
                    // Check the task's status and push it into the corresponding array
                    tasksByStatus[task.status].push(task);
                });

                setColumns(tasksByStatus); // Update the state with the grouped tasks
            }
        };

        if (workspace) {
            fetchTasks();
        }
    }, [id, workspace]);

    // Handle fetching analytics
    const handleFetchAnalytics = async () => {
        const data = await fetchAnalytics(id);
        setAnalyticsData(data); // Store analytics data in the state
        setAnalyticsModalOpen(true); // Open the modal
    };

    // Helper function to find the container of a task
    const findContainer = (taskId) => {
        for (const [containerId, tasks] of Object.entries(columns)) {
            if (tasks.find((task) => task.id === taskId)) {
                return containerId;
            }
        }
        return null;
    };

    const containerIds = ['Pending', 'In Progress', 'Completed'];

    // Handle task drag end
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);

        let overContainer;
        if (containerIds.includes(overId)) {
            overContainer = overId;
        } else {
            overContainer = findContainer(overId);
        }

        if (!activeContainer || !overContainer) {
            return;
        }

        if (activeContainer === overContainer) {
            // Reorder within the same container
            const containerTasks = columns[activeContainer];
            const activeIndex = containerTasks.findIndex((task) => task.id === activeId);
            const overIndex = containerTasks.findIndex((task) => task.id === overId);

            if (activeIndex !== overIndex) {
                const newTasks = arrayMove(containerTasks, activeIndex, overIndex);
                setColumns((prev) => ({
                    ...prev,
                    [activeContainer]: newTasks,
                }));
            }
        } else {
            // Move to different container

            // Update the status in the database first
            (async () => {
                try {
                    const response = await changeTaskStatus(activeId, overContainer);
                    if (response.success) {
                        // Update the UI
                        const sourceTasks = [...columns[activeContainer]];
                        const destTasks = [...columns[overContainer]];

                        const activeIndex = sourceTasks.findIndex((task) => task.id === activeId);

                        const [movedTask] = sourceTasks.splice(activeIndex, 1);
                        // Create a new task object with updated status
                        const updatedTask = { ...movedTask, status: overContainer };

                        destTasks.splice(destTasks.length, 0, updatedTask); // Add to the end

                        setColumns((prev) => ({
                            ...prev,
                            [activeContainer]: sourceTasks,
                            [overContainer]: destTasks,
                        }));
                    } else {
                        // Handle error
                        console.error('Failed to update task status in database');
                        alert('Failed to update task status in database');
                    }
                } catch (error) {
                    console.error('Error updating task status:', error);
                    alert('Error updating task status');
                }
            })();
        }
    };

    const handleInviteSubmit = async () => {
        try {
            if (inviteRole === 'teamLead') {
                const response = await invitesendtoteamLead(id, inviteEmail);
                if (!response.success) setErrorMessage(response.message);
            } else if (inviteRole === 'teamMember') {
                const response = await sendMemberInvitation(id, inviteEmail);
                if (!response.success) setErrorMessage(response.message);
            }

            setInviteEmail('');
            setInviteRole('teamMember');
            setInviteModalOpen(false);
        } catch (error) {
            setErrorMessage('Failed to invite user.');
        }
    };

    // Handle Create Task Submission
    const handleCreateTaskSubmit = async () => {
        try {
            const newTaskData = {
                title: taskName,
                description: taskDescription,
                deadline,
                assignedTo,
                workspaceId: id,
            };

            const response = await createTask(newTaskData);

            if (response && response.task) {
                const newTask = response.task;
                // Ensure newTask has an 'id' property
                newTask.id = newTask?._id || newTask.id;
                newTask.status = 'Pending'; // Set status to Pending

                setColumns((prev) => ({
                    ...prev,
                    Pending: [...prev.Pending, newTask],
                }));

                setTaskName('');
                setTaskDescription('');
                setAssignedTo('');
                setDeadline('');
                setCreateTaskModalOpen(false);
            } else {
                setErrorMessage(response.message || 'Failed to create task.');
            }
        } catch (error) {
            setErrorMessage('Failed to create task.');
        }
    };

    if (errorMessage) {
        return <p className="text-red-500">{errorMessage}</p>;
    }

    if (!workspace) {
        return <p>Loading workspace details...</p>;
    }

    const isUserAdminOrTeamLead =
        userId === workspace.admin?._id || userId === workspace.teamLead?._id;

    const membersList = [
        { name: workspace.admin?.name, id: workspace.admin?._id, role: 'Admin' },
        { name: workspace.teamLead?.name, id: workspace.teamLead?._id, role: 'Team Lead' },
        ...workspace.members.map((member) => ({
            name: member?.name,
            id: member?._id,
            role: 'Team Member',
        })),
    ];

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-2">Workspace: {workspace?.name}</h2>

            {/* Dropdown of members */}
            <select className="mb-6 border border-gray-300 p-2 rounded-lg">
                {membersList.map((member) => (
                    <option key={member.id} value={member.id}>
                        {member?.name} ({member.role})
                    </option>
                ))}
            </select>

            {/* Render DndContext */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.keys(columns).map((columnId) => (
                        <DroppableColumn key={columnId} id={columnId} tasks={columns[columnId]} />
                    ))}
                </div>
            </DndContext>

            {isUserAdminOrTeamLead && (
                <div className="flex gap-4 mt-6">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                        onClick={() => setCreateTaskModalOpen(true)}
                    >
                        + Create Task
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        onClick={() => setInviteModalOpen(true)}
                    >
                        + Invite User
                    </button>
                    <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
                        onClick={handleFetchAnalytics}
                    >
                        See Analytics
                    </button>
                </div>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Invite User</h3>
                        <input
                            type="email"
                            placeholder="Enter user email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
                        >
                            <option value="teamMember">Team Member</option>
                            <option value="teamLead">Team Lead</option>
                        </select>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 mr-2 rounded-lg"
                                onClick={() => setInviteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                onClick={handleInviteSubmit}
                            >
                                Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {isCreateTaskModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create Task</h3>
                        <input
                            type="text"
                            placeholder="Task Name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
                        />
                        <JoditEditor
                            value={taskDescription}
                            onBlur={(newContent) => setTaskDescription(newContent)}
                            config={{
                                readonly: false,
                                height: 350,
                                width: '100%',
                                toolbarSticky: false,
                                minHeight: 150,
                            }}
                        />
                        <div className="flex gap-4">
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
                            >
                                <option value="">Assign To</option>
                                {membersList.map((member, index) => (
                                    <option key={index} value={member.id}>
                                        {member?.name} ({member.role})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 mr-2 rounded-lg"
                                onClick={() => setCreateTaskModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                                onClick={handleCreateTaskSubmit}
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAnalyticsModalOpen && analyticsData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                        <h3 className="text-lg font-bold mb-4">Workspace Analytics</h3>

                        <div className="mb-4">
                            <strong>Total Tasks Completed:</strong> {analyticsData.totalTasksCompleted}
                        </div>
                        <div className="mb-4">
                            <strong>Total Time Spent by Team:</strong> {analyticsData.totalTimeSpentByTeam} seconds
                        </div>

                        <h4 className="text-lg font-semibold mb-2">Member Stats:</h4>
                        {Object.keys(analyticsData.memberStats).map(memberId => (
                            <MemberDropdown
                                key={memberId}
                                member={analyticsData.memberStats[memberId]}
                            />
                        ))}

                        <div className="flex justify-end">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 mr-2 rounded-lg"
                                onClick={() => setAnalyticsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Chat toggle button */}
            {!isChatOpen && (
                <button
                    className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 z-50"
                    onClick={() => setChatOpen(!isChatOpen)}
                >
                    {isChatOpen ? 'Close Chat' : 'Open Chat'}
                </button>
            )}

            {/* Chat window */}
            {isChatOpen && (
                <ChatWindow
                    messages={messages}
                    setMessages={setMessages}
                    setChatOpen={setChatOpen}
                    socket={socket.current}
                    workspaceId={id}
                />
            )}
        </div>
    );
}



const MemberDropdown = ({ member }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="mb-4 border-b pb-4">
            <button
                onClick={toggleDropdown}
                className="text-left w-full bg-gray-200 px-4 py-2 rounded-lg focus:outline-none">
                <div className="flex justify-between">
                    <div>
                        <strong>Name:</strong> {member.name} <br />
                        <strong>Email:</strong> {member.email} <br />
                        <strong>Tasks Completed:</strong> {member.tasksCompleted} <br />
                        <strong>Total Time Spent:</strong> {member.totalTimeSpent} seconds
                    </div>
                    <span>{isOpen ? '▼' : '►'}</span>
                </div>
            </button>

            {isOpen && (
                <div className="mt-2">
                    <h5 className="font-semibold">Time Spent Per Day:</h5>
                    {member.timeSpentHistory.length > 0 ? (
                        <ul className="ml-4">
                            {member.timeSpentHistory.map((session, index) => (
                                <li key={index} className="text-sm">
                                    <strong>Date:</strong> {new Date(session.date).toLocaleDateString()} <br />
                                    <strong>Start Time:</strong> {new Date(session.startTime).toLocaleTimeString()} <br />
                                    <strong>End Time:</strong> {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'Ongoing'} <br />
                                    <strong>Time Spent:</strong> {session.timeSpent} seconds
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No time history available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

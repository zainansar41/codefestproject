import React, { useState, useEffect } from 'react';
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
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    getWorkSpaceWithID,
    getTaskByWorkspace,
    invitesendtoteamLead,
    useSendMemberInvitation,
    createTask,
    changeTaskStatus,
} from '../Hooks/customHooks';
import JoditEditor from 'jodit-react';

// TaskCard Component
const TaskCard = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
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
            <span className="text-sm text-gray-500">
                Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
            <button
                className="mt-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
                onClick={() =>
                    alert(
                        `Task details: \nName: ${task.title}\nStatus: ${task.status}\nDeadline: ${new Date(
                            task.deadline
                        ).toLocaleDateString()}`
                    )
                }
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

// Main Component
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

    // Fetch workspace details
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
                    id: task._id, // Map the MongoDB _id field to the id property
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
                newTask.id = newTask._id || newTask.id;
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
        userId === workspace.admin._id || userId === workspace.teamLead._id;

    const membersList = [
        { name: workspace.admin.name, id: workspace.admin._id, role: 'Admin' },
        { name: workspace.teamLead.name, id: workspace.teamLead._id, role: 'Team Lead' },
        ...workspace.members.map((member) => ({
            name: member.name,
            id: member._id,
            role: 'Team Member',
        })),
    ];

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-2">Workspace: {workspace.name}</h2>

            {/* Dropdown of members */}
            <select className="mb-6 border border-gray-300 p-2 rounded-lg">
                {membersList.map((member) => (
                    <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                    </option>
                ))}
            </select>

            {/* Render DndContext */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-3 gap-6">
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
                                        {member.name} ({member.role})
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
        </div>
    );
}

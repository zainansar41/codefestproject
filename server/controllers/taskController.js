import Task from "../models/Task.js";
import User from "../models/Users.js";
import Workspace from "../models/Workspace.js";
import { transporter, mailOptions } from './mail.js'; // Use the mail.js file


export const createTask = async (req, res) => {
    const { title, description, status, deadline, assignedTo, workspaceId } = req.body;

    try {
        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Create the task
        const newTask = new Task({
            title,
            description,
            status,
            deadline,
            assignedTo,
            workspace: workspace._id,
        });

        // Save the task
        await newTask.save();

        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const editTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, deadline, assignedTo } = req.body;

    try {
        // Find and update the task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { title, description, status, deadline, assignedTo },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        // Find and delete the task
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Get tasks by workspace
export const getTasksByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Find tasks related to the workspace
        const tasks = await Task.find({ workspace: workspaceId });

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this workspace' });
        }

        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Get tasks by workspace and status
export const getTasksByWorkspaceAndStatus = async (req, res) => {
    const { workspaceId, status } = req.params;

    try {
        // Find tasks related to the workspace with specific status
        const tasks = await Task.find({ workspace: workspaceId, status });

        if (tasks.length === 0) {
            return res.status(404).json({ message: `No tasks found with status ${status}` });
        }

        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Remove a user from a task
export const removeUserFromTask = async (req, res) => {
    const { taskId, userId } = req.params;

    try {
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Remove the user from assignedTo array
        task.assignedTo = task.assignedTo.filter(user => user.toString() !== userId);
        await task.save();

        res.status(200).json({ message: 'User removed from task successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const assignTaskToUsers = async (req, res) => {
    const { taskId } = req.params;
    const { userIds } = req.body;

    try {
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Add the users to the assignedTo array
        task.assignedTo = [...task.assignedTo, ...userIds];
        await task.save();

        // Fetch user details to send email
        const users = await User.find({ _id: { $in: userIds } });

        users.forEach(user => {
            // Email options
            const emailOptions = {
                from: mailOptions.senderEmail,
                to: user.email,
                subject: `New Task Assigned: ${task.title}`,
                text: `Hi ${user.name},\n\nYou have been assigned a new task: "${task.title}".\nDescription: ${task.description}\nDeadline: ${task.deadline ? task.deadline : 'No deadline specified'}\n\nPlease log in to view more details.\n\nBest regards,\nTeam`,
            };

            // Send email
            transporter.sendMail(emailOptions, (error, info) => {
                if (error) {
                    console.log(`Error sending email to ${user.email}: ${error}`);
                } else {
                    console.log(`Email sent to ${user.email}: ` + info.response);
                }
            });
        });

        res.status(200).json({ message: 'Task assigned to users and email notifications sent successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const startTask = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id; // Assuming user ID is stored in req.user

    try {
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is assigned to the task
        if (!task.assignedTo.includes(userId)) {
            return res.status(403).json({ message: 'You are not assigned to this task' });
        }

        // Set the start time to the current time
        task.startTime = Date.now();
        await task.save();

        res.status(200).json({ message: 'Task started successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const stopTask = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id; // Assuming user ID is stored in req.user

    try {
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is assigned to the task
        if (!task.assignedTo.includes(userId)) {
            return res.status(403).json({ message: 'You are not assigned to this task' });
        }

        // Set the end time to current time
        const endTime = Date.now();

        // Calculate time spent in milliseconds
        const timeSpent = Math.floor((endTime - new Date(task.startTime)) / 1000); // in seconds

        // Update task with endTime and timeSpent
        task.endTime = endTime;
        task.timeSpent = task.timeSpent ? task.timeSpent + timeSpent : timeSpent;
        await task.save();

        res.status(200).json({ message: 'Task stopped successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const changeTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { newStatus } = req.body; // Expecting the new status in the request body
    const userId = req.user.id; // Assuming user ID is stored in req.user

    try {
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is assigned to the task or has permission to change the status
        if (!task.assignedTo.includes(userId)) {
            return res.status(403).json({ message: 'You are not assigned to this task and cannot change its status' });
        }

        // Validate new status
        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        // Update the task status
        task.status = newStatus;
        await task.save();

        res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
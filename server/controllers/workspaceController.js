import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import { transporter, mailOptions } from './mail.js'; // Using the mail.js file

export const createWorkspace = async (req, res) => {
    const { newWorkspaceName, newWorkspaceDescription } = req.body;
    console.log(req.body);


    try {
        // Check if admin exists
        const admin = await User.findById(req.user.id);
        if (!admin) {
            console.log("no User");

            return res.status(404).json({ message: 'Admin not found' });
        }

        // Create workspace
        const newWorkspace = new Workspace({
            name: newWorkspaceName,
            description: newWorkspaceDescription,
            admin: admin._id,
        });

        await newWorkspace.save();

        res.status(201).json({ message: 'Workspace created successfully', workspace: newWorkspace });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const sendTeamLeadInvitation = async (req, res) => {
    const { workspaceId, email } = req.body;

    try {
        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Generate invitation token (JWT)
        const token = jwt.sign({ workspaceId }, 'secretkey', { expiresIn: '1h' });
        const invitationLink = `http://localhost:3000/invite-team-lead?token=${token}`;

        // Send email with the invitation link
        const emailOptions = {
            from: mailOptions.from,
            to: email,
            subject: `Invitation to become Team Lead`,
            text: `Hi, You have been invited to become the Team Lead for the workspace: ${workspace.name}. Click here to accept the invitation: ${invitationLink}`,
        };

        transporter.sendMail(emailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending invitation email' });
            }
            console.log('Invitation email sent: ' + info.response);
        });

        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const acceptTeamLeadInvitation = async (req, res) => {
    const { token, teamLeadId } = req.body;

    console.log(req.body);


    try {
        // Verify the token
        const decoded = jwt.verify(token, 'secretkey');
        const { workspaceId } = decoded;

        console.log(workspaceId);


        // Find workspace and team lead
        const workspace = await Workspace.findById(workspaceId);
        console.log(workspace);

        const teamLead = await User.findById(teamLeadId);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }
        if (!teamLead) {
            return res.status(404).json({ message: 'Team Lead not found' });
        }

        // Add the team lead to the workspace
        workspace.teamLead = teamLead._id;
        await workspace.save();

        console.log(workspace);


        res.status(200).json({ message: 'Team Lead added successfully', success: true, workspaceid: workspace._id });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Invalid or expired token' });
    }
};

export const sendMemberInvitation = async (req, res) => {
    const { workspaceId, email } = req.body;

    try {
        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const token = jwt.sign({ workspaceId }, 'secretkey', { expiresIn: '1h' });
        const invitationLink = `http://localhost:3000/invite-member?token=${token}`;

        // Send email with the invitation link
        const emailOptions = {
            from: mailOptions.from,
            to: email,
            subject: `Invitation to become Team Lead`,
            text: `Hi, You have been invited to become the Team Lead for the workspace: ${workspace.name}. Click here to accept the invitation: ${invitationLink}`,
        };

        transporter.sendMail(emailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending invitation email' });
            }
            console.log('Invitation email sent: ' + info.response);
        });

        res.status(200).json({ message: 'Invitations sent successfully' });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const acceptMemberInvitation = async (req, res) => {
    const { token, memberId } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'secretkey');
        const { workspaceId } = decoded;

        // Find workspace and member
        const workspace = await Workspace.findById(workspaceId);
        const member = await User.findById(memberId);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Add the member to the workspace
        workspace.members.push(member._id);
        await workspace.save();

        res.status(200).json({ message: 'Member added to workspace successfully', success: true, workspaceId: workspace._id });
    } catch (error) {
        res.status(500).json({ message: 'Invalid or expired token' });
    }
};

export const getWorkspaceInfoWithMembersAndTeamLead = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Find workspace and populate members and team lead
        const workspace = await Workspace.findById(workspaceId)
            .populate('members', 'name email')
            .populate('teamLead', 'name email')
            .populate('admin', 'name email'); // Include admin information as well

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Return full workspace details along with members and team lead
        res.status(200).json({
            workspace: {
                name: workspace.name,
                description: workspace.description,
                admin: workspace.admin,
                teamLead: workspace.teamLead,
                members: workspace.members,
                createdAt: workspace.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};


export const removeTeamLead = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Find workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Remove team lead
        workspace.teamLead = null;
        await workspace.save();

        res.status(200).json({ message: 'Team Lead removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const removeTeamMember = async (req, res) => {
    const { workspaceId, memberId } = req.params;

    try {
        // Find workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Remove member from workspace
        workspace.members = workspace.members.filter(member => member.toString() !== memberId);
        await workspace.save();

        res.status(200).json({ message: 'Team Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const deleteWorkspace = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Find and delete workspace
        const workspace = await Workspace.findByIdAndDelete(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        res.status(200).json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getWorkspacesByUserRole = async (req, res) => {
    const userId = req.user.id; // Assuming you're using JWT and have user ID in req.user

    try {
        // Find workspaces where the user is the admin
        const createdWorkspaces = await Workspace.find({ admin: userId });

        // Find workspaces where the user is the team lead
        const teamLeadWorkspaces = await Workspace.find({ teamLead: userId });

        // Find workspaces where the user is a team member
        const teamMemberWorkspaces = await Workspace.find({ members: userId });

        // Respond with the three lists
        res.status(200).json({
            createdWorkspaces,
            teamLeadWorkspaces,
            teamMemberWorkspaces
        });
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ message: 'Error fetching workspaces' });
    }
};

export const getWorkspaceById = async (req, res) => {
    const { workspaceId } = req.params;
    console.log(workspaceId);


    try {
        // Find workspace by ID and populate relevant fields
        const workspace = await Workspace.findById(workspaceId)
            .populate('admin', 'name email')   // Populate admin details (optional)
            .populate('teamLead', 'name email') // Populate team lead details (optional)
            .populate('members', 'name email'); // Populate team member details (optional)

        // If workspace not found
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Respond with the workspace details
        console.log(workspace);

        res.status(200).json({ workspace, success: true });
    } catch (error) {
        console.error("Error fetching workspace:", error);
        res.status(500).json({ message: 'Error fetching workspace' });
    }
};

export const getWorkspaceAnalytics = async (req, res) => {
    const { workspaceId } = req.params; // Assuming workspaceId is passed as a URL parameter

    try {
        // Fetch the workspace and populate teamLead, members, and tasks
        const workspace = await Workspace.findById(workspaceId)
            .populate('teamLead', 'name email timeSpentPerDay')
            .populate('members', 'name email timeSpentPerDay')
            .populate('tasks');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Get all tasks for the workspace
        const tasks = await Task.find({ workspace: workspaceId });

        // Initialize an object to store task counts and time spent by each member
        const memberStats = {};

        // Initialize total team stats
        let totalTasksCompleted = 0;
        let totalTimeSpentByTeam = 0;

        // Helper function to calculate total time spent from timeSpentPerDay array
        const calculateTotalTimeSpent = (timeSpentPerDay) => {
            return timeSpentPerDay.reduce((total, session) => total + (session.timeSpent || 0), 0);
        };

        // Populate initial stats for team lead and members
        if (workspace.teamLead) {
            memberStats[workspace.teamLead._id] = {
                name: workspace.teamLead.name,
                email: workspace.teamLead.email,
                tasksCompleted: 0,
                totalTimeSpent: calculateTotalTimeSpent(workspace.teamLead.timeSpentPerDay),
                timeSpentHistory: workspace.teamLead.timeSpentPerDay // Include history
            };
        }

        workspace.members.forEach((member) => {
            memberStats[member._id] = {
                name: member.name,
                email: member.email,
                tasksCompleted: 0,
                totalTimeSpent: calculateTotalTimeSpent(member.timeSpentPerDay),
                timeSpentHistory: member.timeSpentPerDay // Include history
            };
        });

        // Calculate tasks completed and time spent by each member
        tasks.forEach((task) => {
            task.assignedTo.forEach((userId) => {
                if (memberStats[userId]) {
                    if (task.status === 'Completed') {
                        memberStats[userId].tasksCompleted += 1;
                        totalTasksCompleted += 1;
                    }
                    memberStats[userId].totalTimeSpent += task.timeSpent || 0;
                    totalTimeSpentByTeam += task.timeSpent || 0;
                }
            });
        });

        // Respond with detailed workspace analytics
        res.status(200).json({
            workspace: {
                name: workspace.name,
                description: workspace.description,
                admin: workspace.admin,
                teamLead: workspace.teamLead,
                members: workspace.members.length,
                tasks: workspace.tasks.length
            },
            memberStats,
            totalTasksCompleted,
            totalTimeSpentByTeam
        });
    } catch (error) {
        console.error('Error fetching workspace analytics:', error);
        res.status(500).json({ message: 'Error fetching workspace analytics' });
    }
};

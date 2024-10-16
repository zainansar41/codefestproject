import Workspace from "../models/Workspace.js";
import User from "../models/Users.js";
import jwt from 'jsonwebtoken';
import { transporter, mailOptions } from './mail.js'; // Using the mail.js file

export const createWorkspace = async (req, res) => {
    const { name, description, adminId } = req.body;

    try {
        // Check if admin exists
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Create workspace
        const newWorkspace = new Workspace({
            name,
            description,
            admin: admin._id,
        });

        await newWorkspace.save();

        res.status(201).json({ message: 'Workspace created successfully', workspace: newWorkspace });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const sendTeamLeadInvitation = async (req, res) => {
    const { workspaceId, teamLeadEmail } = req.body;

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
            from: mailOptions.senderEmail,
            to: teamLeadEmail,
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

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'secretkey');
        const { workspaceId } = decoded;

        // Find workspace and team lead
        const workspace = await Workspace.findById(workspaceId);
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

        res.status(200).json({ message: 'Team Lead added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Invalid or expired token' });
    }
};

export const sendMemberInvitation = async (req, res) => {
    const { workspaceId, memberEmails } = req.body;

    try {
        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Send invitation to each member
        memberEmails.forEach((email) => {
            // Generate invitation token (JWT)
            const token = jwt.sign({ workspaceId }, 'secretkey', { expiresIn: '1h' });
            const invitationLink = `http://yourapp.com/invite-member?token=${token}`;

            // Email options
            const emailOptions = {
                from: mailOptions.senderEmail,
                to: email,
                subject: `Invitation to join workspace: ${workspace.name}`,
                text: `Hi, You have been invited to join the workspace: ${workspace.name}. Click here to accept the invitation: ${invitationLink}`,
            };

            // Send the email
            transporter.sendMail(emailOptions, (error, info) => {
                if (error) {
                    console.log(`Error sending email to ${email}: ${error}`);
                } else {
                    console.log(`Invitation email sent to ${email}: ` + info.response);
                }
            });
        });

        res.status(200).json({ message: 'Invitations sent successfully' });
    } catch (error) {
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

        res.status(200).json({ message: 'Member added to workspace successfully' });
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
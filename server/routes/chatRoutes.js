import express from 'express';
import Chat from '../models/Chat.js';
import Workspace from '../models/Workspace.js';

const router = express.Router();

// Get all chat messages for a workspace
router.get('/workspace/:workspaceId/chats', async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Fetch all chats for the workspace
        const chats = await Chat.find({ workspace: workspaceId })
            .populate('sender', 'name email') // Populate sender details
            .sort({ createdAt: 1 }); // Sort by creation time (ascending)

        res.status(200).json({ chats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat messages' });
    }
});

// Post a new chat message
router.post('/workspace/:workspaceId/chats', async (req, res) => {
    const { workspaceId } = req.params;
    const { senderId, message } = req.body;

    try {
        // Validate workspace existence
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Create a new chat message
        const newChat = new Chat({
            workspace: workspaceId,
            sender: senderId,
            message,
        });

        await newChat.save();

        res.status(201).json({ message: 'Chat message sent', chat: newChat });
    } catch (error) {
        res.status(500).json({ message: 'Error sending chat message' });
    }
});

export default router;
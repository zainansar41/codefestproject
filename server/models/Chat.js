import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array of user IDs who have read the message
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './connection/connection.js';
import cors from 'cors';
import router from './routes/index.js';
import http from 'http'; // For creating the server
import { Server } from 'socket.io'; // Importing Socket.IO
import Chat from './models/Chat.js';

dotenv.config();

// Initialize Express app

const app = express();
app.use(cors()); // Enable CORS


// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for simplicity; restrict this in production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json()); 

// Routes
app.use('/', router);

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDb();

// Test route to ensure server is running
app.get('/', (req, res) => {
  res.send('Server is working');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a workspace room
  socket.on('joinWorkspace', (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User joined workspace: ${workspaceId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { workspaceId, message, senderId } = data;

    // Save the chat to the database
    const newChat = new Chat({
      workspace: workspaceId,
      sender: senderId,
      message,
      readBy: [senderId],
    });

    try {
      const savedChat = await newChat.save();

      // Populate the sender field with 'name' and 'email'
      const populatedChat = await Chat.findById(savedChat._id).populate('sender', 'name email');

      console.log(populatedChat);
      

      // Broadcast the message to everyone in the workspace
      io.to(workspaceId).emit('receiveMessage', populatedChat);
    } catch (err) {
      console.error('Error saving chat:', err);
    }
  });

  // Mark a message as read
  socket.on('markMessageAsRead', async (data) => {
    const { chatId, userId } = data;

    try {
      // Find the chat message and update the `readBy` field
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      // If the user has not already read the message, add them to the `readBy` array
      if (!chat.readBy.includes(userId)) {
        chat.readBy.push(userId);
        await chat.save();

        // Notify all users in the workspace about the read status update
        io.to(chat.workspace.toString()).emit('messageRead', { chatId, userId });
      }
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


// Start the server with Socket.IO
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

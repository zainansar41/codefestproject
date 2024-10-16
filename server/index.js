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
app.use(cors()); // Enable CORS

// Routes
app.use('/', router);

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDb();

// Test route to ensure server is running
app.get('/', (req, res) => {
  res.send('Server is working');
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a workspace room
  socket.on('joinWorkspace', (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User joined workspace: ${workspaceId}`);
  });

  // Send and receive messages
  socket.on('sendMessage', (data) => {
    const { workspaceId, message, senderId } = data;

    // Save the chat to the database (you'd need to define the Chat model and logic)
    const newChat = new Chat({
      workspace: workspaceId,
      sender: senderId,
      message,
    });

    newChat.save((err, chat) => {
      if (err) {
        console.error('Error saving chat:', err);
      } else {
        // Broadcast the message to everyone in the workspace
        io.to(workspaceId).emit('receiveMessage', chat);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server with Socket.IO
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

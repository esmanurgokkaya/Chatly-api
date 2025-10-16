import { Server } from "socket.io";
import http from "http";
import express from "express";
import ENV from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax"
  }
});

// apply socket.io middleware
io.use(socketAuthMiddleware);

const userSocketMap = new Map();

io.on("connection", (socket) => {
    console.log('New socket connection established');
    console.log('Socket ID:', socket.id);
    console.log('Connected User ID:', socket.userId);
    
    if (!socket.userId) {
        console.log('Error: No user ID assigned to socket');
        socket.disconnect();
        return;
    }
    
    // Store user connection
    userSocketMap.set(socket.userId, socket.id);
    
    // Log connected users
    const onlineUsers = Array.from(userSocketMap.keys());
    console.log('Online Users:', onlineUsers);
    
    // Emit online users to all clients
    io.emit("onlineUsers", onlineUsers);
    
    // Emit connection success to the client
    socket.emit("connected", {
        status: "success",
        userId: socket.userId
    });

    // Handle new message
    socket.on("sendMessage", (message) => {
        const recipientSocketId = userSocketMap.get(message.receiverId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", {
                ...message,
                senderId: socket.userId
            });
        }
    });

    // Handle typing status
    socket.on("typing", ({ recipientId }) => {
        const recipientSocketId = userSocketMap.get(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("userTyping", {
                senderId: socket.userId,
                isTyping: true
            });
        }
    });

    socket.on("stopTyping", ({ recipientId }) => {
        const recipientSocketId = userSocketMap.get(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("userTyping", {
                senderId: socket.userId,
                isTyping: false
            });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
        userSocketMap.delete(socket.userId);
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });
});

export { app, io, server };
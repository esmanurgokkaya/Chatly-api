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

io.use(socketAuthMiddleware);

export function getReciverSocketId(userId) {
    return userSocketMap.get(userId);
}

const userSocketMap = new Map();

io.on("connection", (socket) => {
    if (!socket.userId) {
        socket.disconnect();
        return;
    }
    
    userSocketMap.set(socket.userId, socket.id);
    const onlineUsers = Array.from(userSocketMap.keys());
    io.emit("onlineUsers", onlineUsers);
    
    socket.emit("connected", {
        status: "success",
        userId: socket.userId
    });


    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
        userSocketMap.delete(socket.userId);
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });
});

export { app, io, server };
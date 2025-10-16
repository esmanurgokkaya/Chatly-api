import jwt from "jsonwebtoken";
import ENV from "../lib/env.js";
import User from "../models/user.model.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        console.log('Socket auth middleware started');
        
        let token;
        
        // Check auth header first
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
            console.log('Token found in Authorization header');
        }
        
        // If no auth header, try cookies
        if (!token && socket.handshake.headers.cookie) {
            const cookies = socket.handshake.headers.cookie.split('; ');
            const jwtCookie = cookies.find(c => c.startsWith('jwt='));
            if (jwtCookie) {
                token = jwtCookie.split('=')[1];
                console.log('Token found in cookies');
            }
        }
        
        // Finally check auth object
        if (!token && socket.handshake.auth && socket.handshake.auth.token) {
            token = socket.handshake.auth.token;
            console.log('Token found in auth object');
        }

        if (!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error("Not authorized, no token"));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        console.log('Token decoded:', decoded);

        if (!decoded) {
            console.log("Invalid token");
            return next(new Error("Not authorized, token failed"));
        }

        // Check for userId in decoded token
        const userId = decoded.id || decoded.userId;
        if (!userId) {
            console.log("No user ID in token");
            return next(new Error("Invalid token format"));
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            console.log("User not found");
            return next(new Error("User not found"));
        }

        console.log('User authenticated:', user._id.toString());
        
        // Attach user info to socket
        socket.user = user;
        socket.userId = user._id.toString();
        
        next();
    } catch (error) {
        console.error("Error in socketAuthMiddleware:", error);
        next(new Error("Server error"));
    }   
}
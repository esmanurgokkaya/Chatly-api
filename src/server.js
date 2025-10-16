import express from "express";
import ENV  from "./lib/env.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(ENV.PORT, () => {
  console.log(`server is running on port ${ENV.PORT}`);
  connectDB();
});

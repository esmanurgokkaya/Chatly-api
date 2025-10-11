import express from "express";
import ENV  from "./lib/env.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";


const app = express();


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(ENV.PORT, () => {
  console.log(`server is running on port ${ENV.PORT}`);
  connectDB();
});

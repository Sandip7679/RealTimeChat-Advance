import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js"
// import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
// const __dirname = path.resolve();

app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    // origin: ["https://realtimechatty.netlify.app"],
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
// app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     // res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//     console.log('get request....')
//   });
// }
// app.get("*", (req, res) => {
//   // res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   console.log('get request....')
//   res.send('get request')
// });
app.get("/", (req, res) => {
  res.send("API Working")
});

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});

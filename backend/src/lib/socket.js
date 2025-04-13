import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: ["https://realtimechatty.netlify.app"],
    origin: process.env.FRONTEND_URL,
    // origin: "*",
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  console.log('userSocketMap....',userSocketMap);
  socket.join(userId);

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // // Handle call user
  // socket.on("callUser", ({ userToCall, signalData, from, name }) => {
  //   io.to(userToCall).emit("callIncoming", { signal: signalData, from, name });
  // });

  // // Handle answer call
  // socket.on("answerCall", (data) => {
  //   io.to(data.to).emit("callAccepted", data.signal);
  // });

  // socket.on("callUser", ({from, to, offer }) => {
  //   // let fromSocketId = getReceiverSocketId();
  //   console.log('callUer....',from);
  //   console.log('userSocketMap[to]....',userSocketMap[to]);
  //   io.to(userSocketMap[to]).emit("callIncoming", { from: userSocketMap[from._id], offer });
  // });

  // socket.on("answerCall", ({ to, answer }) => {
  //   io.to(userSocketMap[to]).emit("callAnswered", { answer });
  // });

  socket.on("iceCandidate", ({ to, candidate }) => {
    console.log('iceCandidate...to...candidate...',to, candidate);
    io.to(to).emit("iceCandidate", { candidate });
  });

  socket.on("offer", ({ from, offer, to, data }) => {
    console.log('offer...from...to..',offer,from,to);
    io.to(to).emit("offer", { offer, from: from, data});
  });

  socket.on("answer", ({ answer, to }) => {
    console.log('answer....to..',answer,to);
    io.to(to).emit("answer", { answer });
  });

  socket.on("call-ended", ({to}) => {
    // console.log('answer....to..',answer,to);
    io.to(to).emit("callEnded");
  });

  socket.on("isVideoMuted", ({isRemoteVideoMuted,isRemoteAudioMuted,targetUser}) => {
    // console.log('answer....to..',answer,to);
    io.to(targetUser?._id).emit("videoMuted",{isRemoteVideoMuted,isRemoteAudioMuted});
    // socket.emit("isVideoMuted",{isRemoteVideoMuted,isRemoteAudioMuted,targetuser});
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

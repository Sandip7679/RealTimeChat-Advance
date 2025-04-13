import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import ChatModel from "../models/chats.model.js";
import User from "../models/user.model.js";

export const findUsersToAdd = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // console.log('req...',req);
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -email");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in findUsersToAdd: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const chats = await ChatModel.find({ memberIds: userId })
      // .populate("memberIds", "name profilePic")
      .populate({
        path: "memberIds",
        select: "fullName profilePic",
        match: { _id: { $ne: userId } },
      })
      .sort({ updateAt: -1 });
    // .lean();
    res.status(200).json({ chats, success: true });
  } catch (error) {
    console.log("Error in getUserChats controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createNewChat = async (newChat, chatType) => {
  // let {memberIds, ...chatData} = newChat;
  // console.log("memberIds...", memberIds, "chatData...", chatData);
  try {
    // const chat = await ChatModel.findOneAndUpdate(
    //   {
    //     memberIds: { $all: memberIds },
    //   },
    //   {
    //     $setOnInsert: {
    //       ...chatData,
    //       chatType: "private",
    //       messages: [],
    //       unseenMessageCount: memberIds?.map((id) => ({ userId: id, count: 0 })),
    //     },
    //   },
    //   {upsert:true,new:false}
    // );
    let chat;
    if (chatType == "private") {
      chat = await ChatModel.findOne({
        memberIds: { $all: newChat.memberIds },
      });
    }

    if (!chat) {
      await ChatModel.create({
        ...newChat,
        chatType: chatType,
        messages: [],
        unseenMessageCount: newChat?.memberIds?.map((id) => ({
          userId: id,
          count: 0,
        })),
      });
    }
    console.log("chat...", chat);
    return chat; // Returns the chat if found, otherwise null
  } catch (error) {
    console.error("Error finding chat:", error);
    throw error;
  }
};

export const createChats = async (req, res) => {
  try {
    // const { memberIds, chatName, chatPicUrl,chatType } = req.body;
    const { chatType, chatData, file } = req.body;
    let chatStatus = [];
    let Chats = [];
    if (chatType == "private") {
      Chats = chatData;
    } else {
      let chatUrl = "";
      if (file) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(file, {
            folder: "ChatApp/chatProfilePic",
            resource_type: "image",
          });
          console.log("uploadResponse...", uploadResponse);
          if (uploadResponse.secure_url) {
            chatUrl = uploadResponse.secure_url;
          } else {
            res.status(401).json({ message: "Something went wrong !" });
          }
        } catch (error) {
          console.log("error upload....", error);
          res.status(401).json({ message: "Something went wrong !" });
        }
      }
      Chats = chatData.map((chat) => ({ ...chat, chatPicUrl: chatUrl }));
    }
    chatStatus = await Promise.all(
      Chats.map((chat) => {
        return createNewChat(chat, chatType);
      })
    );

    console.log("chatStatus...", chatStatus);

    // let unseenMsgCount = memberIds?.map((item, ind) => {
    //   return {
    //     userId: item,
    //     count: 0,
    //   };
    // });

    // let newChat = new ChatModel({
    //   chatName,
    //   chatPicUrl,
    //   memberIds,
    //   messages: [],
    //   unseenMessageCount: unseenMsgCount,
    // });

    // await newChat.save();
    res.status(200).json({ chatStatus, success: true });
  } catch (error) {
    console.log("Error in createChat controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  const { chatId, senderId, text, file } = req.body;
  console.log("file....", file);
  try {
    let fileUrl = "";
    if (file) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(file, {
          folder: "ChatApp/chatImage",
          resource_type: "auto",
        });
        console.log("uploadResponse...", uploadResponse);
        if (uploadResponse.secure_url) {
          fileUrl = uploadResponse.secure_url;
        } else {
          res.status(401).json({ message: "Something went wrong !" });
        }
      } catch (error) {
        console.log("error upload....", error);
        res.status(401).json({ message: "Something went wrong !" });
      }
    }
    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $push: {
          messages: {
            senderId,
            text,
            file: fileUrl,
          },
        },
        $inc: {
          "unseenMessageCount.$[elem].count": 1,
        },
      },
      {
        new: true,
        arrayFilters: [{ "elem.userId": { $ne: senderId } }],
      }
    );
    // console.log("updatedChat...", updatedChat);

    // socket.join(chatId); // chatId is the unique room ID for a chat
    // io.to(chatId).emit("newMessage", newMessage);
    // socket.broadcast.to(chatId).emit("newMessage", newMessage); //Broadcast to All Except Sender

    // const receiverSocketIds = updatedChat.memberIds
    //   .filter((receiverId) => receiverId.toString() !== senderId.toString())
    //   .map((recieverId) => getReceiverSocketId(recieverId))
    //   .filter((socketId) => socketId);
    updatedChat.memberIds.forEach((Id) => {
      let recieverId = Id.toString();
      let socketId = getReceiverSocketId(recieverId);
      if (socketId && recieverId !== senderId.toString()) {
        console.log("newmessage for sockedtId..", socketId,"recieverId..",recieverId);
        // const room = io.sockets.adapter.rooms.get(recieverId);
        // const isRoomActive = room && room.size > 0; // If size > 0, users are in the room

        // console.log(`Room ${recieverId} has ${room ? room.size : 0} users`);
        io.to(recieverId).emit("newMessage", updatedChat);
      }
      // console.log('io.sockets.adapter.rooms...',io.sockets.adapter.rooms);
      // console.log("All Active Rooms:", Array.from(io.sockets.adapter.rooms.keys()));
    });
    // if (receiverSocketIds?.length > 0) {
    //   io.to(receiverSocketIds).emit("newMessage", updatedChat);
    // } else {
    //   console.log("No reciever found !");
    // }
    res.status(200).json({ updatedChat, success: true });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUnseenCount = async (req, res) => {
  const { updateToUserIds, userId, chatId } = req.body;
  try {
    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $set: {
          "unseenMessageCount.$[elem].count": 0,
        },
      },
      { new: true, arrayFilters: [{ "elem.userId": userId }] }
    ).populate({
      path: "memberIds",
      select: "fullName profilePic",
      match: { _id: { $ne: userId } },
    });

    // const targatedSocketIds = updateToUserIds
    //   .map((Id) => getReceiverSocketId(Id))
    //   .filter((socketId) => socketId);
    // if (targatedSocketIds) {
    //   io.to(targatedSocketIds).emit("updateUnseenMessage", updatedChat);
    // }
    res.status(200).json({ success: true, updatedChat });
  } catch (error) {
    console.log("Error in updateUnseenMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

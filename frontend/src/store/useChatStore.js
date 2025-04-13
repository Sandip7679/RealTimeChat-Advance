import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  userChats: [],
  selectedUser: null,
  selectedChat: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessageSending:false,
  openChats: true,
  openEditChat: false,
  // contactsList:[],

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedChat: (selectedChat) => set({ selectedChat }),
  setOpenChats: (openChats) => set({ openChats }),
  setOpenEditChat: (openEditChat) => set({ openEditChat }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/chats/users");
      // console.log('res for users....',res);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getUserChats: async (userId) => {
    try {
      let res = await axiosInstance(`/chats/${userId}`);
      if (res.data?.success) {
        set({ userChats: res.data.chats });
      }
      // console.log("userId...",userId,"res. userChat...", res.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  // sendMessage: async (messageData) => {
  //   const { selectedUser, messages } = get();
  //   try {
  //     const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
  //     set({ messages: [...messages, res.data] });
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   }
  // },
  sendMessage: async (messageData) => {
    set({isMessageSending:true});
    const { selectedChat, userChats } = get();
    try {
      const res = await axiosInstance.post(`/chats/message/send`, messageData);
      set({
        selectedChat: {
          ...res.data.updatedChat,
          memberIds: selectedChat.memberIds,
        },
      });
      set({
        userChats: userChats.map((chat) =>
          chat._id == messageData.chatId
            ? { ...chat, messages: res.data.updatedChat.messages }
            : chat
        ),
      });
    } catch (error) {
      console.log("error in sendmessage....", error);
      toast.error(error.response.data.message);
    }
    set({isMessageSending:false});
  },

  newMessageUpdates: () => {
    const socket = useAuthStore.getState().socket;
    // const {updateUnseenCount} = get();
      // const { authUser } = useAuthStore();
    socket.on("newMessage", async (newMessageData) => {
      console.log("newMessageData...", newMessageData);
      if (newMessageData?._id == get().selectedChat?._id) {
        set({
          selectedChat: {
            ...newMessageData,
            memberIds: get().selectedChat?.memberIds,
          },
        });
        // console.log('first authUser._id...',authUser._id);
        try {
          await get().updateUnseenCount();
        } catch (error) {
          console.log('error in updateunseen trychatch....',error);
        }
      } else {
        let userChats = [...get().userChats];
        let chats = userChats.map((chat) =>
          chat._id == newMessageData._id
            ? { ...newMessageData, memberIds:chat.memberIds }
            : chat
        );
        set({
          userChats: chats,
        });
      }
    });
  },

  updateUnseenCount: async () => {
    const { selectedChat, userChats } = get();
    let data = {
      userId:useAuthStore.getState().authUser?._id,
      chatId:selectedChat._id
    };
    try {
      const res = await axiosInstance.post(`/chats/update/unseen`, data);
      console.log("res.data updateUnseenCount...", res.data);
      if (res.data?.success) {
        console.log("res.data unseencount....", res.data.updatedChat);
        let chats = userChats.map((chat) =>
          chat._id == res.data.updatedChat?._id ? res.data.updatedChat : chat
        );
        set({
          userChats: chats,
        });
      }
      return res.data;
    } catch (error) {
      console.log("error in updateUnseenCount....", error);
      toast.error(error.response.data.message);
      return error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));

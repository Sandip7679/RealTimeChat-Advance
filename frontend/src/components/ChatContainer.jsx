import { useChatStore } from "../store/useChatStore";
import React, { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    // messages,
    selectedChat,
    // getMessages,
    isMessagesLoading,
    selectedUser,
    isMessageSending,
    // subscribeToMessages,
    // unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // useEffect(() => {
  //   // getMessages(selectedUser._id);

  //   subscribeToMessages();

  //   return () => unsubscribeFromMessages();
  // // }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);
  // }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && selectedChat.messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat.messages]);

  const memberMap = React.useMemo(() => {
    return Object.fromEntries(
      selectedChat.memberIds.map((member) => [member._id, member])
    );
  }, []);

  console.log("memberMap...", memberMap);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedChat.messages?.map((message) => (
          <div key={message._id}>
            <div
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser?.profilePic || "/avatar.png"
                        : memberMap[message.senderId]?.profilePic ||
                          "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.file && (
                  <img
                    src={message.file}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
            {selectedChat.chatType == "group" && <div className="text-[12px] opacity-60 mb-7">{memberMap[message.senderId]?.fullName}</div>}
          </div>
        ))}
      </div>
      {/* {isMessageSending && <div className="chat chat-end">Sending...</div>} */}
      <MessageInput />
    </div>
  );
};
export default ChatContainer;

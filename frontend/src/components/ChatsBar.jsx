import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { MessageSquarePlus, Plus, Users } from "lucide-react";
// import useCallStore from "../store/useCallStore";
import useVideoCallStore from "../store/useVideoCallStore";

const ChatsBar = () => {
  const {
    getUsers,
    users,
    userChats,
    getUserChats,
    selectedUser,
    selectedChat,
    setSelectedChat,
    setSelectedUser,
    isUsersLoading,
    setOpenChats,
    setOpenEditChat,
    openEditChat,
    newMessageUpdates,
    unsubscribeFromMessages,
    updateUnseenCount,
  } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();
  // const {initializeSocket} = useCallStore();
  const {initializeCall} = useVideoCallStore();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [shoGroupChats, setShowGroupChats] = useState(false);

  useEffect(() => {
    getUsers();
    // console.log('authUser._id...',authUser._id);
    getUserChats(authUser._id);
    console.log("userChats...", userChats);
    // console.log('user...',users)
  }, []);


  useEffect(() => {
    // getMessages(selectedUser._id);
    newMessageUpdates();

    return () => unsubscribeFromMessages();
    // }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);
  }, []);

  useEffect(()=>{
    initializeCall();
  },[]);

  const handleClickChat = async (chatData) => {
    setSelectedChat(chatData);
    let data = await updateUnseenCount({
      userId: authUser._id,
      chatId: chatData._id,
    });
    if (data.success) {
      console.log("data unseencount....", data.updatedChat);
    }
  };

  // const filteredUsers = showOnlineOnly
  //   ? users.filter((user) => onlineUsers.includes(user._id))
  //   : users;

  const filteredChats = showOnlineOnly
    ? userChats.filter(
        (chat) =>
          chat.chatType == "private" &&
          onlineUsers.includes(chat.memberIds[0]._id)
      )
    : userChats;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="lg:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">My Chats</span>
          </div>
          <button
            onClick={() => setOpenEditChat(true)}
            title="Add Contacts"
            // className="size-9 rounded-lg bg-primary/10 flex items-center justify-center"
            className="mt-3 -ml-2 lg:mt-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center"
          >
            <MessageSquarePlus />
          </button>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredChats.map((chat) => {
          let unseenCount = chat.unseenMessageCount.find(
            (itm) => itm.userId === authUser._id
          )?.count || 0;
          // console.log('unseenCount...',unseenCount);
          return (
            <button
              key={chat._id}
              onClick={() => handleClickChat(chat)}
              className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedChat?._id === chat._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
            >
              <div className="relative mx-auto lg:mx-0 min-w-12">
                <img
                  src={
                    chat.chatPicUrl ||
                    (chat.chatType == "private" && chat.memberIds[0].profilePic) ||
                    "/avatar.png"
                  }
                  alt={chat.chatName}
                  className="size-12 object-cover rounded-full"
                />
                {chat.chatType == "private" &&
                  onlineUsers.includes(chat.memberIds[0]._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                    />
                  )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0 w-full">
                <div className="font-medium truncate">
                  {chat.chatType == "private"
                    ? chat.memberIds[0]?.fullName
                    : chat.chatName}
                </div>
                <div className="text-sm text-zinc-400 flex w-full justify-between gap-2">
                  {/* {chat.chatType == 'private' && onlineUsers.includes(chat.memberIds[0]._id) ? "Online" : "Offline"} */}
                  <div className="truncate">
                    {chat.messages?.at(-1)?.file? "Photo" : (chat.messages?.at(-1)?.text || "No messages yet")}
                  </div>
                  {unseenCount > 0 && (
                    <span className="text-right size-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-semibold rounded-full">
                      {unseenCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No Chats Found</div>
        )}
      </div>
    </aside>
  );
};
export default ChatsBar;

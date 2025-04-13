import { Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
// import useCallStore from "../store/useCallStore";
import useVideoCallStore from "../store/useVideoCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedChat, setSelectedChat } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  // const {setOpenVideoCall} = useCallStore();
  const {setOpenVideoCall,setTargetUser} = useVideoCallStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {console.log("selectedChat...", selectedChat)}
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedChat.chatPicUrl || "/avatar.png"}
                alt={selectedChat.chatName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            {/* <h3 className="font-medium">{selectedChat.chatName}</h3> */}
            <h3 className="font-medium">
              {selectedChat.chatType == "private"
                ? selectedChat.memberIds[0]?.fullName
                : selectedChat.chatName}
            </h3>
            {selectedChat.chatType == "private" ? (
              <div className="text-sm text-base-content/70 ">
                {onlineUsers.includes(selectedChat?.memberIds[0]._id) ? (
                  <p className="text-green-600">Online</p>
                ) : (
                  <p className="">Offline</p>
                )}
              </div>
            ) : (
              <p>{selectedChat?.memberIds?.length + 1} members</p>
            )}
          </div>
        </div>

        {/* Close button */}
        <div className="flex gap-5">
          {selectedChat.chatType == "private" &&<button onClick={() =>{ 
            setOpenVideoCall(true);
            setTargetUser(selectedChat.memberIds[0]);
          }}>
            <Video />
          </button>}
          <button onClick={() => setSelectedChat(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;

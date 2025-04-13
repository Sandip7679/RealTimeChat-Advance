import { useChatStore } from "../store/useChatStore";

import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ChatsBar from "../components/ChatsBar";
import ContactsBar from "../components/ContactsBar";
import EditChatPopup from "../components/EditChatPopup";
import useCallStore from "../store/useCallStore";
import VideoCall from "../components/VideoCall";
import useVideoCallStore from "../store/useVideoCallStore";

const HomePage = () => {
  const { selectedUser, openChats, openEditChat,selectedChat} = useChatStore();
  // const {openVideoCall} = useCallStore();
  const {openVideoCall} = useVideoCallStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* {openChats ? <ChatsBar /> : <ContactsBar />} */}
            {openChats && <ChatsBar />}
            {openEditChat && <EditChatPopup/>}
            {openVideoCall? <VideoCall/> : ( !selectedChat ?(!openEditChat && <NoChatSelected />) : <ChatContainer />)}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;

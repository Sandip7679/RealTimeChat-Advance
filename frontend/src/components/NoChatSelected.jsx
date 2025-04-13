import { MessageSquare } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {
   const {setOpenEditChat} = useChatStore();

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Chatty!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
        <button className="btn btn-primary btn-sm rounded-sm" 
         onClick={() => setOpenEditChat(true)}
        >
          Add Members
          </button>
      </div>
    </div>
    // <div
    //           className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
    //          justify-center"
    //         >
    //           <MessageSquare className="w-8 h-8 text-primary" />
    //         </div>
  );
};

export default NoChatSelected;

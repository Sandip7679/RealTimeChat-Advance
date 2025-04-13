import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Camera,
  Check,
  CrossIcon,
  MessageSquare,
  Search,
  Users,
  X,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EditChatPopup = () => {
  const {
    getUsers,
    users,
    // selectedUser,
    // setSelectedUser,
    isUsersLoading,
    setOpenChats,
    setOpenEditChat,
    userChats,
    getUserChats,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivateChat, setIsPrivateChat] = useState(true);
  const [createGroupCheck, setCreateGroupCheck] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState("");
  const [addedusers, setAddedUsers] = useState(new Set());
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState({
    selectedUsers: false,
    newUsers: false,
  });

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    let existedUserIds = new Set(
      userChats.flatMap((obj) => obj.memberIds.map((member) => member._id))
    );
    //  console.log('existedUserIds...',existedUserIds);
    setAddedUsers(existedUserIds);
  }, []);

  useEffect(() => {
    if (!createGroupCheck) {
      setShowGroupForm(false);
    }
    setSelectedUsers(new Set());
  }, [createGroupCheck]);

  // const getAddedUserIds = ()=>{
  //   let existedUserIds = new Set();
  //    userChats.forEach(chat => {
  //       if(chat.chatType == 'private'){
  //         chat.memberIds.forEach();
  //       }
  //    });
  // }

  const searchMember = (text) => {};

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const onClickUser = async (user, index) => {
    // setSelectedUsers((prev) => ({ ...prev, [index]: !prev[index] }));
    setSelectedUsers((prev) => {
      let newSelected = new Set(prev);
      if (newSelected.has(user._id)) {
        newSelected.delete(user._id);
      } else {
        newSelected.add(user._id);
      }
      return newSelected;
    });
  };

  const onClickAdd = async () => {
    if (createGroupCheck && !showGroupForm) {
      setShowGroupForm(true);
      return;
    }
    let userSelected = filteredUsers.filter((user, index) =>
      selectedUsers.has(user._id)
    );

    let Chats = [];
    if (!createGroupCheck) {
      Chats = userSelected.map((item, index) => {
        let chatData = {
          memberIds: [authUser._id, item._id],
          chatName: item.fullName,
          chatPicUrl: item.profilePic,
          // chatType:'private'
        };
        return chatData;
      });
    } else {
      console.log("group.....add..");
      if (!groupName) return;
      let userIds = userSelected.map((user) => user._id);
      let memberIds = [authUser._id, ...userIds];
      Chats = [
        {
          memberIds: memberIds,
          chatName: groupName,
        },
      ];
    }
    console.log("Chats...", Chats);

    let data = {
      chatType: !createGroupCheck ? "private" : "group",
      chatData: Chats,
      file: !createGroupCheck ? null : selectedImg,
    };
    try {
      let response = await axiosInstance.post("/chats/create", data);
      if (response.data.success) {
        toast.success("Members added succussfully");
        setOpenEditChat(false);
        getUserChats(authUser._id);
      } else {
        console.log("Not a successfull response..");
      }
    } catch (error) {
      console.log("error...", error);
      toast.error("Something went wrong");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      // await updateProfile({ profilePic: base64Image });
    };
  };

  //   if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <div className="fixed inset-0 flex justify-center items-center h-screen w-screen bg-black bg-opacity-90 z-10">
      <div
         className="relative mt-16 p-2 md:p-10 md:pt-2 justify-center items-center w-full md:w-1/2 max-w-[450px] h-[520px] bg-base-100 rounded-lg border-[1px] border-gray-700"
        // className="relative mt-16 p-2 md:p-10 md:pt-2 justify-center items-center w-full md:w-1/2 max-w-[450px] h-[520px] 
        // bg-white dark:bg-gray-900 
        // rounded-lg border border-gray-300 dark:border-gray-700 
        // shadow-lg"
      >
        <div className="border-b border-base-300 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-6" />
              <span className="font-medium hidden lg:block">Contacts</span>
            </div>
            <button
              //   onClick={() => setOpenChats(true)}
              onClick={() => setOpenEditChat(false)}
              title="My Chats"
              // className="size-9 rounded-lg bg-primary/10 flex items-center justify-center"
              className="absolute top-0 right-0 mt-3 -ml-2 lg:mt-0 size-6 bg-primary/10 bg-red-900 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={createGroupCheck}
                onChange={(e) => setCreateGroupCheck(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Create a group</span>
            </label>
            {/* <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span> */}
          </div>

          {!showGroupForm && (
            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="size-4 text-base-content/40" />
              </div>
              <input
                type="text"
                className={`input input-sm input-bordered w-full pl-10`}
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            {/* <input
                type="checkbox"
                // checked={createGroupCheck}
                // onChange={(e) => setCreateGroupCheck(e.target.checked)}
                className="checkbox checkbox-sm"
              /> */}
            <span className="text-sm">
              {selectedUsers.size == 0 ? "No" : selectedUsers.size} Member
              {selectedUsers.size > 1 ? "s " : " "}
              Selected
            </span>
          </label>
          {/* <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span> */}
        </div>

        {!showGroupForm && (
          <div className="overflow-y-auto w-full py-3 mt-5 min-h-[250px] max-h-[430px]">
            {filteredUsers.map((user, index) =>
              user?.fullName
                ?.toLowerCase()
                .includes(searchText.toLowerCase()) ? (
                <div
                  key={user._id}
                  onClick={() =>
                    (!addedusers.has(user._id) || createGroupCheck) &&
                    onClickUser(user, index)
                  }
                  className={`
              mb-3 w-full p-3 flex justify-between items-center gap-3 bg-base-300 rounded-lg
              hover:bg-base-200 transition-colors cursor-pointer
              ${
                // selectedUsers?._id === user._id
                selectedUsers.has(user._id)
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative mx-auto lg:mx-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="size-12 object-cover rounded-full"
                      />
                      {onlineUsers.includes(user._id) && (
                        <span
                          className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                        />
                      )}
                    </div>

                    {/* User info - only visible on larger screens */}
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>
                  <div>
                    {!addedusers.has(user._id) || createGroupCheck ? (
                      <label className="cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user._id)}
                          // onChange={(e) => setShowOnlineOnly(e.target.checked)}
                          className="checkbox checkbox-sm"
                        />
                      </label>
                    ) : (
                      <div className="text-base-content text-xs flex gap-1">
                        <Check color="green" size={18} />
                        <label>Active</label>
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            )}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                No Contacts Found
              </div>
            )}
          </div>
        )}
        {showGroupForm && (
          <div className="my-10">
            <div>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedImg || "/avatar.png"}
                    alt="Profile"
                    className="size-28 rounded-full object-cover border-2 "
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUploadingPhoto ? "animate-pulse pointer-events-none" : ""}
                `}
                  >
                    <Camera className="w-5 h-5 text-base-200" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingPhoto}
                    />
                  </label>
                </div>
                <p className="text-sm text-zinc-400">
                  {isUploadingPhoto
                    ? "Uploading..."
                    : "Click the camera icon to upload your group photo"}
                </p>
              </div>
            </div>
            <div>
              <div className="relative mt-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="size-4 text-base-content/40" />
                </div>
                <input
                  type="text"
                  required
                  className={`input input-sm input-bordered w-full pl-10`}
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full mt-4 disabled:btn-active"
          disabled={selectedUsers.size == 0 || isLoading}
          onClick={onClickAdd}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Loading...
            </>
          ) : createGroupCheck ? (
            showGroupForm ? (
              "CREATE A GROUP"
            ) : (
              "ADD MEMBERS"
            )
          ) : (
            "ADD TO MY CHAT"
          )}
        </button>
      </div>
    </div>
  );
};
export default EditChatPopup;

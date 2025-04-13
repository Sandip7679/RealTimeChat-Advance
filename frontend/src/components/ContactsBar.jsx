// import React, { useState } from "react";
// import { Search, X } from "lucide-react";
// import { useChatStore } from "../store/useChatStore";

// const contacts = [
//   { id: 1, name: "Alice Johnson" },
//   { id: 2, name: "Bob Smith" },
//   { id: 3, name: "Charlie Davis" },
//   { id: 4, name: "David Wilson" },
//   { id: 5, name: "Emma Brown" },
// ];

// const AddContactsPopup = () => {
//   const { setOpenContacts } = useChatStore();

//   // const [openContacts, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   const filteredContacts = contacts.filter((contact) =>
//     contact.name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="fixed top-0 left-0 flex justify-center items-center h-screen w-screen bg-base-300 bg-opacity-80">
//       <div className="inset-0 flex justify-center items-center w-full md:w-1/2 h-[90%] bg-primary/10">
//         <div className="p-5 rounded-lg shadow-lg">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Search Contacts</h2>
//             <button onClick={()=>setOpenContacts(false)}>
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>

//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Search..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <ul className="max-h-40 overflow-auto">
//             {filteredContacts.length > 0 ? (
//               filteredContacts.map((contact) => (
//                 <li
//                   key={contact.id}
//                   className="p-2 border-b hover:bg-gray-100 cursor-pointer"
//                 >
//                   {contact.name}
//                 </li>
//               ))
//             ) : (
//               <li className="p-2 text-gray-500">No contacts found</li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddContactsPopup;

import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { MessageSquare, Search, Users } from "lucide-react";

const ContactsBar = () => {
  const {
    getUsers,
    users,
    // selectedUser,
    // setSelectedUser,
    isUsersLoading,
    setOpenChats,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [selectedUsers,setSelectedUsers] = useState({});
  const [createGroup, setCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-0">
        <div className="lg:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <button
            onClick={() => setOpenChats(true)}
            title="My Chats"
            // className="size-9 rounded-lg bg-primary/10 flex items-center justify-center"
            className="mt-3 -ml-2 lg:mt-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center"
          >
            {/* <MessageSquarePlus /> */}
            <MessageSquare className="w-5 h-5 text-primary" />
          </button>
        </div>
        {/* TODO: Online filter toggle */}
        {/* <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show All Contacts</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div> */}

        {/* <div className="mt-3 hidden lg:flex items-center gap-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none"
          />
        </div> */}
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-4 text-base-content/40" />
          </div>
          <input
            type="text"
            className={`input input-sm input-bordered w-full pl-10`}
            placeholder="Search..."
            // value={formData.fullName}
            // onChange={(e) =>
            //   setFormData({ ...formData, fullName: e.target.value })
            // }
          />
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user,index) => (
          <button
            key={user._id}
            // onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                // selectedUsers?._id === user._id
                selectedUsers[index] === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
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
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            No Contacts Found
          </div>
        )}
      </div>
    </aside>
  );
};
export default ContactsBar;

import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import avatar from "../../public/avatar.png";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const {
    getUsers,
    getUnreadCount,
    selectedUser,
    users,
    setSelectedUser,
    isUserLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setshowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users.sort((a ,b)=>{
      const aOnline = onlineUsers.includes(a._id) ? -1 : 1;
        const bOnline = onlineUsers.includes(b._id) ? -1 : 1;
        return aOnline - bOnline; // Online (negative) comes first!
    })

  if (isUserLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block"> Contacts</span>
        </div>
        {/**  online Users toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 ">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setshowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online Users</span>
          </label>
          <span className="text-sm text-zinc-500">
            ({onlineUsers.length - 1} online )
          </span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((i) => {
          const unread = getUnreadCount(i._id);
          return (
            <button
              key={i._id}
              onClick={() => setSelectedUser(i)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transitions-colors
                ${
                  selectedUser?._id === i._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={i.profilePic || avatar}
                  alt={i.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(i._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
                {unread > 0 && ( // ← THE RED BUBBLE MAGIC! Only show if unread > 0
                  <span className="absolute bg-red-500 text-white h-6 w-6 rounded-full top-0 left-0">
                    {" "}
                    {/* Using DaisyUI badge for easy red */}
                    {unread} {/* Shows "2" if Tunde sent 2 messages! */}
                  </span>
                )}
              </div>
              {/** User info- only visible to large screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{i.fullName}</div>

                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(i._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500">No Online Users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

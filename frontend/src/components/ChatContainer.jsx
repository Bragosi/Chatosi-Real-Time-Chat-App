import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import avatar from "../../public/avatar.png";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    isMessagesLoading,
    messages,
    getMessages,
    selectedUser,
    subscribeToMasterListener,
    unSubscribeFromMasterListener,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // fetch + subscribe only when a user is selected
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMasterListener();

    return () => unSubscribeFromMasterListener();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMasterListener,
    unSubscribeFromMasterListener,
  ]);

  // auto-scroll when new messages come
  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((i) => (
          <div
            key={i._id}
            className={`chat ${
              i.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    i.senderId === authUser._id
                      ? authUser.profilePic || avatar
                      : selectedUser.profilePic || avatar
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(i.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col break-words max-w-[75%] sm:max-w-[60%] md:max-w-[50%]">
              {i.image && (
                <img
                  src={i.image}
                  alt="attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {i.text && (
                <p className="whitespace-pre-wrap break-words">{i.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  unreadCounts: {},
  // 👇 NEW: Track if master listener is active to prevent duplicates
  masterListenerActive: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const [usersRes, unreadRes] = await Promise.all([
        axiosInstance.get("/message/users"),
        axiosInstance.get("/message/unread-count"),
      ]);

      set({
        users: usersRes.data,
        unreadCounts: unreadRes.data,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      await axiosInstance.put(`/message/${userId}/mark-read`);
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });

      const currentUnread = get().unreadCounts;
      const newUnread = { ...currentUnread };
      delete newUnread[userId];
      set({ unreadCounts: newUnread });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // 👇 SINGLE MASTER LISTENER - handles EVERYTHING!
  subscribeToMasterListener: () => {
    const { masterListenerActive } = get();
    if (masterListenerActive) {
      return;
    }

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      return;
    }
    socket.on("newMessage", (newMessage) => {
      const { messages, selectedUser, unreadCounts } = get();
      const myId = useAuthStore.getState().authUser._id.toString();
      const senderIdStr = newMessage.senderId.toString();
      const receiverIdStr = newMessage.receiverId.toString();

      // 1. Check if this is for the current chat
      const isCurrentChat =
        selectedUser &&
        (senderIdStr === selectedUser._id.toString() ||
          receiverIdStr === selectedUser._id.toString());

      // 2. Check if this is for me (unread count logic)
      const isForMe = receiverIdStr === myId;

      // Handle current chat messages
      if (isCurrentChat && !messages.find((m) => m._id === newMessage._id)) {
        set({ messages: [...messages, newMessage] });
      }

      // Handle unread counts (only if message is for me and not current chat)
      if (isForMe && !isCurrentChat) {
        console.log("🔢 Updating unread count for:", senderIdStr);
        const newUnreadCounts = {
          ...unreadCounts,
          [senderIdStr]: (unreadCounts[senderIdStr] || 0) + 1,
        };
        console.log("🔢 New count:", newUnreadCounts[senderIdStr]);
        set({ unreadCounts: newUnreadCounts });
      }

      // If message is for current chat AND for me, don't count as unread
      if (isCurrentChat && isForMe) {
        return;
      }
    });

    set({ masterListenerActive: true });
  },

  unSubscribeFromMasterListener: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
    set({ masterListenerActive: false });
  },

  getUnreadCount: (userId) => {
    const { unreadCounts } = get();
    return unreadCounts[userId] || 0;
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

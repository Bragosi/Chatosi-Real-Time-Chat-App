import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Loader, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessages } = useChatStore();
  const [isLoading, setisLoading] = useState(false);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    setisLoading(true);
    try {
      await sendMessages({
        text: text.trim(),
        image: imagePreview,
      });
      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Failed to send message");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-base-100 shadow-lg border-t border-zinc-700 md:static md:border-t-0 md:shadow-none">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 max-w-full overflow-x-auto">
          <div className="relative flex-shrink-0">
            <img
              src={imagePreview}
              alt="Image preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center hover:bg-red-500 transition-colors"
              aria-label="Remove image"
            >
              <X className="size-4 text-white" />
            </button>
          </div>
        </div>
      )}

      <form
        className="flex items-center gap-2 max-w-full"
        onSubmit={handleSendMessage}
      >
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={text}
            className="flex-1 input input-bordered rounded-lg input-sm sm:input-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Type a message..."
            onChange={(e) => setText(e.target.value)}
            aria-label="Message input"
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            ref={fileInputRef}
            id="image-upload"
          />

          <button
            type="button"
            className="btn btn-circle btn-sm sm:btn-md text-zinc-400 hover:text-primary transition-colors flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-circle btn-sm sm:btn-md bg-primary text-white hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50"
          disabled={(!text.trim() && !imagePreview) || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

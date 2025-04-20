import { useState, useEffect } from "react";
import axiosInstance from "@/config/axios";
import { AuthContext } from "@/context/auth-context";
import { toast } from "react-hot-toast";
import { useContext } from "react";
import DiscussionLayout from "@/components/instructor-view/discussion-layout";

const InstructorDiscussionForum = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyContents, setReplyContents] = useState({});
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/discussion");
      if (response.data && Array.isArray(response.data)) {
        setMessages(response.data);
        const initialReplyContents = {};
        response.data.forEach((message) => {
          initialReplyContents[message._id] = "";
        });
        setReplyContents(initialReplyContents);
      } else {
        setMessages([]);
        setReplyContents({});
        console.error("Invalid messages data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages");
      setMessages([]);
      setReplyContents({});
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const formattedRole = auth.user.role.toLowerCase();
      if (formattedRole !== "student" && formattedRole !== "instructor") {
        toast.error("Invalid user role");
        return;
      }

      await axiosInstance.post("/discussion", {
        content: newMessage,
        sender: auth.user._id,
        senderName: auth.user.userName,
        senderRole: formattedRole,
      });
      setNewMessage("");
      fetchMessages();
      toast.success("Message posted successfully");
    } catch (error) {
      console.error("Error posting message:", error);
      toast.error("Failed to post message");
    }
  };

  const handleReply = async (messageId) => {
    const replyContent = replyContents[messageId];
    if (!replyContent || !replyContent.trim()) return;

    try {
      const formattedRole = auth.user.role.toLowerCase();
      if (formattedRole !== "student" && formattedRole !== "instructor") {
        toast.error("Invalid user role");
        return;
      }

      await axiosInstance.post(`/discussion/${messageId}/reply`, {
        content: replyContent,
        sender: auth.user._id,
        senderName: auth.user.userName,
        senderRole: formattedRole,
      });
      setReplyContents((prev) => ({ ...prev, [messageId]: "" }));
      fetchMessages();
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    }
  };

  const handleReplyChange = (messageId, value) => {
    setReplyContents((prev) => ({ ...prev, [messageId]: value }));
  };

  if (loading) {
    return (
      <DiscussionLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DiscussionLayout>
    );
  }

  return (
    <DiscussionLayout>
      {/* New Message Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmitMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full p-3 border rounded-lg mb-4"
            rows="3"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Post Message
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No messages yet. Be the first to post!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center mb-4">
                <div className="font-semibold">{message.senderName}</div>
                <div className="ml-2 text-sm text-gray-500">
                  ({message.senderRole})
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="mb-4">{message.content}</p>

              {/* Replies */}
              <div className="ml-8 space-y-4">
                {message.replies &&
                  message.replies.map((reply, index) => (
                    <div key={index} className="border-l-2 pl-4">
                      <div className="flex items-center mb-2">
                        <div className="font-semibold">{reply.senderName}</div>
                        <div className="ml-2 text-sm text-gray-500">
                          ({reply.senderRole})
                        </div>
                        <div className="ml-auto text-sm text-gray-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <p>{reply.content}</p>
                    </div>
                  ))}

                {/* Reply Form */}
                <div className="mt-4">
                  <textarea
                    value={replyContents[message._id] || ""}
                    onChange={(e) =>
                      handleReplyChange(message._id, e.target.value)
                    }
                    placeholder="Write your reply..."
                    className="w-full p-3 border rounded-lg mb-2"
                    rows="2"
                  />
                  <button
                    onClick={() => handleReply(message._id)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DiscussionLayout>
  );
};

export default InstructorDiscussionForum;

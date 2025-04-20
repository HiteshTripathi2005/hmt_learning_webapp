import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import toast from "react-hot-toast";

const HelpPage = () => {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState({}); // Store replies for each ticket
  const [replyingTo, setReplyingTo] = useState(null); // Track which ticket is being replied to

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/student/help/my-tickets");
      setTickets(response.data.tickets);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/student/help/create", {
        subject,
        description,
        priority,
      });

      if (response.data.success) {
        toast.success("Help ticket submitted successfully");
        setSubject("");
        setDescription("");
        setPriority("medium");
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to submit help ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    const replyText = replies[ticketId];
    if (!replyText?.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setReplyingTo(ticketId);
      const response = await axiosInstance.post(
        `/student/help/respond/${ticketId}`,
        {
          response: replyText,
        }
      );

      if (response.data.success) {
        toast.success("Reply sent successfully");
        setReplies((prev) => ({ ...prev, [ticketId]: "" }));
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setReplyingTo(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Help & Support</h1>

        {/* Submit Ticket Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Submit a New Help Ticket
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Detailed description of your problem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Help Tickets</h2>
          {loading ? (
            <p className="text-center py-4">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No tickets found</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Chat-like Messages */}
                  <div className="space-y-4">
                    {/* Student's Initial Message */}
                    <div className="flex flex-col max-w-[80%]">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-800">
                          {ticket.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        You • {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* All Responses */}
                    {ticket.responses &&
                      ticket.responses.map((response, index) => (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[80%] ${
                            response.respondedBy === "student"
                              ? ""
                              : "items-end ml-auto"
                          }`}
                        >
                          <div
                            className={`rounded-lg p-3 ${
                              response.respondedBy === "student"
                                ? "bg-gray-100"
                                : "bg-indigo-100"
                            }`}
                          >
                            <p className="text-sm text-gray-800">
                              {response.response}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {response.respondedBy === "student"
                              ? "You"
                              : response.respondedBy.charAt(0).toUpperCase() +
                                response.respondedBy.slice(1)}{" "}
                            • {new Date(response.respondedAt).toLocaleString()}
                          </span>
                        </div>
                      ))}

                    {/* Reply Form */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <textarea
                          value={replies[ticket._id] || ""}
                          onChange={(e) =>
                            setReplies((prev) => ({
                              ...prev,
                              [ticket._id]: e.target.value,
                            }))
                          }
                          placeholder="Type your reply..."
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[60px] resize-none text-sm"
                        />
                        <button
                          onClick={() => handleReply(ticket._id)}
                          disabled={
                            replyingTo === ticket._id ||
                            !replies[ticket._id]?.trim()
                          }
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {replyingTo === ticket._id ? "Sending..." : "Reply"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                    <span className={getPriorityColor(ticket.priority)}>
                      Priority: {ticket.priority}
                    </span>
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

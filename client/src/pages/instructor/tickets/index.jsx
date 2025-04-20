import { useState, useEffect, useContext } from "react";
import axiosInstance from "@/api/axiosInstance";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { BarChart, Book, LogOut, TicketIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";

const InstructorTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newResponse, setNewResponse] = useState("");
  const [status, setStatus] = useState("open");
  const [filter, setFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/instructor/help/tickets");
      setTickets(response.data.tickets);

      // Update selected ticket if one is selected
      if (selectedTicket) {
        const updatedSelectedTicket = response.data.tickets.find(
          (ticket) => ticket._id === selectedTicket._id
        );
        if (updatedSelectedTicket) {
          setSelectedTicket(updatedSelectedTicket);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      setSending(true);
      const response = await axiosInstance.put(
        `/instructor/help/tickets/${selectedTicket._id}`,
        {
          status,
          adminResponse: newResponse,
        }
      );

      if (response.data.success) {
        toast.success("Response sent successfully");
        setNewResponse("");
        // Update the tickets list and selected ticket
        await fetchTickets();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to send response");
    } finally {
      setSending(false);
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

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true;
    return ticket.status === filter;
  });

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      onClick: () => navigate("/instructor"),
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      onClick: () => navigate("/instructor"),
    },
    {
      icon: TicketIcon,
      label: "Help Tickets",
      value: "tickets",
      onClick: () => navigate("/instructor/tickets"),
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      onClick: () => {
        resetCredentials();
        sessionStorage.clear();
        navigate("/auth");
      },
    },
  ];

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Instructor View</h2>
          <nav>
            {menuItems.map((menuItem) => (
              <Button
                className="w-full justify-start mb-2"
                key={menuItem.value}
                variant={menuItem.value === "tickets" ? "secondary" : "ghost"}
                onClick={menuItem.onClick}
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Student Help Tickets</h1>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center py-4">Loading tickets...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tickets List */}
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTicket?._id === ticket._id
                        ? "border-indigo-500 bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setStatus(ticket.status);
                    }}
                  >
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
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                      <span className={getPriorityColor(ticket.priority)}>
                        Priority: {ticket.priority}
                      </span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      <p>
                        Student: {ticket.student?.name} ({ticket.student?.email}
                        )
                      </p>
                    </div>
                  </div>
                ))}
                {filteredTickets.length === 0 && (
                  <p className="text-center py-4 text-gray-500">
                    No tickets found
                  </p>
                )}
              </div>

              {/* Chat-like Conversation View */}
              {selectedTicket && (
                <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)] flex flex-col">
                  {/* Conversation Header */}
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <span
                        className={`text-sm ${getPriorityColor(
                          selectedTicket.priority
                        )}`}
                      >
                        Priority: {selectedTicket.priority}
                      </span>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Student's Initial Message */}
                    <div className="flex flex-col max-w-[80%]">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-800">
                          {selectedTicket.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        Student •{" "}
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* All Responses */}
                    {selectedTicket.responses &&
                      selectedTicket.responses.map((response, index) => (
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
                              ? `Student • ${new Date(
                                  response.respondedAt
                                ).toLocaleString()}`
                              : `${
                                  response.respondedBy.charAt(0).toUpperCase() +
                                  response.respondedBy.slice(1)
                                } • ${new Date(
                                  response.respondedAt
                                ).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleUpdateTicket} className="p-4 border-t">
                    <div className="flex gap-2">
                      <textarea
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px] resize-none"
                        placeholder="Type your response..."
                      />
                      <button
                        type="submit"
                        disabled={sending || !newResponse.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorTicketsPage;

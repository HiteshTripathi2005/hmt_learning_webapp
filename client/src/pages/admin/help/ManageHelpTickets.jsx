import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import toast from "react-hot-toast";

const ManageHelpTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("open");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/help/all");
      setTickets(response.data.tickets);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const response = await axiosInstance.put(
        `/admin/help/update/${selectedTicket._id}`,
        {
          status,
          adminResponse: response,
        }
      );

      if (response.data.success) {
        toast.success("Ticket updated successfully");
        setSelectedTicket(null);
        setResponse("");
        setStatus("open");
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to update ticket");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Help Tickets</h1>
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
                    setResponse(ticket.adminResponse || "");
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
                  <p className="text-gray-600 text-sm mb-2">
                    {ticket.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className={getPriorityColor(ticket.priority)}>
                      Priority: {ticket.priority}
                    </span>
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      Student: {ticket.student?.name} ({ticket.student?.email})
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

            {/* Ticket Response Form */}
            {selectedTicket && (
              <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-8">
                <h2 className="text-xl font-semibold mb-4">
                  Respond to Ticket
                </h2>
                <form onSubmit={handleUpdateTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Response
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter your response..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Ticket
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHelpTickets;

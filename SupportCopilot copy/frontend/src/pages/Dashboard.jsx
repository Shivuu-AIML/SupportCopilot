import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Plus, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.get("/tickets", { params });
      setTickets(res.data.tickets);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/tickets", form);
      toast.success("Ticket created");
      setShowForm(false);
      setForm({ customerName: "", customerEmail: "", subject: "", message: "" });
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    drafted: tickets.filter((t) => t.status === "drafted").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> New Ticket
        </button>
      </div>

      <div className="flex gap-4 text-sm">
        {["open", "drafted", "resolved"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full capitalize transition-colors ${
              filter === s
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
            }`}>
            {s === "open" && <Clock size={14} />}
            {s === "drafted" && <MessageSquare size={14} />}
            {s === "resolved" && <CheckCircle size={14} />}
            {s} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">New Ticket</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
              <input type="text" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Email</label>
              <input type="email" required value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {submitting ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-40" />
          <p>No {filter} tickets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket._id} to={`/tickets/${ticket._id}`}
              className="block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">{ticket.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{ticket.customerName}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.assignedTo && <span>Assigned to: {ticket.assignedTo.name}</span>}
                  </div>
                </div>
                <span className={`shrink-0 ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  ticket.status === "open" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                  ticket.status === "drafted" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}>
                  {ticket.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

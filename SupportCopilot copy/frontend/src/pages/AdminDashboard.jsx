import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Users, Ticket, BookOpen, CheckCircle, Clock, BarChart3, Shield, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/auth/users"),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
      } catch {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleActive = async (user) => {
    try {
      const res = await api.patch(`/auth/users/${user._id}/deactivate`, {
        isActive: !user.isActive,
      });
      setUsers(users.map((u) => (u._id === user._id ? res.data.user : u)));
      toast.success(`User ${res.data.user.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Tickets", value: stats?.totalTickets, icon: Ticket, color: "text-blue-500" },
    { label: "Open Tickets", value: stats?.openTickets, icon: Clock, color: "text-yellow-500" },
    { label: "Resolved", value: stats?.resolvedTickets, icon: CheckCircle, color: "text-green-500" },
    { label: "Users", value: stats?.totalUsers, icon: Users, color: "text-purple-500" },
    { label: "KB Articles", value: stats?.totalArticles, icon: BookOpen, color: "text-indigo-500" },
    { label: "Avg Time (hrs)", value: stats?.avgTimeToResolveHours ?? "—", icon: BarChart3, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Shield size={24} className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <Icon size={20} className={card.color} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value ?? "..."}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users size={20} /> All Agents
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.isActive ? "text-green-600" : "text-red-500"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(u)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto">
                      {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

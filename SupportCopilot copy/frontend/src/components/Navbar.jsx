import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LifeBuoy, FileText, LayoutDashboard, Shield, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <LifeBuoy size={24} />
              SupportCopilot
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/kb" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                <FileText size={16} /> KB Articles
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                  <Shield size={16} /> Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

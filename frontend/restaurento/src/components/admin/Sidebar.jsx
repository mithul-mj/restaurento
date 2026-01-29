import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import {
  LayoutDashboard,
  Store,
  Users,
  Flag,
  Calendar,
  DollarSign,
  Megaphone,
  X,
  LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen, activePage }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", link: "/admin/dashboard" },
    { icon: Store, label: "Restaurants", link: "/admin/restaurants" },
    { icon: Users, label: "Users", link: "/admin/users" },
    { icon: Flag, label: "Reports", link: "/admin/reports" },
    { icon: Calendar, label: "Bookings", link: "/admin/bookings" },
    { icon: DollarSign, label: "Payments & Revenue", link: "/admin/finance" },
    { icon: Megaphone, label: "Marketing", link: "/admin/marketing" },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
      <div className="h-full flex flex-col">
        <div className="px-6 py-6 border-b border-gray-50 flex items-center gap-3">
          <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
            <span className="font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Restauranto</span>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden ml-auto text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link || "#"}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${activePage === item.label
                  ? "bg-[#fff5eb] text-[#ff5e00]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }
                    `}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-gray-50 mt-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#fff5eb] flex items-center justify-center text-[#ff5e00] font-bold shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <Link to="/admin/profile" className="block text-sm font-bold text-gray-900 truncate hover:text-[#ff5e00] transition-colors">
                  Admin
                </Link>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

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
  X,
  LogOut,
  Ticket,
  Image,
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
    { icon: DollarSign, label: "Payments & Revenue", link: "/admin/finance" },
    { icon: Ticket, label: "Coupons", link: "/admin/coupons" },
    { icon: Image, label: "Banners", link: "/admin/banners" },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex h-full flex-col">
        <div className="relative flex items-center justify-center border-b border-gray-50 px-6 py-6">
          <img
            src="/text.png"
            alt="Restaurento"
            className="h-11 w-auto"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-6 text-gray-400 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {menuItems.map((item, index) => {
            const isActive = activePage === item.label;

            return (
              <Link
                key={index}
                to={item.link}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                  ? "bg-[#fff5eb] text-[#ff5e00]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
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
          </div>
        </div>
      </div>
    </aside >
  );
};

export default Sidebar;

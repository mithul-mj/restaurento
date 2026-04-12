import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { useLocation } from "../../context/LocationContext";
import notificationService from "../../services/notification.service";
import NotificationModal from "../../pages/user/NotificationModal";


const UserNavbar = () => {
    const { user } = useSelector((state) => state.auth);
    const avatar = user?.avatar;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const socket = useSocket();
    const { placeholderText, setIsLocationModalOpen } = useLocation();





    useEffect(() => {
        if (user?._id) {
            notificationService.getUnreadCount().then(res => {
                if (res.success) setUnreadCount(res.count);
            });
        }
    }, [user?._id]);

    useEffect(() => {
        if (socket && user?._id) {
            socket.emit("join_private_room", user._id);

            socket.on("new_notification", (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                socket.off("new_notification");
            };
        }
    }, [socket, user?._id]);


    const handleBellClick = async () => {
        if (!isModalOpen) {
            const res = await notificationService.getNotifications(1);
            if (res.success) {
                setNotifications(res.notifications);
                setHasNextPage(res.meta.hasNextPage);
                setCurrentPage(1);
            }
        }
        setIsModalOpen(!isModalOpen);
    };

    const handleLoadMore = async () => {
        const nextPage = currentPage + 1;
        const res = await notificationService.getNotifications(nextPage);
        if (res.success) {
            setNotifications(prev => [...prev, ...res.notifications]);
            setHasNextPage(res.meta.hasNextPage);
            setCurrentPage(nextPage);
        }
    };


    const handleMarkAllAsRead = async () => {
        const res = await notificationService.markAllAsRead();
        if (res.success) {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    };

    const handleMarkAsRead = async (id) => {
        const res = await notificationService.markOneAsRead(id);
        if (res.success) {
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        }
    };


    return (
        <nav className="md:sticky top-0 z-[100] bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 py-3">
            <div className="flex items-center justify-between relative">
                <Link to="/" className="flex items-center group">
                    <img
                        src="/text.png"
                        alt="Restaurento"
                        className="h-10 w-auto cursor-pointer transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,94,0,0.2)]"
                    />
                </Link>

                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-8">
                            {[
                                { to: "/", label: "Explore" },
                                { to: "/my-bookings", label: "My Bookings" },
                                { to: "/my-wallet", label: "My Wallet" },
                            ].map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `text-sm font-medium transition-all duration-200 ${isActive
                                            ? "text-[#ff5e00] border-b-2 border-[#ff5e00] pb-1"
                                            : "text-gray-500 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={handleBellClick}
                                className="relative text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <Link to="/wishlist" className="text-gray-500 hover:text-[#ff5e00] transition-colors">
                                <Heart size={20} />
                            </Link>

                            <Link to="/profile">
                                <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                                    <img
                                        src={
                                            avatar ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=ff5e00&color=fff`
                                        }
                                        alt="Profile"
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/login"
                            className="border-2 border-[#ff5e00] text-[#ff5e00] hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-100 hover:-translate-y-0.5 active:translate-y-0 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300">
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-[#ff5e00] hover:bg-[#e05200] text-white px-7 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0">
                            Sign Up
                        </Link>
                    </div>
                )}

                {/* Mobile Icons - Simplified to just Notifications */}
                <div className="flex items-center gap-2 md:hidden">
                    {user ? (
                        <button
                            onClick={handleBellClick}
                            className="relative text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-[#ff5e00] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider transition-all active:scale-[0.98]">
                            Join Now
                        </Link>
                    )}
                </div>

                {/* Notification Modal placed for both desktop/mobile positioning */}
                <NotificationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    hasNextPage={hasNextPage}
                    onLoadMore={handleLoadMore}
                />
            </div>
        </nav>
    );
};

export default UserNavbar;

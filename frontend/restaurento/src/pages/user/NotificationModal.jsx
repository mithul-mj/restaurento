import React, { useState } from "react";
import { X, Bell, CheckCircle, Calendar, CreditCard, Tag, Settings } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const NotificationModal = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, unreadCount, hasNextPage, onLoadMore }) => {
    const [activeTab, setActiveTab] = useState("unread");
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const filteredNotifications = activeTab === "unread"
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        await onLoadMore();
        setIsLoadingMore(false);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'BOOKING': return <Calendar size={18} />;
            case 'WALLET': return <CreditCard size={18} />;
            case 'PROMOTION': return <Tag size={18} />;
            case 'SYSTEM':
            default: return <Settings size={18} />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            onMarkAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };


    return (
        <div className="absolute top-16 right-0 w-[420px] max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:w-auto bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 flex items-start justify-between border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-2xl text-[#ff5e00]">

                        <Bell size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Notification</h2>
                        <p className="text-sm text-gray-500 font-medium">{unreadCount} unread notifications</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Tabs & Mark All */}
            <div className="px-6 py-4 flex items-center justify-between bg-white">
                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("unread")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "unread" ? "bg-[#ff5e00] text-white shadow-md shadow-orange-100" : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >

                        Unread <span className={activeTab === "unread" ? "opacity-100" : "opacity-50"}>{unreadCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "all" ? "bg-[#ff5e00] text-white shadow-md shadow-orange-100" : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >

                        All
                    </button>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        title="Mark all as read"
                        className="p-2 bg-orange-50 text-[#ff5e00] rounded-lg hover:bg-orange-100 transition-colors"
                    >

                        <CheckCircle size={20} />
                    </button>
                )}
            </div>

            {/* Scrollable List */}
            <div className="max-h-[500px] overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400">No {activeTab} notifications</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex gap-4 ${!notification.isRead ? "bg-white border-orange-100 shadow-sm" : "bg-gray-50 border-transparent text-gray-500"
                                }`}
                        >
                            <div className={`p-2 h-fit rounded-xl shrink-0 ${!notification.isRead ? "bg-orange-50 text-[#ff5e00]" : "bg-gray-100 text-gray-400"}`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <h3 className="font-bold text-gray-800 text-sm truncate">{notification.title}</h3>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!notification.isRead && <span className="w-2 h-2 bg-[#ff5e00] rounded-full shadow-[0_0_8px_rgba(255,94,0,0.6)]"></span>}
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            {dayjs(notification.createdAt).fromNow()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs leading-relaxed text-gray-600">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {hasNextPage && activeTab === "all" && (
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="w-full py-3 bg-gray-50 text-gray-600 text-xs font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoadingMore ? "Loading..." : "Load more notifications"}
                    </button>
                )}
            </div>

        </div>
    );
};

export default NotificationModal;

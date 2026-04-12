import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, Wallet, Heart, User } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MobileBottomNav = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);

    if (!user) return null;

    const navItems = [
        { to: "/", icon: Home, label: "Home" },
        { to: "/my-bookings", icon: Calendar, label: "Bookings" },
        { to: "/my-wallet", icon: Wallet, label: "Wallet" },
        { to: "/wishlist", icon: Heart, label: "Wishlist" },
        { to: "/profile", icon: User, label: "Profile" },
    ];

    useEffect(() => {
        // Find active index with sub-route support
        const index = navItems.findIndex(item => 
            item.to === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.to)
        );
        if (index !== -1) setActiveIndex(index);
    }, [location.pathname]);

    return (
        <nav 
            role="navigation"
            aria-label="Mobile navigation bar"
            className="fixed bottom-0 left-0 right-0 h-[72px] bg-white rounded-t-[30px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)] px-4 flex items-center justify-between md:hidden z-[100] border-t border-gray-100/50 pb-safe overflow-visible transform-gpu translate-z-0"
        >
            {/* SVG Gradient definitions for 3D effect */}
            <svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
                <defs>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ff8c00', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ff5e00', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
            </svg>

            {navItems.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        className="relative flex flex-col items-center justify-center w-full h-[60px] transition-all duration-300 z-10 outline-none"
                    >
                        <motion.div 
                            animate={{
                                y: isActive ? -25 : 0,
                                scale: isActive ? 1.35 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 450, damping: 28 }}
                            className="relative flex items-center justify-center will-change-transform"
                        >
                            {/* Orange Gradient Glow Aura */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1.25 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="absolute w-12 h-12 rounded-full blur-xl pointer-events-none"
                                        style={{ background: 'radial-gradient(circle, rgba(255,94,0,0.3) 0%, rgba(255,94,0,0) 75%)' }}
                                    />
                                )}
                            </AnimatePresence>

                            <item.icon 
                                size={22} 
                                strokeWidth={isActive ? 2.5 : 1.8}
                                fill={isActive ? "url(#activeGradient)" : "none"}
                                className={`transition-all duration-300 ${isActive ? "text-[#ff5e00] drop-shadow-[0_10px_15px_rgba(255,94,0,0.4)]" : "text-gray-400"}`} 
                            />
                        </motion.div>
                        <span className={`text-[10px] font-bold mt-1 tracking-tight transition-all duration-500 ${isActive ? "text-[#ff5e00] opacity-100 translate-y-[-2px]" : "text-gray-400 opacity-60 translate-y-[-2px]"}`}>
                            {item.label}
                        </span>
                        
                        {/* Interactive touch area */}
                        <div className="absolute inset-x-1 inset-y-2 rounded-2xl active:bg-gray-100/40 transition-colors" />
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;

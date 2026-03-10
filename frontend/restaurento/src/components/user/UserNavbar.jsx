import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Heart, Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const UserNavbar = () => {
    const { user, avatar } = useSelector((state) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isJumping, setIsJumping] = useState(false);

    const logoLetters = "Restauranto".split("");

    const handleLogoClick = () => {
        if (isJumping) return;
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 800); // Reset after animation duration
    };

    const letterVariants = {
        jump: (i) => ({
            y: [0, -18, 0],
            transition: {
                duration: 0.6,
                times: [0, 0.4, 1],
                delay: i * 0.04,
                ease: "easeInOut"
            }
        }),
        initial: { y: 0 }
    };

    return (
        <nav className="sticky top-0 z-[100] bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 py-3">
            <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center group-hover:bg-[#e05200] transition-colors">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </div>
                    <motion.div
                        className="font-bold text-xl text-gray-900 tracking-tight flex cursor-pointer"
                        onClick={handleLogoClick}
                        animate={isJumping ? "jump" : "initial"}
                    >
                        {logoLetters.map((char, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                variants={letterVariants}
                                className="inline-block"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>
                </Link>
                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-8">
                            {[
                                { to: "/", label: "Explore" },
                                { to: "/my-bookings", label: "My Bookings" },
                                { to: "/offers", label: "Offers" }
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
                            <button className="relative text-gray-500 hover:text-gray-700">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>

                            <Link to="/wishlist" className="text-gray-500 hover:text-[#ff5e00] transition-colors">
                                <Heart size={20} />
                            </Link>

                            <Link to="/profile">
                                <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                                    <img
                                        src={
                                            avatar ||
                                            `https://ui-avatars.com/api/?name=${user?.fullName || user}&background=random`
                                        }
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:block">
                        <Link
                            to="/signup"
                            className="bg-[#ff5e00] hover:bg-[#e05200] text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-md shadow-orange-100">
                            Sign Up
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-500"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden pt-4 pb-6 px-4 space-y-3 animate-in fade-in slide-in-from-top-5 duration-200 z-[90]">
                    {user ? (
                        <>
                            {[
                                { to: "/", label: "Explore" },
                                { to: "/my-bookings", label: "My Bookings" },
                                { to: "/offers", label: "Offers" },
                                { to: "/wishlist", label: "Wishlist" }
                            ].map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg font-lig transition-all ${isActive
                                            ? "bg-orange-50 text-[#ff5e00]"
                                            : "text-gray-500 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            <div className="border-t border-gray-100 my-2 pt-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                        <img
                                            src={
                                                avatar ||
                                                `https://ui-avatars.com/api/?name=${user?.fullName || user}&background=random`
                                            }
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="text-gray-900 font-medium">My Profile</span>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="py-2">
                            <Link
                                to="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center w-full bg-[#ff5e00] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-100">
                                Sign Up
                            </Link>
                            <div className="mt-3 text-center">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm text-gray-500 font-medium"
                                >
                                    Already have an account? <span className="text-[#ff5e00]">Log in</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default UserNavbar;
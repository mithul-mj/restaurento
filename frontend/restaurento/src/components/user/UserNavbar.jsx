import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import { useSelector } from "react-redux";

const UserNavbar = () => {
    const { user, avatar } = useSelector((state) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-[100] bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
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
                    <span className="font-bold text-xl text-gray-900 tracking-tight">
                        Restauranto
                    </span>
                </div>
                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-8">
                            <Link
                                to="/"
                                className="text-gray-900 font-medium hover:text-[#ff5e00] transition-colors">
                                Explore
                            </Link>
                            <Link
                                to="/bookings"
                                className="text-gray-500 hover:text-[#ff5e00] transition-colors">
                                My Bookings
                            </Link>
                            <Link
                                to="/offers"
                                className="text-gray-500 hover:text-[#ff5e00] transition-colors">
                                Offers
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <button className="relative text-gray-500 hover:text-gray-700">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>

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
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 text-gray-900 font-medium hover:bg-gray-50 rounded-lg">
                                Explore
                            </Link>
                            <Link
                                to="/bookings"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 text-gray-500 hover:bg-gray-50 hover:text-[#ff5e00] rounded-lg">
                                My Bookings
                            </Link>
                            <Link
                                to="/offers"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 text-gray-500 hover:bg-gray-50 hover:text-[#ff5e00] rounded-lg">
                                Offers
                            </Link>
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
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white pt-24 pb-12 px-6 border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <img src="/text.png" alt="Restaurento" className="h-10 w-auto" />
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Restaurento is the premier ecosystem for booking tables and pre-ordering meals at the world's finest restaurants.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#ff5e00] hover:text-white transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#ff5e00] hover:text-white transition-colors"><Twitter size={18} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Discover</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="/" className="hover:text-[#ff5e00] transition-colors">Top Restaurants</Link></li>
                            <li><Link to="/" className="hover:text-[#ff5e00] transition-colors">New Arrivals</Link></li>
                            <li><Link to="/" className="hover:text-[#ff5e00] transition-colors">Special Offers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="/profile" className="hover:text-[#ff5e00] transition-colors">My Profile</Link></li>
                            <li><Link to="/my-bookings" className="hover:text-[#ff5e00] transition-colors">My Bookings</Link></li>
                            <li><Link to="/wishlist" className="hover:text-[#ff5e00] transition-colors">Wishlist</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><a href="mailto:support@restaurento.com" className="hover:text-[#ff5e00] transition-colors">support@restaurento.com</a></li>
                            <li><span className="block">Mumbai, India</span></li>
                            <li><span className="block">+91 (22) 4200 6800</span></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Restaurento. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

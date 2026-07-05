import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar, ChevronRight, ArrowRight, Search, ShoppingBag, Wallet, CheckCircle,
    Instagram, Twitter, Menu, X, Utensils, Clock, Zap, Star, MapPin, ShieldCheck, Smartphone
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import userService from '../../services/user.service';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, role } = useSelector(state => state.auth);
    const containerRef = useRef(null);
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroTranslateY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

    useEffect(() => {
        document.title = "Restaurento | Reserve & Pre-order Fine Dining";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        if (user) {
            if (role === "USER") navigate('/');
            else if (role === "RESTAURANT") navigate('/restaurant/dashboard');
            else if (role === "ADMIN") navigate('/admin/dashboard');
        }

        const fetchTop = async () => {
            try {
                const res = await userService.getTopRestaurants();
                if (res.success) setTopRestaurants(res.restaurants.slice(0, 4));
            } catch (err) {
                console.error("Failed to fetch top restaurants", err);
            }
        };
        fetchTop();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [user, role, navigate]);

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen font-inter text-gray-900 overflow-x-hidden selection:bg-[#ff5e00] selection:text-white" ref={containerRef}>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/landing" className="flex items-center">
                        <img src="/text.png" alt="Restaurento" className={`h-8 md:h-10 transition-all duration-300 ${isScrolled ? '' : 'brightness-0 invert'}`} />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {['Problem', 'Features', 'Trending', 'Partner'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className={`text-sm font-semibold tracking-wide transition-colors ${isScrolled ? 'text-gray-600 hover:text-[#ff5e00]' : 'text-gray-200 hover:text-white'}`}>
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {!user && (
                            <>
                                <Link to="/login" className={`text-sm font-bold px-6 py-2.5 rounded-full transition-all ${isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}>
                                    Log In
                                </Link>
                                <Link to="/signup" className="text-sm font-bold bg-[#ff5e00] text-white px-6 py-2.5 rounded-full hover:bg-[#e05300] transition-colors shadow-lg shadow-[#ff5e00]/30">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    <button className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-900' : 'text-white'}`} onClick={() => setIsMobileNavOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMobileNavOpen && (
                    <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 bg-white z-[100] flex flex-col p-8">
                        <div className="flex justify-end">
                            <button onClick={() => setIsMobileNavOpen(false)} className="p-2 text-gray-900 bg-gray-100 rounded-full"><X size={24} /></button>
                        </div>
                        <div className="flex flex-col gap-6 mt-12">
                            {['Problem', 'Features', 'Trending', 'Partner'].map(item => (
                                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMobileNavOpen(false)} className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {item}
                                </a>
                            ))}
                            <div className="h-px bg-gray-200 my-4" />
                            {!user && (
                                <>
                                    <Link to="/login" className="text-xl font-semibold text-gray-600">Log In</Link>
                                    <Link to="/signup" className="text-xl font-semibold text-[#ff5e00]">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
                <div className="absolute inset-0 z-0">
                    <img src="/restaurant_hero_bg.png" alt="Hero" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
                </div>

                <motion.div style={{ opacity: heroOpacity, y: heroTranslateY }} className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">


                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tighter leading-[1.05] mb-8 drop-shadow-2xl">
                        Skip the line. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5e00] to-[#ff8c42]">Own the night.</span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        The world's most seamless restaurant reservation and pre-ordering ecosystem. Secure your table and menu before you arrive.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 bg-[#ff5e00] text-white rounded-full font-bold text-lg hover:bg-[#e05300] transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,94,0,0.4)] flex items-center justify-center gap-2">
                            Start Exploring <ArrowRight size={20} />
                        </button>
                        <a href="#problem" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                            How it works
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* The Pain Point & Solution */}
            <section id="problem" className="py-24 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div variants={fadeInUp} className="space-y-8">

                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                                Because waiting ruins <br className="hidden md:block" /> perfect plans.
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Traditional dining platforms just hold a spot in a long queue. We eliminate the queue entirely by syncing your booking directly with the kitchen's capacity and table inventory in real-time.
                            </p>

                            <div className="space-y-6 pt-4">
                                {[
                                    { icon: Clock, title: "Zero Wait Time", desc: "Your table is guaranteed the minute you arrive." },
                                    { icon: Utensils, title: "Pre-order Your Meal", desc: "Order ahead so your food is fired exactly when you sit down." },
                                    { icon: ShieldCheck, title: "Secure & Instant", desc: "Book instantly with our integrated payment and wallet system." }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#ff5e00]">
                                            <feature.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h4>
                                            <p className="text-gray-600">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5e00] to-orange-300 rounded-[3rem] blur-3xl opacity-20 transform rotate-6" />
                            <div className="relative bg-white p-2 rounded-[2.5rem] shadow-2xl border border-gray-100">
                                <img src="/about-us-img.png" alt="Dining Experience" className="w-full h-auto rounded-[2rem] object-cover" />

                                {/* Floating UI Elements */}
                                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 flex items-center gap-4 animate-float">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Table Confirmed</p>
                                        <p className="text-xs text-gray-500">Today at 8:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">Designed for a seamless experience.</h2>
                        <p className="text-lg text-gray-600">Everything you need to discover, book, and enjoy your favorite restaurants, packed into one powerful platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                        {/* Feature 1 - Large */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 bg-gray-50 rounded-[2rem] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#ff5e00] mb-6">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Intelligent Discovery</h3>
                                <p className="text-gray-600 max-w-sm">Find exactly what you're craving with our powerful filters, real-time availability maps, and curated collections.</p>
                            </div>
                        </motion.div>

                        {/* Feature 2 - Small */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.1 }} className="bg-gray-900 rounded-[2rem] p-10 relative overflow-hidden text-white group">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md mb-6">
                                    <Wallet size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-3">Digital Wallet</h3>
                                    <p className="text-gray-400 text-sm">Instant refunds, easy checkouts, and seamless cashback.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 3 - Small */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.2 }} className="bg-orange-50 rounded-[2rem] p-10 relative overflow-hidden group">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="w-14 h-14 bg-[#ff5e00] rounded-2xl flex items-center justify-center text-white mb-6">
                                    <Star size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Reviews</h3>
                                    <p className="text-gray-600 text-sm">Real reviews from diners who actually booked and dined.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 4 - Large */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.3 }} className="md:col-span-2 bg-gray-50 rounded-[2rem] p-10 relative overflow-hidden group flex items-center justify-between">
                            <div className="relative z-10 max-w-md">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#ff5e00] mb-6">
                                    <Smartphone size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Order Tracking</h3>
                                <p className="text-gray-600">Get instant push notifications and status updates. Know exactly when your table is ready and your food is being prepared.</p>
                            </div>
                            <img src="/referral_hand.png" alt="App interface" className="hidden md:block w-48 h-auto absolute right-10 bottom-0 translate-y-10 group-hover:translate-y-0 transition-transform duration-500" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trending Restaurants Grid */}
            {topRestaurants.length > 0 && (
                <section id="trending" className="py-24 px-6 bg-[#f8f9fa]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Trending Now</h2>
                                <p className="text-gray-600 text-lg">The most sought-after tables in the city.</p>
                            </div>
                            <Link to="/" className="hidden sm:flex items-center gap-2 text-[#ff5e00] font-bold hover:gap-4 transition-all">
                                View all <ArrowRight size={20} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {topRestaurants.map((res, idx) => (
                                <motion.div
                                    key={res._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(`/restaurants/${res._id}`)}
                                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img src={res.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} alt={res.restaurantName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        {res.bestOffer && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#ff5e00] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                -{res.bestOffer.discountValue}% OFF
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <h3 className="text-xl font-bold mb-1 truncate">{res.restaurantName}</h3>

                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-8 text-center sm:hidden">
                            <Link to="/" className="inline-flex items-center gap-2 text-[#ff5e00] font-bold">
                                View all restaurants <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Partner CTA */}
            <section id="partner" className="py-24 px-6 relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gray-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                        {/* Abstract BG */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#ff5e00] opacity-20 blur-[100px] pointer-events-none transform translate-x-1/4" />

                        <div className="relative z-10 md:max-w-xl text-center md:text-left">
                            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
                                Elevate your <br className="hidden md:block" /> restaurant.
                            </h2>
                            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                                Join hundreds of premium establishments using Restaurento to streamline operations, increase table turnover by up to 30%, and deliver flawless dining experiences.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                <Link to="/restaurant/signup" className="w-full sm:w-auto px-8 py-4 bg-[#ff5e00] text-white rounded-full font-bold hover:bg-white hover:text-gray-900 transition-all shadow-lg text-center">
                                    Become a Partner
                                </Link>
                                <Link to="/restaurant/login" className="w-full sm:w-auto px-8 py-4 text-white font-bold hover:text-[#ff5e00] transition-colors text-center">
                                    Partner Login
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10 w-full md:w-auto flex-1 max-w-sm">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] space-y-6">
                                {[
                                    { icon: Calendar, title: "Smart Scheduling", text: "Dynamic table inventory management" },
                                    { icon: ShoppingBag, title: "Pre-order System", text: "Zero-friction order flow to kitchen" },
                                    { icon: Wallet, title: "Automated Settlements", text: "Direct payments with zero hassle" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{item.title}</h4>
                                            <p className="text-gray-400 text-sm">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 px-6 border-t border-gray-100">
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
                                <li><Link to="/" className="hover:text-[#ff5e00] transition-colors">Cities</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Partner With Us</h4>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li><Link to="/restaurant/signup" className="hover:text-[#ff5e00] transition-colors">Add your restaurant</Link></li>
                                <li><Link to="/restaurant/login" className="hover:text-[#ff5e00] transition-colors">Business Login</Link></li>
                                <li><Link to="#" className="hover:text-[#ff5e00] transition-colors">Partner Guidelines</Link></li>
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
        </div>
    );
};

export default LandingPage;

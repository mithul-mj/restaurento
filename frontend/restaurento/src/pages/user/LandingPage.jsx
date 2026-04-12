import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar,
    ChevronRight,
    ArrowRight,
    Search,
    ShoppingBag,
    Wallet,
    CheckCircle,
    Instagram,
    Twitter,
    Menu,
    X,
    Utensils,
    Clock,
    Zap,
    Star
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

    // Parallax & Scroll Effects
    const { scrollY } = useScroll();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const heroTranslateY = useTransform(scrollYProgress, [0, 0.4], [0, -50]);
    const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    useEffect(() => {
        document.title = "Restaurento | Reserve & Pre-order Fine Dining";
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        if (user) {
            if (role === "USER") navigate('/');
            else if (role === "RESTAURANT") navigate('/restaurant/dashboard');
            else if (role === "ADMIN") navigate('/admin/dashboard');
        }

        const fetchTop = async () => {
            try {
                const res = await userService.getTopRestaurants();
                if (res.success) setTopRestaurants(res.restaurants);
            } catch (err) {
                console.error("Failed to fetch top restaurants", err);
            }
        };
        fetchTop();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [user, role, navigate]);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const stagger = {
        whileInView: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="bg-white min-h-screen font-inter tracking-tight selection:bg-orange-100 selection:text-[#ff5e00] overflow-x-hidden" ref={containerRef}>
            {/* Professional Navigation Bar */}
            <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 px-6 md:px-12 py-5 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/landing" className="flex items-center">
                        <img
                            src="/text.png"
                            alt="Restaurento"
                            className={`h-10 w-auto transition-all ${isScrolled ? '' : 'brightness-0 invert'}`}
                        />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-10">
                        {user && ['Features', 'Philosophy', 'Trending', 'Partner'].map((item) => (
                            <button
                                key={item}
                                aria-label={`Scroll to ${item}`}
                                onClick={() => {
                                    const element = document.getElementById(item.toLowerCase());
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors min-h-[44px] px-2 ${isScrolled ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center">
                        <button aria-label="Toggle navigation menu" className={`md:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`} onClick={() => setIsMobileNavOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* In-Depth Mobile Nav */}
            <AnimatePresence>
                {isMobileNavOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-white z-[2000] p-10 flex flex-col items-center justify-center gap-8"
                    >
                        <button className="absolute top-10 right-10 text-gray-900" onClick={() => setIsMobileNavOpen(false)}>
                            <X size={32} />
                        </button>
                        {['Features', 'Philosophy', 'Trending', 'Partner'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setIsMobileNavOpen(false);
                                    document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-2xl font-black text-gray-900 uppercase tracking-tighter"
                            >
                                {item}
                            </button>
                        ))}
                        <Link to="/login" className="text-2xl font-black text-[#ff5e00] uppercase tracking-tighter">Login</Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Immersive Hero Section */}
            <header className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-gray-900">
                <motion.div style={{ scale: backgroundScale }} className="absolute inset-0 z-0">
                    <img
                        src="/restaurant_hero_bg.png"
                        className="w-full h-full object-cover opacity-40 grayscale"
                        alt="Luxurious fine dining room with curated table settings"
                        fetchpriority="high"
                        width="1920"
                        height="1080"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/40 to-gray-900/90" />
                </motion.div>

                <motion.div
                    style={{ opacity: heroOpacity, y: heroTranslateY }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center"
                >

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-5xl sm:text-7xl md:text-[120px] lg:text-[140px] font-bold text-white leading-[0.9] md:leading-[0.85] tracking-tight uppercase mb-8 md:mb-12"
                    >
                        Table <br className="hidden sm:block" /> Without <br className="hidden sm:block" /> The Wait.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-10 md:mb-16 font-medium leading-relaxed px-4"
                    >
                        Redefining the standard of convenience in fine dining. <br className="hidden md:block" />
                        A curated ecosystem for those who value every second.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8"
                    >
                        <button onClick={() => navigate('/')} className="w-full sm:w-auto px-12 py-5 bg-[#ff5e00] text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-gray-900 transition-all shadow-2xl shadow-orange-500/40 active:scale-95">
                            Explore Collections
                        </button>
                        <Link to="/restaurant/dashboard" className="w-full sm:w-auto px-12 py-5 border border-white/20 text-white rounded-2xl font-bold text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-gray-900 transition-all active:scale-95 text-center">
                            For Partners
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Vertical Text Scroller */}
                <div aria-label="Scroll indicator to explore more content" className="absolute right-12 bottom-24 hidden lg:flex flex-col items-center gap-12 group">
                    <span aria-hidden="true" className="text-[9px] font-black text-white/20 uppercase tracking-[0.8em] vertical-text">Scroll to Dive</span>
                    <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent relative">
                        <motion.div
                            animate={{ y: [0, 80, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute top-0 left-[-1.5px] w-[4px] h-[4px] bg-[#ff5e00] rounded-full shadow-[0_0_8px_#ff5e00]"
                        />
                    </div>
                </div>
            </header>

            {/* Smart Experience Section */}
            <section id="features" className="py-24 md:py-40 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <motion.div
                            initial="initial"
                            whileInView="whileInView"
                            variants={stagger}
                            className="space-y-16"
                        >
                            <div className="space-y-6 text-center lg:text-left">
                                <span className="text-[10px] font-black tracking-[0.5em] text-[#ff5e00] uppercase">The Experience</span>
                                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] md:leading-[0.9] tracking-tight uppercase">Built for the <br className="hidden md:block" /> modern diner.</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                                {[
                                    { icon: <Clock />, title: "Instant Access", desc: "Book curated tables in under 30 seconds." },
                                    { icon: <Zap />, title: "Smart Pre-Order", desc: "Select your menu before checking in." },
                                    { icon: <Wallet />, title: "Digital Wallet", desc: "Secure payments with instant cashback." },
                                    { icon: <CheckCircle />, title: "Quality Check", desc: "Only the highest-rated partners admitted." }
                                ].map((item, i) => (
                                    <motion.div key={i} variants={fadeInUp} className="group cursor-default">
                                        <div className="w-14 h-14 bg-gray-50 flex items-center justify-center text-[#ff5e00] rounded-2xl mb-6 transition-all duration-300 group-hover:bg-[#ff5e00] group-hover:text-white shadow-sm border border-gray-100">
                                            {React.cloneElement(item.icon, { size: 24 })}
                                        </div>
                                        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-sm font-medium text-gray-400 leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] bg-gray-100 rounded-[64px] overflow-hidden shadow-2xl relative z-10">
                                <img
                                    src="/about-us-img.png"
                                    className="w-full h-full object-cover grayscale-[0.2]"
                                    alt="Professional chef preparing a modern dining dish"
                                    loading="lazy"
                                    width="800"
                                    height="1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
                            </div>
                            {/* Accent Boxes */}
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-100 rounded-[32px] -z-0 opacity-50" />
                            <div className="absolute top-20 -right-10 w-64 h-32 bg-[#ff5e00] rounded-[32px] -z-0 opacity-10 blur-3xl" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Philosophy Block */}
            <section id="philosophy" className="py-24 md:py-40 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="grid grid-cols-6 gap-20">
                        {Array.from({ length: 36 }).map((_, i) => (
                            <div key={i} className="w-20 h-20 border border-white/20 rounded-full" />
                        ))}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div {...fadeInUp} className="space-y-12">
                        <span className="text-[10px] font-black tracking-[0.8em] text-white/40 uppercase">Beyond Reservations</span>
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[1.1] md:leading-[0.9]">
                            We believe in the luxury <br className="hidden md:block" /> of <span className="text-[#ff5e00]">undivided attention.</span>
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                            Restaurento was built to dissolve the friction between craving and creation.
                            We automate the logistics so you can savor the connection.
                        </p>
                        <div className="flex justify-center pt-8">
                            <div className="w-20 h-px bg-[#ff5e00]" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Curated Grid Section */}
            {topRestaurants.length > 0 && (
                <section id="trending" className="py-24 md:py-40 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 md:mb-32 gap-8 md:gap-12 text-center md:text-left">
                            <div className="space-y-4 flex-1 w-full">
                                <span className="text-[10px] font-black tracking-[0.5em] text-gray-300 uppercase">Season 2026</span>
                                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight uppercase">Selected <br className="hidden md:block" /> Collections.</h2>
                            </div>
                            <p className="flex-1 text-gray-400 font-medium max-w-sm text-sm leading-relaxed">
                                Our curators spend thousands of hours selecting the city's finest dining stages. Only the top establishments make the final cut.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 md:gap-y-20 gap-x-4 md:gap-x-12">
                            {topRestaurants.map((res, idx) => (
                                <motion.div
                                    key={res._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(`/restaurants/${res._id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[4/5] rounded-3xl md:rounded-[32px] overflow-hidden mb-4 md:mb-8 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-700 bg-gray-50">
                                        <img
                                            src={res.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}
                                            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                            alt={`${res.restaurantName} - Selected collection restaurant`}
                                            loading="lazy"
                                            width="400"
                                            height="500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {res.bestOffer && (
                                            <div className="absolute top-6 right-6 bg-[#ff5e00] text-white px-4 py-2 rounded-full text-[9px] font-black tracking-widest uppercase shadow-xl transform transition-transform group-hover:scale-110">
                                                -{res.bestOffer.discountValue}%
                                            </div>
                                        )}

                                        <div className="absolute bottom-10 left-10 right-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                            <div className="flex items-center gap-2 text-[8px] font-black tracking-widest uppercase mb-2">
                                                <Utensils size={10} />
                                                {res.tags?.[0]}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest block underline underline-offset-4">Book Table</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-2 group-hover:text-[#ff5e00] transition-colors duration-300">{res.restaurantName}</h3>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-300 tracking-[0.1em] uppercase">
                                            <span>{res.address?.city || 'Selected Venue'}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span>{res.ratingStats?.count > 0 ? `${res.ratingStats.average}+ / 5` : 'New'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Professional CTA Section */}
            <section id="partner" className="py-24 md:py-40 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 block lg:flex items-center gap-20 md:gap-32">
                    <motion.div {...fadeInUp} className="flex-1 space-y-10 md:space-y-12 text-center lg:text-left">
                        <div className="space-y-6">
                            <span className="text-[10px] font-black tracking-[0.5em] text-[#ff5e00] uppercase">Partner with us</span>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-[1.1] md:leading-[0.9]">Transform your <br className="hidden md:block" /> establishment.</h2>
                        </div>
                        <p className="text-gray-500 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                            Join over 500 premium establishments using Restaurento to streamline their bookings and pre-order systems. Increase table turnover and guest satisfaction today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-8 justify-center md:justify-start pt-6">
                            <Link to="/restaurant/signup" className="px-10 py-5 bg-[#ff5e00] text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-gray-900 transition-colors">
                                Become a Partner
                            </Link>
                            <Link to="/restaurant/login" className="text-[10px] font-black tracking-[0.3em] text-gray-400 hover:text-gray-900 uppercase transition-colors">
                                Dashboard Login
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 mt-20 md:mt-0 hidden md:block"
                    >
                        <div className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm">
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase tracking-widest">30% Efficiency Gain</h4>
                                        <p className="text-xs text-gray-400 font-medium">Average increase in table rotation</p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase tracking-widest">Seamless Ordering</h4>
                                        <p className="text-xs text-gray-400 font-medium">Zero-friction pre-order management</p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                        <Wallet size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase tracking-widest">Direct Payments</h4>
                                        <p className="text-xs text-gray-400 font-medium">Automated settlement cycles</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Progressive Newsletter Section */}
            <section className="py-24 md:py-40 px-6 relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-gray-900 rounded-[48px] md:rounded-[64px] p-10 md:p-24 overflow-hidden shadow-2xl"
                    >
                        {/* Abstract Background Accents - Optimized for Performance */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#ff5e00] opacity-10 blur-[60px] -rotate-12 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-orange-400 opacity-5 blur-[40px] pointer-events-none" />

                        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-12">
                            <div className="space-y-6">
                                <span className="text-[10px] font-black tracking-[0.5em] text-[#ff5e00] uppercase">The Inner Circle</span>
                                <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] md:leading-[0.9] uppercase">Join the <br className="hidden md:block" /> movement.</h2>
                                <p className="text-gray-400 font-medium text-base md:text-lg leading-relaxed px-4">
                                    Become a member of our exclusive community. Get early access to newly <br className="hidden md:block" /> curated venues and signature dining experiences.
                                </p>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className="relative flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto bg-white/5 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-transparent border-none text-white text-sm font-bold px-6 py-4 focus:ring-0 placeholder:text-white/20 w-full"
                                    aria-label="Email for newsletter"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-10 py-5 bg-[#ff5e00] text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-gray-900 transition-all active:scale-95 shadow-xl shadow-orange-500/20"
                                >
                                    Join Now
                                </button>
                            </form>

                            <p className="text-[9px] font-bold text-white/20 tracking-[0.3em] uppercase">
                                No spam. Just curated excellence.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Designer Footer */}
            <footer className="pt-40 pb-20 px-6 md:px-12 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-20 mb-32">
                        <div className="lg:col-span-2 space-y-12">
                            <Link to="/landing">
                                <img
                                    src="/LogoWithText.png"
                                    alt="Restaurento"
                                    className="h-12 w-auto"
                                />
                            </Link>
                            <p className="text-gray-400 font-medium max-w-sm leading-relaxed">
                                Curating the world's finest dining experiences through seamless technology and intentional design.
                                Join our network today.
                            </p>
                            <div className="flex gap-8">
                                <a href="https://instagram.com" aria-label="Follow Restaurento on Instagram" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff5e00] hover:text-white transition-all shadow-sm"><Instagram size={20} /></a>
                                <a href="https://twitter.com" aria-label="Follow Restaurento on Twitter" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff5e00] hover:text-white transition-all shadow-sm"><Twitter size={20} /></a>
                                <a href="#" aria-label="Our core features" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff5e00] hover:text-white transition-all shadow-sm"><Zap size={20} /></a>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <h5 className="text-[10px] font-black text-gray-900 tracking-[0.5em] uppercase">Navigation</h5>
                            <ul className="space-y-6">
                                {['All Restaurants', 'Top Trending', 'Featured Chefs', 'Cities'].map(item => (
                                    <li key={item}><Link to="/" className="text-[11px] font-bold text-gray-400 hover:text-[#ff5e00] tracking-widest uppercase transition-colors">{item}</Link></li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-10">
                            <h5 className="text-[10px] font-black text-gray-900 tracking-[0.5em] uppercase">Partners</h5>
                            <ul className="space-y-6">
                                {['Business Support', 'Partner Login', 'Enrollment', 'Dashboard'].map(item => (
                                    <li key={item}><Link to="/restaurant/login" className="text-[11px] font-bold text-gray-400 hover:text-[#ff5e00] tracking-widest uppercase transition-colors">{item}</Link></li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-10">
                            <h5 className="text-[10px] font-black text-gray-900 tracking-[0.5em] uppercase">Contact</h5>
                            <ul className="space-y-6">
                                <li className="text-[11px] font-bold text-gray-900 tracking-widest uppercase">support@restaurento.com</li>
                                <li className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Mumbai, India</li>
                                <li className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">+91 (22) 4200 6800</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-gray-100 gap-10">
                        <div className="text-[9px] font-bold text-gray-300 tracking-[0.4em] uppercase text-center md:text-left">
                            &copy; {new Date().getFullYear()} RESTAURENTO. ALL RIGHTS RESERVED. <br className="md:hidden" /> DESIGNED FOR EXCELLENCE.
                        </div>
                        <div className="flex gap-12 text-[9px] font-black tracking-[0.4em] text-gray-400 uppercase">
                            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .vertical-text {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
            `}} />
        </div>
    );
};

export default LandingPage;

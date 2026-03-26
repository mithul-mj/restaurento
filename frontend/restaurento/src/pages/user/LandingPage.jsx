import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    ChevronRight, 
    ArrowRight
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSelector } from 'react-redux';
import userService from '../../services/user.service';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, role } = useSelector(state => state.auth);
    const containerRef = React.useRef(null);
    const [topRestaurants, setTopRestaurants] = React.useState([]);
    
    // Minimal Parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    React.useEffect(() => {
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
    }, [user, role, navigate]);

    return (
        <div className="bg-[#fafafa] min-h-screen font-inter selection:bg-orange-100 selection:text-[#ff5e00]" ref={containerRef}>
            {/* Minimal Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#fafafa]/80 backdrop-blur-md px-10 py-8 flex justify-center items-center border-b border-gray-100">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/landing')}>
                    <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center text-white font-black text-lg">R</div>
                    <span className="text-xl font-black text-gray-900 font-outfit tracking-tighter uppercase">RESTAURENTO</span>
                </div>
            </header>

            {/* Premium Minimal Hero */}
            <main className="pt-24">
                <section className="min-h-[90vh] flex flex-col md:flex-row items-center px-10 gap-0 border-b border-gray-100">
                    <div className="flex-1 relative h-[80vh] w-full overflow-hidden bg-gray-50 border-r border-gray-100">
                        <motion.div style={{ y: backgroundY }} className="h-full w-full">
                            <motion.img 
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                src="/restaurant_hero_bg.png" 
                                className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                                alt="Luxury Dining"
                            />
                        </motion.div>
                    </div>

                    <div className="flex-1 pl-20 py-20">
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                        >
                            <span className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase mb-8 block">EST. 2026</span>
                            <h1 className="text-7xl md:text-9xl font-black text-gray-900 font-outfit leading-[0.85] mb-12 tracking-tighter uppercase">
                                TABLE <br />
                                READY.
                            </h1>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-16 max-w-md">
                                A curated dining standard for those who value time and taste equally. Minimal wait, maximum flavor.
                            </p>
                            
                            <div className="flex flex-col md:flex-row items-center gap-16">
                                <button 
                                    onClick={() => navigate('/')}
                                    className="group flex items-center gap-6 text-[10px] font-black tracking-[0.4em] text-gray-900 uppercase hover:text-[#ff5e00] transition-colors"
                                >
                                    <span className="h-[1px] w-16 bg-gray-900 group-hover:bg-[#ff5e00] transition-colors"></span>
                                    EXPLORE DINING
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Minimal Feature Bar */}
                <section className="py-24 px-10 flex flex-col md:flex-row gap-0 border-b border-gray-100">
                    {[
                        { title: "ADVANCED BOOKING", desc: "RESERVE UP TO 5 DAYS AHEAD" },
                        { title: "SMART PRE-ORDER", desc: "MENU SELECTED BEFORE ARRIVAL" },
                        { title: "INTEGRATED WALLET", desc: "INSTANT REWARDS & CASHBACK" }
                    ].map((feat, i) => (
                        <div key={i} className={`flex-1 flex flex-col gap-3 py-10 md:py-0 ${i !== 2 ? 'md:border-r border-gray-100' : ''} md:px-10`}>
                            <span className="text-[10px] font-black tracking-[0.4em] text-gray-900 uppercase">{feat.title}</span>
                            <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">{feat.desc}</span>
                        </div>
                    ))}
                </section>

                {/* Curated Grid - Even more minimal */}
                {topRestaurants.length > 0 && (
                    <section id="trending-section" className="py-24 px-10 bg-white">
                        <div className="flex justify-between items-end mb-24">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase mb-4 text-center md:text-left">Selected Picks</span>
                                <h2 className="text-5xl font-black text-gray-900 font-outfit uppercase tracking-tighter text-center md:text-left">Trending Now</h2>
                            </div>
                            <button 
                                onClick={() => navigate('/')}
                                className="hidden md:block text-[10px] font-black tracking-[0.4em] text-gray-400 hover:text-gray-900 uppercase underline underline-offset-8"
                            >
                                View All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
                            {topRestaurants.map((res, idx) => (
                                <motion.div 
                                    key={res._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(`/restaurants/${res._id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-50 rounded-lg shadow-sm group-hover:shadow-xl transition-all duration-500">
                                        <img 
                                            src={res.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                            alt={res.restaurantName} 
                                        />
                                        {res.bestOffer && (
                                            <div className="absolute top-4 right-4 text-[9px] font-black bg-gray-900 px-3 py-1.5 text-white tracking-widest uppercase rounded-sm">
                                                -{res.bestOffer.discountValue}%
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.1em] mb-2 group-hover:text-[#ff5e00] transition-colors">{res.restaurantName}</h3>
                                        <div className="flex justify-between items-center opacity-60">
                                            <span className="text-[9px] font-bold tracking-[0.15em] uppercase">{res.tags?.[0]}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Vertical CTA - Ultimate Minimalism */}
                <section className="py-32 px-10 text-center border-t border-gray-100">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <span className="text-[10px] font-black tracking-[0.5em] text-gray-300 uppercase mb-8 block">Final Chapter</span>
                        <h2 className="text-6xl md:text-8xl font-black text-gray-900 font-outfit leading-none mb-16 tracking-tighter uppercase">
                            EVERY SECOND <br />
                            COUNTS.
                        </h2>
                        <button 
                            onClick={() => navigate('/')}
                            className="text-[10px] font-black tracking-[0.5em] text-[#ff5e00] hover:text-gray-900 transition-colors uppercase border-b border-[#ff5e00] pb-4"
                        >
                            Explore Restaurants
                        </button>
                    </motion.div>
                </section>
            </main>

            {/* Designer Footer */}
            <footer className="pt-24 pb-20 px-10 bg-white border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-20 mb-16">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center text-white font-black text-lg">R</div>
                            <span className="text-xl font-black text-gray-900 font-outfit tracking-tighter uppercase">RESTAURENTO</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed tracking-widest uppercase">
                            Redefining the dining standard. <br />
                            Experience flavor, skip the wait.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-gray-900 tracking-[0.4em] uppercase mb-2">Explore</span>
                        <Link to="/" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">All Restaurants</Link>
                        <button 
                            onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[10px] text-left font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors"
                        >
                            Top Trending
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-gray-900 tracking-[0.4em] uppercase mb-2">Account</span>
                        <Link to="/login" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">User Login</Link>
                        <Link to="/restaurant/login" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">Restaurant Login</Link>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-gray-900 tracking-[0.4em] uppercase mb-2">Partners</span>
                        <Link to="/restaurant/signup" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">Join as a Restaurant</Link>
                        <Link to="/restaurant/login" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">Partner Dashboard</Link>
                        <a href="mailto:support@restaurento.com" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">Partner Support</a>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-gray-50 gap-10">
                    <div className="flex gap-12 text-[10px] font-black tracking-[0.4em] text-gray-400">
                        <a href="#" className="hover:text-gray-900 transition-colors uppercase">Instagram</a>
                        <a href="#" className="hover:text-gray-900 transition-colors uppercase">Twitter</a>
                        <a href="#" className="hover:text-gray-900 transition-colors uppercase">Behance</a>
                    </div>
                    <div className="text-[9px] font-bold text-gray-300 tracking-[0.3em] uppercase">
                        &copy; 2026 RESTAURENTO. PROUDLY DESIGNED FOR THE MODERN DINER.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

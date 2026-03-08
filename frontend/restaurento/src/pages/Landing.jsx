import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import HeroImage1 from '../assets/images/hero1.png';
import HeroImage2 from '../assets/images/hero2.png';
import HeroImage3 from '../assets/images/hero3.png';

const Landing = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-white overflow-hidden">

            <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                        <motion.div
                            className="lg:w-1/2"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-medium text-sm mb-6">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                </span>
                                #1 Food Delivery Service
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-slate-900">
                                Experience the <br />
                                <span className="text-gradient">Unknown Taste</span>
                            </motion.h1>

                            <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                                We bring the world's most delicious gourmet meals directly to your doorstep. Fresh, fast, and unforgettably tasty.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 group"
                                >
                                    Order Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full font-semibold transition-all">
                                    View Menu
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 text-sm font-medium text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span>30 Min Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <span>100% Secure Checkout</span>
                                </div>
                            </motion.div>
                        </motion.div>


                        <motion.div
                            className="lg:w-1/2 relative"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="relative z-10">
                                <motion.img
                                    src={HeroImage1}
                                    alt="Delicious Food"
                                    className="w-full max-w-[600px] h-auto object-contain mx-auto drop-shadow-2xl"
                                    animate={{
                                        y: [0, -20, 0],
                                        rotate: [0, 2, -2, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 6,
                                        ease: "easeInOut"
                                    }}
                                />


                                <motion.div
                                    className="absolute -bottom-10 -left-10 md:bottom-10 md:left-0 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white" />
                                        ))}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 text-orange-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold text-slate-900">4.9</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Positive Reviews</p>
                                    </div>
                                </motion.div>
                            </div>


                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-orange-100 to-red-50 rounded-full opacity-60 blur-3xl -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-orange-600 font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
                        <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4 text-slate-900">More Than Just Delivery</h2>
                        <p className="text-slate-600">We don't just deliver food, we deliver an experience. Quality, speed, and taste in every bite.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Clock, title: "Super Fast Delivery", desc: "We deliver your food hot and fresh in under 30 minutes, guaranteed.", color: "orange" },
                            { icon: UtensilsCrossed, title: "Fresh Ingredients", desc: "Our chefs use only the freshest, locally sourced ingredients for every meal.", color: "green" },
                            { icon: ShieldCheck, title: "Quality Guarantee", desc: "If you're not satisfied, we'll make it right. Your happiness is our priority.", color: "blue" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 text-${feature.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            <section className="py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div className="max-w-xl">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">Popular Dishes</h2>
                            <p className="text-slate-600">Explore the top-rated dishes from our exclusive menu.</p>
                        </div>
                        <button className="hidden md:flex items-center gap-2 text-orange-600 font-semibold hover:gap-4 transition-all">
                            See All Menu <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[HeroImage1, HeroImage2, HeroImage3].map((img, idx) => (
                            <motion.div
                                key={idx}
                                className="relative group rounded-3xl overflow-hidden cursor-pointer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {/* Placeholder for actual dish image */}
                                    <img src={img} alt="Dish" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white pt-20">
                                    <h3 className="text-xl font-bold mb-1">Gourmet Special {idx + 1}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-orange-300">$12.{99 + idx}</span>
                                        <button className="w-10 h-10 rounded-full bg-white text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-20 relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 -translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Ready to taste the magic?</h2>
                            <p className="text-slate-400 text-lg mb-10">Join thousands of satisfied customers who order their daily meals from us. Get 20% off your first order!</p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 flex-grow backdrop-blur-sm"
                                />
                                <button className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/50">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

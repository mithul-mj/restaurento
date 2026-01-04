import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star, MapPin, Clock, Phone, Calendar, ChevronDown, Plus, Minus, AlertTriangle, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantDetails = () => {
    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            date: '2023-10-27',
            partySize: '2 people',
            timeSlot: '6:30 PM'
        }
    });

    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Spaghetti Carbonara", price: 22.00, qty: 2 },
        { id: 2, name: "Lasagna Bolognese", price: 20.00, qty: 1 }
    ]);

    const activeTab = "About";
    const selectedTimeSlot = watch("timeSlot");

    const updateQty = (id, delta) => {
        setCartItems(items => items.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const foodTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const taxes = 5.12;
    const total = foodTotal + taxes;

    const onSubmit = (data) => {
        console.log("Booking Data:", { ...data, cartItems, total });
    };

    const timeSlots = ["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"];

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans">

            <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                <path d="M7 2v20" />
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">Restauranto</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-gray-900 font-medium hover:text-[#ff5e00] transition-colors">Explore</Link>
                    <Link to="/bookings" className="text-gray-500 hover:text-[#ff5e00] transition-colors">My Bookings</Link>
                    <Link to="/offers" className="text-gray-500 hover:text-[#ff5e00] transition-colors">Offers</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative text-gray-500 hover:text-gray-700">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/signup" className="bg-[#ff5e00] hover:bg-[#e05200] text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-md shadow-orange-100">Sign Up</Link>
                    </div>
                    <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                        <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">


                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[450px] mb-8 rounded-3xl overflow-hidden">

                    <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt="Interior"
                        />
                    </div>

                    <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt="Food 1"
                        />
                    </div>

                    <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt="Interior 2"
                        />
                    </div>

                    <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1964&auto=format&fit=crop"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt="Food 2"
                        />
                    </div>

                    <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1621256794692-0f048259d3e8?q=80&w=1964&auto=format&fit=crop"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt="Entrance"
                        />
                    </div>
                </div>


                <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                    <Link to="/" className="hover:text-gray-600">Home</Link>
                    <span>/</span>
                    <span className="hover:text-gray-600 cursor-pointer">Restaurants</span>
                    <span>/</span>
                    <span className="text-gray-800 font-semibold">The Golden Spoon</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 relative">


                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">The Golden Spoon</h1>
                        <div className="flex items-center gap-2 mb-6 text-sm">
                            <Star size={16} className="text-[#ff5e00] fill-[#ff5e00]" />
                            <span className="font-bold text-gray-900">4.5</span>
                            <span className="text-gray-500">(1,204 reviews)</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">$6.00 per person</span>
                        </div>


                        <div className="flex items-center gap-8 border-b border-gray-100 mb-6">
                            {["About", "Menu", "Reviews"].map(tab => (
                                <button
                                    key={tab}
                                    className={`pb-3 text-sm font-semibold transition-colors relative
                                ${activeTab === tab ? 'text-[#ff5e00]' : 'text-gray-500 hover:text-gray-700'}
                            `}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff5e00]"></span>
                                    )}
                                </button>
                            ))}
                        </div>


                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">About The Golden Spoon</h3>
                            <p className="text-gray-600 leading-relaxed text-sm mb-6">
                                Experience the heart of Italy right here. The Golden Spoon offers a culinary journey through authentic Italian flavors, crafted with passion from the freshest local ingredients. Our warm, inviting ambiance is perfect for romantic dinners, family gatherings, or a delightful evening with friends. Join us and discover why we are a celebrated dining destination.
                            </p>


                            <div className="flex flex-wrap gap-3">
                                {["Fine Dining", "Authentic Italian", "Romantic", "Outdoor Seating"].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[#ffe8d6] text-[#ff5e00] text-xs font-semibold rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-gray-400 mt-1" />
                                        <span className="text-sm text-gray-600">123 Culinary Lane, Foodie City, 10101</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock size={18} className="text-gray-400 mt-1" />
                                        <div className="text-sm text-gray-600">
                                            <p><span className="font-semibold text-gray-900">Mon-Fri:</span> 5:00 PM - 10:00 PM</p>
                                            <p><span className="font-semibold text-gray-900">Sat-Sun:</span> 4:00 PM - 11:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone size={18} className="text-gray-400 mt-1" />
                                        <span className="text-sm text-gray-600">(555) 123-4567</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-48 rounded-xl overflow-hidden relative">
                                <img
                                    src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s-l+ff5e00(121.0,14.5)/121.0,14.5,14/600x300?access_token=YOUR_TOKEN_HERE"
                                    alt="Map Location"
                                    className="w-full h-full object-cover bg-gray-100"
                                    onError={(e) => {

                                        e.target.src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
                                    }}
                                />

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ff5e00]">
                                    <MapPin size={32} fill="#ff5e00" stroke="white" />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="lg:w-[400px]">
                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Pre-Order Summary</h2>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#ff5e00] appearance-none"
                                                {...register("date")}
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Party Size</label>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#ff5e00] appearance-none"
                                                {...register("partySize")}
                                            >
                                                <option>2 people</option>
                                                <option>3 people</option>
                                                <option>4 people</option>
                                                <option>5+ people</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-gray-500 mb-2">Time Slot</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map(time => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => setValue("timeSlot", time)}
                                                className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all
                                            ${selectedTimeSlot === time
                                                        ? 'bg-[#ff5e00] border-[#ff5e00] text-white shadow-md shadow-orange-200'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }
                                        `}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>


                                <div className="bg-[#fff9e6] border border-[#ffe082] rounded-lg p-3 flex gap-3 items-start mb-6">
                                    <AlertTriangle size={18} className="text-[#f5ad00] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#b87a00] leading-relaxed font-medium">
                                        You have items in your cart that are not available for the newly selected time slot. Please remove them to continue.
                                    </p>
                                </div>


                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-900 text-sm">Your Order</h3>
                                        <button type="button" onClick={() => setCartItems([])} className="text-xs text-[#ff5e00] font-semibold hover:underline">
                                            Clear all
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-400">${item.price.toFixed(2)}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                                        <button type="button" onClick={() => updateQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#ff5e00]">
                                                            <Minus size={10} />
                                                        </button>
                                                        <span className="text-xs font-bold w-3 text-center">{item.qty}</span>
                                                        <button type="button" onClick={() => updateQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#ff5e00]">
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 w-14 text-right">
                                                        ${(item.price * item.qty).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {cartItems.length === 0 && (
                                            <div className="text-center text-gray-400 text-xs py-4 italic">No items in cart</div>
                                        )}
                                    </div>
                                </div>


                                <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Food Total</span>
                                        <span>${foodTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Taxes & Fees</span>
                                        <span>${taxes.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-200"
                                >
                                    Book & Pre-order Now
                                </button>

                                <p className="text-center text-[10px] text-gray-400 mt-3">You won't be charged yet</p>
                            </form>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default RestaurantDetails;

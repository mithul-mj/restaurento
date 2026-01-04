import React, { useState } from 'react';
import { Search, Bell, Filter, Star, MapPin, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const Home = () => {
    const { register, handleSubmit } = useForm();
    const [activeFilter, setActiveFilter] = useState('Filters');

    const onSearch = (data) => {
        console.log('Search:', data);
    };

    const filters = ["Filters", "Near me", "Open Now", "Rating 4.5+", "Pure Veg"];

    const restaurants = [
        {
            id: 1,
            name: "The Golden Spoon",
            rating: 4.5,
            ratingCount: "1200+",
            cuisine: "Authentic Italian, Outdoor Seating",
            distance: "1.5 km",
            price: "$3/slot",
            image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
            status: "OPEN",
            statusColor: "bg-green-500"
        },
        {
            id: 2,
            name: "The Green Bowl",
            rating: 4.9,
            ratingCount: "800+",
            cuisine: "Salads, Healthy, Vegan",
            distance: "0.8 km",
            price: "$3/slot",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
            status: "OPEN",
            statusColor: "bg-green-500"
        },
        {
            id: 3,
            name: "Morning Glory Cafe",
            rating: 4.5,
            ratingCount: "550+",
            cuisine: "Breakfast, Coffee, American",
            distance: "2.2 km",
            price: "$3/slot",
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
            status: "CLOSED",
            statusColor: "bg-red-500"
        },
        {
            id: 4,
            name: "Sushi Station",
            rating: 4.8,
            ratingCount: "2000+",
            cuisine: "Japanese, Sushi",
            distance: "3.1 km",
            price: "$3/slot",
            image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
            status: "OPEN",
            statusColor: "bg-green-500"
        },
        {
            id: 5,
            name: "Taco Fiesta",
            rating: 4.6,
            ratingCount: "990+",
            cuisine: "Mexican, Tacos",
            distance: "1.8 km",
            price: "$3/slot",
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1980&auto=format&fit=crop",
            status: "OPEN",
            statusColor: "bg-green-500"
        },
        {
            id: 6,
            name: "Burger Barn",
            rating: 4.4,
            ratingCount: "15000+",
            cuisine: "Burgers, American, Fast Food",
            distance: "4.5 km",
            price: "$3/slot",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
            status: "OPEN",
            statusColor: "bg-green-500"
        }
    ];

    return (
        <div className="min-h-screen bg-[#fcfcfc]">

            <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-[#ff5e00] text-white p-1.5 rounded-md flex items-center justify-center">

                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </div>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">Restauranto</span>
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

                    <div className="hidden md:block">
                        <Link to="/signup" className="bg-[#ff5e00] hover:bg-[#e05200] text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-md shadow-orange-100">
                            Sign Up
                        </Link>
                    </div>


                    <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                        <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" className="w-full h-full object-cover" />
                    </div>

                </div>
            </nav>


            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">


                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 group">
                    <img
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
                        alt="Hero Banner"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-10">
                        <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                            50% OFF on Weekend Orders
                        </h2>
                    </div>
                </div>


                <div className="w-full max-w-4xl mx-auto -mt-14 relative z-10 mb-10 px-2">
                    <form onSubmit={handleSubmit(onSearch)} className="relative flex shadow-xl shadow-gray-200/50 rounded-lg overflow-hidden">
                        <div className="bg-white flex-1 flex items-center px-4 py-4">
                            <Search className="text-gray-400 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Search for restaurant, cuisine or a dish..."
                                className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base"
                                {...register("query")}
                            />
                        </div>
                        <button type="submit" className="bg-[#ff9500] hover:bg-[#e08400] text-white px-8 font-semibold transition-colors flex items-center gap-2">
                            <Search size={18} />
                            <span className="hidden md:inline">Search</span>
                        </button>
                    </form>
                </div>


                <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((filter, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                        ${activeFilter === filter
                                    ? 'bg-[#ffe8d6] text-[#ff5e00] border-[#ff5e00]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }
                    `}
                        >
                            {filter === "Filters" && <Filter size={14} className="inline mr-1.5" />}
                            {filter}
                        </button>
                    ))}
                </div>


                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    Restaurants Near You
                </h3>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                    {restaurants.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                            <div className="relative h-48 w-full overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                />
                                <div className={`absolute top-4 right-4 ${item.statusColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
                                    {item.status}
                                </div>
                            </div>


                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold">
                                        <span>{item.rating}</span>
                                        <Star size={10} fill="currentColor" />
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 font-medium mb-3">({item.ratingCount} ratings)</p>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-1">{item.cuisine}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span>{item.distance}</span>
                                    </div>
                                    <div className="font-semibold text-gray-700">
                                        {item.price}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                <div className="flex justify-center items-center gap-2 mt-8">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#ff5e00] hover:border-[#ff5e00] transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff5e00] text-white shadow-md shadow-orange-200">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#ff5e00] hover:border-[#ff5e00] transition-colors">2</button>
                    <button className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#ff5e00] hover:border-[#ff5e00] transition-colors">3</button>
                    <span className="text-gray-400 text-xs">...</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#ff5e00] hover:border-[#ff5e00] transition-colors">10</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#ff5e00] hover:border-[#ff5e00] transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>

            </main>
        </div>
    );
};

export default Home;

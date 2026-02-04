import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Users, CreditCard } from 'lucide-react';
import { TAX_RATE, PLATFORM_FEE_RATE } from '../../utils/constants';

const BookingSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { restaurant, partySize, date, timeSlot, cart, bookingFee, itemTotal, subtotal, tax, platformFee, total } = location.state || {};

    if (!location.state) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No booking details found</h2>
                <Link to="/" className="text-[#ff5e00] hover:underline">Return to Home</Link>
            </div>
        );
    }

    const cartItems = Object.values(cart);

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20">
            <main className="max-w-3xl mx-auto px-4 md:px-8 py-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#ff5e00] mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking Summary</h1>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    {/* Restaurant Header */}
                    <div className="p-6 border-b border-gray-100 bg-orange-50/50">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{restaurant.restaurantName}</h2>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <MapPin size={16} className="text-[#ff5e00]" />
                            <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#ff5e00]">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                                <p className="font-semibold text-gray-900">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#ff5e00]">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Time</p>
                                <p className="font-semibold text-gray-900">{timeSlot}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#ff5e00]">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Guests</p>
                                <p className="font-semibold text-gray-900">{partySize} People</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Pre-ordered Items</h3>
                        {cartItems.length > 0 ? (
                            <div className="space-y-3">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#ff5e00]">{item.qty}x</span>
                                            <span className="text-gray-800">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">No items pre-ordered.</p>
                        )}
                    </div>

                    {/* Bill Details */}
                    <div className="p-6 bg-gray-50">
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex justify-between">
                                <span>Booking Fee</span>
                                <span>${bookingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Food Total</span>
                                <span>${itemTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee ({(PLATFORM_FEE_RATE * 100).toFixed(0)}%)</span>
                                <span>${platformFee.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                            <span className="text-2xl font-black text-[#ff5e00]">${total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => navigate(-1)} className="py-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button className="py-4 rounded-xl bg-[#ff5e00] text-white font-bold shadow-lg shadow-orange-200 hover:bg-[#e05200] transition-colors flex items-center justify-center gap-2">
                        <CreditCard size={20} />
                        Proceed to Payment
                    </button>
                </div>
            </main>
        </div>
    );
};

export default BookingSummary;

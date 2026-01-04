import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Bell, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditProfile = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            fullName: "Rishi Sharma",
            phone: "+91 98765 43210",
            email: "rishi.sharma@example.com"
        }
    });

    const onSubmit = (data) => {
        console.log("Updated Profile:", data);

    };

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
                    <Link to="/" className="text-gray-500 hover:text-[#ff5e00] transition-colors">Explore</Link>
                    <Link to="/bookings" className="text-gray-500 hover:text-[#ff5e00] transition-colors">My Bookings</Link>
                    <Link to="/profile" className="text-gray-900 font-medium hover:text-[#ff5e00] transition-colors">Profile</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative text-gray-500 hover:text-gray-700">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <Link to="/profile" className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                        <img src="https://ui-avatars.com/api/?name=Rishi+Sharma&background=random" alt="Profile" className="w-full h-full object-cover" />
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center md:text-left">Edit Profile</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#fff0e3]">
                                <img
                                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button type="button" className="absolute bottom-0 right-0 p-2 bg-[#ff5e00] text-white rounded-full hover:bg-[#e05200] border-4 border-white transition-colors shadow-sm">
                                <Camera size={18} />
                            </button>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-[#ff5e00] focus:bg-white transition-colors"
                                    {...register("fullName", { required: "Name is required" })}
                                />
                                {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-[#ff5e00] focus:bg-white transition-colors"
                                    {...register("phone", { required: "Phone is required" })}
                                />
                                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                disabled
                                className="w-full px-4 py-3 bg-gray-200 border border-transparent rounded-lg text-sm font-bold text-gray-500 cursor-not-allowed"
                                {...register("email")}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="text-[#ff5e00] bg-[#fff5eb] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#ffe0cc] transition-colors">
                                Change Password
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gray-300 hover:bg-[#ff5e00] text-gray-700 hover:text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default EditProfile;

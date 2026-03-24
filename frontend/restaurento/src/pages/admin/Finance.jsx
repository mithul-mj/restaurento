import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ArrowUpRight, ArrowDownRight, DollarSign, PieChart, Activity, Calendar, X } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import useDebounce from '../../hooks/useDebounce';
import dayjs from 'dayjs';
import TransactionDetailsModal from '../../components/admin/modals/TransactionDetailsModal';

const AdminFinance = () => {

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [date, setDate] = useState('all');
    const debouncedSearch = useDebounce(search, 500);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);



    const { stats, transactions, meta, isLoading } = usePayments({
        page,
        limit: 10,
        search: debouncedSearch,
        date
    });

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, date]);


    const StatCard = ({ title, value, growth, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-gray-50 text-gray-400">
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                    {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
                </h3>
                <p className={`text-sm font-bold flex items-center gap-1 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {growth > 0 ? `+${growth}%` : `${growth}%`}
                    <span className="text-gray-400 font-medium ml-1">vs last month</span>
                </p>
            </div>
        </div>
    );


    return (
        <div className="max-w-[1600px] mx-auto transition-all duration-300">

            {/* Header */}
            <div className="mb-6 md:mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Payments & Revenue</h1>
                <p className="text-gray-500 text-base md:text-lg font-medium opacity-80">Monitor and manage the platform's financial performance.</p>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">

                <StatCard
                    title="Commission Earnings"
                    value={stats.commissionEarnings || 0}
                    growth={stats.commissionGrowth || 0}
                    icon={DollarSign}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={stats.monthlyRevenue || 0}
                    growth={stats.revenueGrowth || 0}
                    icon={PieChart}
                />
                <StatCard
                    title="Total Transactions"
                    value={stats.totalTransactions || 0}
                    growth={stats.transactionGrowth || 0}
                    icon={Activity}
                />
            </div>
            {/* Filter Bar Standardized */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5e00] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by restaurant name, ID etc."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff5e00] focus:bg-white transition-all outline-none"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all font-bold"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
                    <div className="relative">
                        <select
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap pr-8 cursor-pointer focus:outline-none focus:border-[#ff5e00]"
                        >
                            <option value="all">Date: All</option>
                            <option value="today">Today</option>
                            <option value="thisMonth">This Month</option>
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Transaction Card List */}
            <div className="space-y-4 mb-8">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-50 rounded w-24"></div>
                                    <div className="h-3 bg-gray-50 rounded w-32"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Left: Info */}
                            <div className="flex items-center gap-4 w-full md:col-span-5">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <DollarSign size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">#{tx.transactionId?.slice(-8).toUpperCase()}</h4>
                                    <p className="text-sm font-bold text-gray-900 truncate">{tx.restaurant}</p>
                                    <p className="text-[11px] text-gray-500 font-medium">{dayjs(tx.date).format('DD MMM YYYY, hh:mm A')}</p>
                                </div>
                            </div>

                            {/* Middle: Monetary */}
                            <div className="hidden md:flex items-center md:col-span-4 gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Total</span>
                                    <span className="text-sm font-bold text-gray-900 tracking-tight">₹{tx.orderTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-semibold text-[#ff5e00]/70 uppercase tracking-widest mb-0.5">Comm.</span>
                                    <span className="text-sm font-bold text-[#ff5e00] tracking-tight">₹{tx.commissionEarned.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Right Status & Action */}
                            <div className="w-full md:col-span-3 flex items-center justify-between md:justify-end gap-3">
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${tx.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {tx.paymentStatus}
                                </span>
                                <button 
                                    onClick={() => { setSelectedTxId(tx.id); setIsModalOpen(true); }}
                                    className="p-2 bg-gray-50 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                        <Activity size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">No Transactions Found</h3>
                        <p className="text-gray-500 text-sm">No payment data matches your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination Standardized */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-100">
                <div className="text-xs md:text-sm font-medium text-gray-500 order-2 sm:order-1">
                    Showing <span className="font-bold text-gray-900">{Math.min((page - 1) * 10 + 1, meta.totalCount || 0)}</span>–{' '}
                    <span className="font-bold text-gray-900">{Math.min(page * 10, meta.totalCount || 0)}</span> of {' '}
                    <span className="font-bold text-gray-900">{meta.totalCount || 0}</span> results
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all font-bold text-sm">
                        Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-3">Page {page} of {meta.totalPages || 1}</span>
                    <button
                        onClick={() => setPage(p => Math.min(meta.totalPages || 1, p + 1))}
                        disabled={page >= (meta.totalPages || 1)}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all font-bold text-sm">
                        Next
                    </button>
                </div>
            </div>

            <TransactionDetailsModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTxId(null); }}
                transactionId={selectedTxId}
            />
        </div>

    );
};

export default AdminFinance;


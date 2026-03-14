import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWalletHistory } from "../../hooks/useWalletHistory";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import userService from "../../services/user.service";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MyWallet = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [direction, setDirection] = useState(1);
    const limit = 3;
    const [walletBalance, setWalletBalance] = useState(0);

    const { data: responseData, isLoading, isError } = useWalletHistory({ page, limit })


    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await userService.getWalletBalance();
                if (response.success) {
                    setWalletBalance(response.walletBalance || 0);
                }
            } catch (err) {
                console.error("Failed to fetch balance", err);
            }
        };
        fetchBalance();
    }, []);

    const transactions = responseData?.transactions || [];
    const pagination = responseData?.pagination || { totalPages: 1, currentPage: 1 };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage)
        }
    }

    const formatTxDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    if (isError) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500">Could not load wallet history. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f8f8] font-sans pb-16">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                <div className="flex items-center gap-4 mb-8 md:mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 hover:bg-white rounded-full transition-all text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm md:shadow-none"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 tracking-tight">
                            My Wallet
                        </h1>
                        <p className="text-gray-500 text-[14px] md:text-[15px] font-medium">
                            Track your refunds and transaction history
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-10"
                >


                    <div className="bg-gray-50 rounded-3xl py-10 md:py-12 text-center mb-10 md:mb-12 border border-gray-50">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Balance</p>
                        <h2 className="text-6xl md:text-[80px] leading-none font-bold text-gray-900">
                            <span className="text-[40px] md:text-[50px] font-bold text-[#ff5e00] mr-1">₹</span>
                            {walletBalance.toFixed(0)}
                        </h2>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 border-b border-gray-100 pb-4">Transaction History</h3>


                    <div className="space-y-4 md:space-y-2">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (

                                [...Array(limit)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between py-5 animate-pulse">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                                            <div className="space-y-2 w-full max-w-[200px]">
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                        <div className="h-6 w-16 bg-gray-200 rounded shrink-0"></div>
                                    </div>
                                ))
                            ) : transactions.length === 0 ? (

                                <div className="text-center py-16 px-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <ArrowDown className="text-gray-300 w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Transactions Yet</h3>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto">When you receive refunds or pay using your wallet, they will appear here.</p>
                                </div>
                            ) : (

                                transactions.map((tx) => {
                                    const isCredit = tx.amount > 0;
                                    return (
                                        <motion.div
                                            key={tx._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            layout
                                            className="group relative flex items-center justify-between py-4 md:py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-all px-3 md:px-4 -mx-3 md:-mx-4 rounded-xl cursor-default"
                                        >
                                            <div className="flex items-center gap-4">

                                                <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${isCredit ? 'bg-green-50 text-green-600 border border-green-100/50' : 'bg-red-50 text-red-500 border border-red-100/50'}`}>
                                                    {isCredit ? <ArrowUp size={22} className="stroke-[2.5]" /> : <ArrowDown size={22} className="stroke-[2.5]" />}
                                                </div>


                                                <div className="pr-4">
                                                    <p className="font-bold text-gray-900 text-[14px] md:text-[16px] leading-tight mb-1.5 md:mb-1 group-hover:text-[#ff5e00] transition-colors line-clamp-2 md:line-clamp-1">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-[12px] md:text-[13px] font-medium text-gray-500">
                                                        {formatTxDate(tx.createdAt)}
                                                    </p>
                                                </div>
                                            </div>


                                            <p className={`font-bold text-lg md:text-xl shrink-0 ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                                                {isCredit ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(0)}
                                            </p>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>


                    {pagination.totalPages > 1 && !isLoading && (
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">

                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                <span>Page</span>
                                <div className="relative w-6 h-5 overflow-hidden">
                                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                        <motion.div
                                            key={pagination.currentPage}
                                            custom={direction}
                                            initial={(dir) => ({ y: dir * 15, opacity: 0 })}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={(dir) => ({ y: dir * -15, opacity: 0 })}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <span className="text-gray-900 font-bold tabular-nums">
                                                {pagination.currentPage}
                                            </span>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <span>of {pagination.totalPages}</span>
                            </div>


                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setDirection(-1);
                                        handlePageChange(pagination.currentPage - 1);
                                    }}
                                    disabled={!pagination.hasPrevPage}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#ff5e00] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={18} className="stroke-[2.5]" />
                                </button>
                                <button
                                    onClick={() => {
                                        setDirection(1);
                                        handlePageChange(pagination.currentPage + 1);
                                    }}
                                    disabled={!pagination.hasNextPage}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#ff5e00] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight size={18} className="stroke-[2.5]" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default MyWallet;

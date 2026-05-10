import { useState, useEffect } from "react";
import { useWalletHistory } from "../../hooks/useWalletHistory";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, AlertCircle, Wallet } from 'lucide-react';
import userService from "../../services/user.service";
import { motion, AnimatePresence } from "framer-motion";

const MyWallet = () => {
    const [page, setPage] = useState(1);
    const [direction, setDirection] = useState(1);
    const limit = 6;
    const [walletBalance, setWalletBalance] = useState(null);

    const { data: responseData, isLoading, isError } = useWalletHistory({ page, limit });

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
            setPage(newPage);
        }
    };

    const formatTxDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    if (isError) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Something went wrong</h2>
                    <p className="text-sm text-gray-500">Could not load wallet. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#fcfcfc] pb-32">
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">

                {/* Page Title */}
                <h1 className="text-lg font-semibold text-gray-900 mb-8">My Wallet</h1>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full -mr-20 -mt-20 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[#ff5e00] mb-4">
                            <Wallet size={18} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Available Balance</span>
                        </div>
                        {walletBalance === null ? (
                            <div className="h-12 w-36 bg-gray-100 rounded-xl animate-pulse mb-2" />
                        ) : (
                            <motion.div
                                key={walletBalance}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl font-bold text-gray-900 tracking-tight"
                            >
                                ₹{walletBalance.toFixed(0)}
                            </motion.div>
                        )}
                        <p className="text-xs text-gray-400 mt-2 font-medium">Refunds are automatically credited here</p>
                    </div>
                </motion.div>

                {/* Transactions Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                        Transaction History
                    </h2>

                    <div className="space-y-1">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                [...Array(limit)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between py-4 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-gray-100 rounded-full shrink-0" />
                                            <div className="space-y-2">
                                                <div className="h-3.5 bg-gray-100 rounded w-44" />
                                                <div className="h-3 bg-gray-100 rounded w-28" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-14 bg-gray-100 rounded" />
                                    </div>
                                ))
                            ) : transactions.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16 px-4"
                                >
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <Wallet className="text-gray-300 w-7 h-7" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">No Transactions Yet</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                        When you receive refunds or pay using your wallet, they will appear here.
                                    </p>
                                </motion.div>
                            ) : (
                                transactions.map((tx) => {
                                    const isCredit = tx.amount > 0;
                                    return (
                                        <motion.div
                                            key={tx._id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            layout
                                            className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                                    {isCredit
                                                        ? <ArrowDown size={18} strokeWidth={2.5} />
                                                        : <ArrowUp size={18} strokeWidth={2.5} />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1 leading-tight mb-1">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {formatTxDate(tx.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className={`text-base font-bold shrink-0 ml-4 ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                                                {isCredit ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(0)}
                                            </p>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && !isLoading && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setDirection(-1); handlePageChange(pagination.currentPage - 1); }}
                                    disabled={!pagination.hasPrevPage}
                                    className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#ff5e00] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={18} strokeWidth={2} />
                                </button>
                                <button
                                    onClick={() => { setDirection(1); handlePageChange(pagination.currentPage + 1); }}
                                    disabled={!pagination.hasNextPage}
                                    className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#ff5e00] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight size={18} strokeWidth={2} />
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

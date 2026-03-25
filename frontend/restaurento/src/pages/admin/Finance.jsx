import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ArrowUpRight, ArrowDownRight, DollarSign, PieChart, Activity, Calendar, X } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import useDebounce from '../../hooks/useDebounce';
import dayjs from 'dayjs';
import TransactionDetailsModal from '../../components/admin/modals/TransactionDetailsModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

const AdminFinance = () => {

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [date, setDate] = useState('all');
    const [status, setStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);



    const { stats, transactions, meta, isLoading } = usePayments({
        page,
        limit: 3,
        search: debouncedSearch,
        date,
        status,
        startDate,
        endDate
    });

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, date, status, startDate, endDate]);


    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(255, 94, 0); // Primary Brand Color
        doc.text("Financial Report - Restaurento", 14, 22);

        // Add Executive Summary Section
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Executive Summary", 14, 35);

        autoTable(doc, {
            startY: 40,
            body: [
                ["Commission Earnings:", `INR ${stats.commissionEarnings?.toLocaleString() || 0}`],
                ["Monthly Revenue:", `INR ${stats.monthlyRevenue?.toLocaleString() || 0}`],
                ["Total Transactions:", stats.totalTransactions?.toString() || "0"]
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2, textColor: [60, 60, 60] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });

        const finalY = doc.lastAutoTable.finalY || 60;

        // Add Date & Filter details
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, hh:mm A')}`, 14, finalY + 10);
        doc.text(`Date Filter: ${date.charAt(0).toUpperCase() + date.slice(1)}`, 14, finalY + 15);
        doc.text(`Status Filter: ${status.charAt(0).toUpperCase() + status.slice(1)}`, 14, finalY + 20);

        // Define main table columns
        const tableColumn = ["Date", "Transaction ID", "Restaurant", "Total Amount", "Commission", "Status"];
        const tableRows = transactions.map(tx => [
            dayjs(tx.date).format('DD/MM/YYYY'),
            tx.transactionId?.toUpperCase() || 'N/A',
            tx.restaurant,
            `INR ${tx.orderTotal.toLocaleString()}`,
            `INR ${tx.commissionEarned.toLocaleString()}`,
            tx.paymentStatus.toUpperCase()
        ]);

        // Generate Transaction Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: finalY + 30,
            theme: 'grid',
            headStyles: { fillColor: [255, 94, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        doc.save(`Restaurento_Finance_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
    };

    const handleExportExcel = () => {
        // 1. Prepare Financial Summary sheet data
        const summaryData = [
            { "Metric": "Commission Earnings", "Value": stats.commissionEarnings || 0, "Unit": "INR" },
            { "Metric": "Monthly Revenue", "Value": stats.monthlyRevenue || 0, "Unit": "INR" },
            { "Metric": "Total Transactions", "Value": stats.totalTransactions || 0, "Unit": "Count" },
            { "Metric": "Report Generated", "Value": dayjs().format('DD MMM YYYY, hh:mm A'), "Unit": "-" },
            { "Metric": "Date Filter", "Value": date, "Unit": "-" },
            { "Metric": "Status Filter", "Value": status, "Unit": "-" }
        ];

        // 2. Prepare Transaction Details sheet data
        const txData = transactions.map(tx => ({
            "Date": dayjs(tx.date).format('DD MMM YYYY, hh:mm A'),
            "Transaction ID": tx.transactionId?.toUpperCase() || 'N/A',
            "Restaurant": tx.restaurant,
            "Order Total (INR)": tx.orderTotal,
            "Commission Earned (INR)": tx.commissionEarned,
            "Payment Status": tx.paymentStatus.toUpperCase()
        }));

        const wb = XLSX.utils.book_new();

        // Add Summary Sheet
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Financial Summary");

        // Add Transaction Sheet
        const wsTransactions = XLSX.utils.json_to_sheet(txData);
        XLSX.utils.book_append_sheet(wb, wsTransactions, "Transaction Details");

        // Set column widths for better readability
        wsTransactions['!cols'] = [
            { wch: 25 }, // Date
            { wch: 20 }, // Tx ID
            { wch: 30 }, // Restaurant
            { wch: 18 }, // Total
            { wch: 18 }, // Commission
            { wch: 15 }  // Status
        ];

        wsSummary['!cols'] = [
            { wch: 25 }, // Metric
            { wch: 25 }, // Value
            { wch: 10 }  // Unit
        ];

        XLSX.writeFile(wb, `Restaurento_Finance_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    };


    const StatCard = ({ title, value, growth, icon: Icon, isCurrency = true }) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-gray-50 text-gray-400">
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                    {typeof value === 'number' ? (isCurrency ? `₹${value.toLocaleString()}` : value.toLocaleString()) : value}
                </h3>
                {date !== 'custom' && (
                    <p className={`text-sm font-bold flex items-center gap-1 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {growth > 0 ? `+${growth}%` : `${growth}%`}
                        <span className="text-gray-400 font-medium ml-1">{stats.growthLabel || "vs last month"}</span>
                    </p>
                )}
            </div>
        </div>
    );


    return (
        <div className="max-w-[1600px] mx-auto transition-all duration-300">            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Payments & Revenue</h1>
                    <p className="text-gray-500 font-medium md:text-lg opacity-80 italic">Global platform financial intelligence for {date === 'all' ? 'All Time' : date === 'thisWeek' ? 'the last 7 days' : date === 'thisMonth' ? 'this Month' : date === 'thisYear' ? 'this Year' : 'the selected period'}.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="relative group">
                        <div className="flex items-center gap-8 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all group-hover:border-gray-300">
                            <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                                Timeframe: <span className="text-[#ff5e00] ml-0.5">{date === 'all' ? 'All' : date === 'thisWeek' ? 'Weekly' : date === 'thisMonth' ? 'Monthly' : date === 'thisYear' ? 'Yearly' : 'Custom'}</span>
                            </span>
                            <Calendar size={20} className="text-[#ff5e00]" />
                        </div>
                        <select
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="all">All</option>
                            <option value="thisWeek">Weekly</option>
                            <option value="thisMonth">Monthly</option>
                            <option value="thisYear">Yearly</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {date === 'custom' && (
                        <div className="flex gap-2 items-center bg-gray-50/50 p-1 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-left-4 duration-300 shadow-sm">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#ff5e00] shadow-inner"
                            />
                            <span className="text-gray-400 font-black text-[10px] uppercase">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#ff5e00] shadow-inner"
                            />
                        </div>
                    )}
                </div>
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
                    title="Revenue"
                    value={stats.monthlyRevenue || 0}
                    growth={stats.revenueGrowth || 0}
                    icon={PieChart}
                />
                <StatCard
                    title="Transactions"
                    value={stats.totalTransactions || 0}
                    growth={stats.transactionGrowth || 0}
                    icon={Activity}
                    isCurrency={false}
                />
            </div>
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
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap pr-8 cursor-pointer focus:outline-none focus:border-[#ff5e00]"
                        >
                            <option value="all">Status: All</option>
                            <option value="paid">Paid</option>
                            <option value="refund">Refund</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {date === 'custom' && (
                        <div className="flex gap-2 items-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-4 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-[#ff5e00] transition-colors"
                                />
                            </div>
                            <span className="text-gray-400 text-sm font-bold">to</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-4 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-[#ff5e00] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div className="h-10 w-px bg-gray-200 mx-1 hidden md:block"></div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleExportPDF}
                            disabled={transactions.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Export to PDF"
                        >
                            <FileText size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={transactions.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-green-600 hover:border-green-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Export to Excel"
                        >
                            <FileSpreadsheet size={18} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
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
                    Showing <span className="font-bold text-gray-900">{Math.min((page - 1) * (meta.perPage || 3) + 1, meta.totalCount || 0)}</span>–{' '}
                    <span className="font-bold text-gray-900">{Math.min(page * (meta.perPage || 3), meta.totalCount || 0)}</span> of {' '}
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


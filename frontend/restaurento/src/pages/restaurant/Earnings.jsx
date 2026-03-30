import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    CalendarCheck,
    WalletIcon as Wallet,
    Calendar,
    Filter,
    X,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useEarnings } from '../../hooks/useEarnings';
import useDebounce from '../../hooks/useDebounce';
import PageLoader from "../../components/PageLoader";

const Earnings = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [date, setDate] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const {
        earnings,
        trend,
        transactions,
        pagination,
        isLoading
    } = useEarnings({
        page,
        limit: 3,
        status,
        search: debouncedSearch,
        date,
        startDate,
        endDate
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status, date, startDate, endDate]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(255, 94, 0);
        doc.text("Earnings Report - Restaurento", 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Business Summary", 14, 35);

        autoTable(doc, {
            startY: 40,
            body: [
                ["Total Earnings:", `Rs. ${(earnings.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                ["Successful Bookings:", earnings.successfulBookings?.toString() || "0"],
                ["Net Payout:", `Rs. ${(earnings.netPayout || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2, textColor: [60, 60, 60] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });

        const finalY = doc.lastAutoTable.finalY || 60;

        const dateLabel = date === 'thisWeek' ? 'This Week' :
            date === 'thisMonth' ? 'This Month' :
                date === 'thisYear' ? 'This Year' :
                    date === 'custom' ? `Custom (${startDate} to ${endDate})` : 'All Time';

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, hh:mm A')}`, 14, finalY + 10);
        doc.text(`Filter Applied: Status=${status.toUpperCase()}, View=${dateLabel}`, 14, finalY + 15);

        const tableColumn = ["Order ID", "Date", "Customer", "Amount", "Fees", "Net", "Status"];
        const tableRows = transactions.map(tx => [
            tx.orderId,
            dayjs(tx.date).format('DD/MM/YYYY'),
            String(tx.customer),
            `${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`,
            `${tx.fees.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`,
            `${tx.netEarning.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR`,
            tx.status.toUpperCase()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: finalY + 25,
            theme: 'grid',
            headStyles: { fillColor: [255, 94, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3 },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        doc.save(`Restaurento_Earnings_${dayjs().format('YYYY-MM-DD')}.pdf`);
    };

    const handleExportExcel = () => {
        const dateLabel = date === 'thisWeek' ? 'This Week' :
            date === 'thisMonth' ? 'This Month' :
                date === 'thisYear' ? 'This Year' :
                    date === 'custom' ? `${startDate} to ${endDate}` : 'All Time';

        const summaryData = [
            { "Metric": "Report Type", "Value": "Earnings Report" },
            { "Metric": "Timeframe", "Value": dateLabel },
            { "Metric": "Status Filter", "Value": status.toUpperCase() },
            { "Metric": "Total Earnings", "Value": earnings.totalEarnings || 0 },
            { "Metric": "Successful Bookings", "Value": earnings.successfulBookings || 0 },
            { "Metric": "Net Payout", "Value": earnings.netPayout || 0 },
            { "Metric": "Generated On", "Value": dayjs().format('DD MMM YYYY, hh:mm A') }
        ];

        const txData = transactions.map(tx => ({
            "Order ID": tx.orderId,
            "Date": dayjs(tx.date).format('DD MMM YYYY'),
            "Customer": tx.customer,
            "Amount (INR)": tx.amount,
            "Fees (INR)": tx.fees,
            "Net Earning (INR)": tx.netEarning,
            "Status": tx.status
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txData), "Transactions");
        XLSX.writeFile(wb, `Restaurento_Earnings_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    if (isLoading && page === 1) return <PageLoader />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Earnings Dashboard</h2>
                    <p className="text-gray-500 mt-1 font-medium">Keep track of your restaurant's revenue and payouts.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-48">
                        <select
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full appearance-none flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#ff5e00]/30 transition-all pr-10 cursor-pointer focus:outline-none shadow-sm"
                        >
                            <option value="all">Timeframe: All</option>
                            <option value="thisWeek">This Week</option>
                            <option value="thisMonth">This Month</option>
                            <option value="thisYear">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff5e00]" size={16} />
                    </div>

                    {date === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#ff5e00]/10 focus:border-[#ff5e00] outline-none shadow-sm"
                            />
                            <span className="text-gray-300">/</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#ff5e00]/10 focus:border-[#ff5e00] outline-none shadow-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Earnings"
                    value={formatCurrency(earnings.totalEarnings || 0)}
                    subtext={date === 'all' ? "Overall restaurant revenue" : `Revenue for ${date.replace('this', 'this ').toLowerCase()}`}
                    icon={<TrendingUp className="text-green-500" size={20} />}
                />
                <StatsCard
                    title="Successful Bookings"
                    value={earnings.successfulBookings || 0}
                    subtext={date === 'all' ? "Completed & Confirmed" : `Bookings for ${date.replace('this', 'this ').toLowerCase()}`}
                    icon={<CalendarCheck className="text-blue-500" size={20} />}
                />
                <StatsCard
                    title="Net Payout"
                    value={formatCurrency(earnings.netPayout || 0)}
                    subtext={date === 'all' ? "Earnings after fees" : `Net for ${date.replace('this', 'this ').toLowerCase()}`}
                    icon={<Wallet className="text-orange-500" size={20} />}
                />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Revenue Trend</h3>
                    <p className="text-xs text-gray-400 capitalize">
                        {date === 'all' || date === 'thisYear' ? 'Monthly' : date === 'thisMonth' ? 'Daily' : date === 'thisWeek' ? 'Weekly' : 'Custom'} distribution of successful bookings
                    </p>
                </div>
                <div className="h-80 w-full pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff5e00" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#ff5e00" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickFormatter={(val) => `₹${val}`}
                                width={60}
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="earnings"
                                stroke="#ff5e00"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorEarnings)"
                                connectNulls={true}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#ff5e00' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-50">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Transaction History</h3>
                            <p className="text-xs text-gray-400 mt-1">Audit every individual payout and order detail from this period.</p>
                        </div>

                        <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full lg:w-auto items-center">
                            <div className="relative flex-1 lg:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5e00] transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search order or customer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff5e00]/10 focus:border-[#ff5e00] focus:bg-white transition-all outline-none"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="appearance-none flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-all pr-10 cursor-pointer focus:outline-none shadow-sm"
                                    >
                                        <option value="all">Status: All</option>
                                        <option value="paid">Paid</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>

                                <div className="hidden lg:block h-10 w-px bg-gray-200 mx-2"></div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleExportPDF}
                                        disabled={transactions.length === 0}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        <FileText className="text-gray-400" size={18} />
                                        <span className="text-sm font-medium">PDF</span>
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        disabled={transactions.length === 0}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        <FileSpreadsheet className="text-gray-400" size={18} />
                                        <span className="text-sm font-medium">Excel</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Fees</th>
                                <th className="px-6 py-4 font-semibold">Net Earning</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{tx.orderId}</td>
                                        <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{tx.customer}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">₹{tx.amount}</td>
                                        <td className="px-6 py-4 text-gray-400">-₹{tx.fees}</td>
                                        <td className="px-6 py-4 font-bold text-[#ff5e00]">₹{tx.netEarning}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
                        <span className="text-xs text-gray-400 font-medium">
                            Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                                title="Previous"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-bold text-gray-700 px-3">Page {page} of {pagination.pages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                                title="Next"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, subtext, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#ff5e00]/30 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-[#fff5eb] group-hover:text-[#ff5e00] transition-colors">
                {icon}
            </div>
        </div>
        <div className="flex items-center gap-1">
            <p className="text-xs text-gray-400 font-medium">{subtext}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Paid: 'bg-green-50 text-green-600 border-green-100',
        Canceled: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
            {status}
        </span>
    );
};

export default Earnings;

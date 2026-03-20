import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCoupons } from "../../hooks/useCoupons";
import { 
    ChevronLeft, Edit, Trash2, Tag, Info, 
    Calendar, Clock, CheckCircle, AlertCircle, 
    ArrowRight, DollarSign, Users, BarChart3,
    Copy, ChevronRight
} from "lucide-react";
import couponService from "../../services/coupon.service";
import PageLoader from "../../components/PageLoader";
import { showToast, showError, showConfirm } from "../../utils/alert";
import CreateCouponModal from "../../components/admin/modals/CreateCouponModal";

const CouponDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { deleteCoupon, isDeleting, updateCoupon, isUpdating } = useCoupons();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["coupon", id],
        queryFn: () => couponService.getCouponById(id)
    });

    if (isLoading) return <PageLoader />;
    if (error) return <div className="p-10 text-center text-red-500 font-bold">Error loading coupon details: {error.message}</div>;

    const coupon = data?.data;
    if (!coupon) return <div className="p-10 text-center font-bold text-gray-800">Coupon not found</div>;

    const isActive = coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date());
    const usagePercent = coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0;

    const formattedExpiryDate = coupon.expiryDate 
        ? new Date(coupon.expiryDate).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : "Lifetime";

    const formattedCreatedDate = new Date(coupon.createdAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const daysLeft = coupon.expiryDate 
        ? Math.max(0, Math.ceil((new Date(coupon.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))
        : null;

    const handleDelete = async () => {
        const result = await showConfirm(
            "Delete Coupon?",
            `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
            "Yes, Delete it"
        );

        if (result.isConfirmed) {
            deleteCoupon(id, {
                onSuccess: () => navigate("/admin/coupons")
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] p-4 lg:p-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 px-1">
                <span className="cursor-pointer hover:text-[#ff5e00] transition-colors" onClick={() => navigate("/admin/dashboard")}>Dashboard</span>
                <ChevronRight size={14} />
                <span className="cursor-pointer hover:text-[#ff5e00] transition-colors" onClick={() => navigate("/admin/coupons")}>Coupons</span>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium">{coupon.code}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-1">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/admin/coupons")}
                        className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{coupon.code}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {isActive ? 'Active' : 'Expired/Inactive'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Created on {formattedCreatedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Edit size={16} />
                        Edit Coupon
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-6 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-all shadow-sm disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Discount Value Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
                        <div className="z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Discount Value</p>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-5xl font-bold text-gray-900 tracking-tight">{coupon.discountValue}% OFF</h2>
                                <span className="text-lg text-gray-400 font-medium">Percentage</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-3 font-medium">Applied to subtotal before tax and fees</p>
                        </div>
                        <div className="z-10 mt-6 md:mt-0 bg-gray-50 border border-gray-100 rounded-xl p-5 min-w-[200px] transition-all hover:border-orange-200 shadow-inner">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code</p>
                            <p className="text-xl font-bold text-[#ff5e00] tracking-widest">{coupon.code}</p>
                        </div>
                    </div>

                    {/* Conditions Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5e00] flex items-center justify-center">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Conditions & Rules</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Minimum Order Value</p>
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">₹{coupon.minOrderValue.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">Cart value must meet this to apply</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Usage Limit</p>
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">{coupon.usageLimit ? `${coupon.usageLimit.toLocaleString()} Total Uses` : 'Unlimited Uses'}</p>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">Total global redemptions allowed</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Max Discount Cap</p>
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">{coupon.maxDiscountCap ? `₹${coupon.maxDiscountCap.toLocaleString()}` : 'No Limit'}</p>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">Maximum savings per transaction</p>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5e00] flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Description & Terms</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium mb-8">
                            {coupon.description || `Get ${coupon.discountValue}% off your entire order up to ₹${coupon.maxDiscountCap || 'unlimited'}. This coupon is automatically applied during checkout for eligible restaurant bookings.`}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ul className="space-y-4 text-gray-600 font-medium text-sm">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#ff5e00] mt-1.5 flex-shrink-0"></div>
                                    <span>Minimum order value of ₹{coupon.minOrderValue} required.</span>
                                </li>
                                {coupon.maxDiscountCap && (
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#ff5e00] mt-1.5 flex-shrink-0"></div>
                                        <span>Discount capped at ₹{coupon.maxDiscountCap} per booking.</span>
                                    </li>
                                )}
                            </ul>
                            <ul className="space-y-4 text-gray-600 font-medium text-sm">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#ff5e00] mt-1.5 flex-shrink-0"></div>
                                    <span>Valid for all participating restaurants.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#ff5e00] mt-1.5 flex-shrink-0"></div>
                                    <span>Cannot be clubbed with other offers.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Meta */}
                <div className="space-y-6">
                    {/* Promo Section */}
                    <div className={`bg-gradient-to-br ${isActive ? 'from-[#ff5e00] to-[#ff8c42] shadow-orange-100' : 'from-gray-500 to-gray-600 shadow-gray-200'} rounded-2xl p-8 shadow-lg overflow-hidden relative group`}>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl border border-white/20">
                                <Tag size={28} />
                            </div>
                            <h4 className="text-white font-bold text-2xl mb-2 tracking-tight">
                                {isActive ? 'Active Promotion' : 'Expired / Inactive'}
                            </h4>
                            <p className="text-white/90 text-sm font-medium leading-relaxed">
                                {isActive 
                                    ? 'This coupon is currently live and generating savings for your users.' 
                                    : 'This promotion has concluded or been deactivated. It is no longer redeemable by users.'}
                            </p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full"></div>
                        <div className="absolute -left-10 -top-10 w-24 h-24 bg-black/5 rounded-full"></div>
                    </div>

                    {/* Usage Stats Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5e00] flex items-center justify-center">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Usage Analytics</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-sm font-bold text-gray-500">Global Redemptions</p>
                                    <p className="text-sm font-bold text-gray-900">{coupon.usageCount.toLocaleString()} / {coupon.usageLimit ? coupon.usageLimit.toLocaleString() : '∞'}</p>
                                </div>
                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, usagePercent)}%` }}
                                        className="h-full bg-[#ff5e00] rounded-full shadow-sm"
                                    ></motion.div>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Capacity Used</p>
                                    <p className="text-sm font-bold text-[#ff5e00]">{Math.round(usagePercent)}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Savings</p>
                                    <p className="text-xl font-bold text-gray-900 tracking-tight">₹{coupon.stats?.totalRedeemedValue?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Avg Order</p>
                                    <p className="text-xl font-bold text-gray-900 tracking-tight">₹{coupon.stats?.avgOrderSize?.toFixed(0) || '0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validity Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                         <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5e00] flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Validity Period</h3>
                        </div>

                        <div className="relative pl-8 space-y-12">
                            {/* Vertical Line */}
                            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-100"></div>

                            {/* Expiry Node */}
                            <div className="relative">
                                <div className="absolute -left-[32px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-[#ff5e00] outline outline-1 outline-[#ff5e00]/20 z-10 shadow-sm"></div>
                                <p className="text-[10px] font-bold text-[#ff5e00] uppercase tracking-widest mb-1.5">Expires On</p>
                                <p className="text-lg font-bold text-gray-900 leading-tight">{formattedExpiryDate}</p>
                                {daysLeft !== null && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 rounded-lg text-xs font-bold text-[#ff5e00] mt-4 border border-orange-100/50">
                                        <Clock size={12} strokeWidth={2.5} />
                                        {daysLeft} days remaining
                                    </div>
                                )}
                            </div>

                            {/* Creation Node */}
                            <div className="relative">
                                <div className="absolute -left-[32px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-gray-300 outline outline-1 outline-gray-200 z-10 shadow-sm"></div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Created Date</p>
                                <p className="text-lg font-bold text-gray-900 leading-tight">{formattedCreatedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CreateCouponModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={coupon}
                isCreating={isUpdating}
                onCreate={(formData) => {
                    updateCoupon(
                        { id: coupon._id, couponData: formData },
                        { 
                            onSuccess: () => {
                                setIsEditModalOpen(false);
                                refetch();
                            } 
                        }
                    );
                }}
            />
        </div>
    );
};

export default CouponDetails;

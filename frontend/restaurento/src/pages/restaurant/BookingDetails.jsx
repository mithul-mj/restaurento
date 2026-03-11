import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  ChevronRight,
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Users, 
  IndianRupee,
  AlertCircle,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useBookingDetails, useUpdateBookingStatus } from "../../hooks/useRestaurantBookings";
import Loader from "../../components/Loader";
import { formatDate, formatTime12Hour } from "../../utils/timeUtils";
import { showToast } from "../../utils/alert";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useBookingDetails(id);
  const updateStatus = useUpdateBookingStatus();

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await updateStatus.mutateAsync({ bookingId: id, status: "cancelled" });
        showToast("Booking cancelled successfully", "success");
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to cancel booking", "error");
      }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
      <Loader size="large" />
    </div>
  );

  if (isError || !response?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8f8f8]">
        <div className="w-16 h-16 bg-red-100/50 rounded-full flex items-center justify-center text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Booking Not Found</h2>
        <p className="text-gray-400 mb-6 text-center max-w-sm font-bold">
          The booking you are looking for might have been deleted or moved.
        </p>
        <button
          onClick={() => navigate("/restaurant/bookings")}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all active:scale-95"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const booking = response.data;
  const subtotal = booking.preOrderItems?.reduce((acc, item) => acc + (item.priceAtBooking * item.qty), 0) || 0;
  const seatTotal = booking.guests * (booking.slotPrice || 0);
  const tax = booking.tax || 0;
  const platformFee = booking.platformFee || 0;
  const total = booking.totalAmount || (subtotal + seatTotal + tax + platformFee);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-4 md:p-8 lg:p-16 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
        
        <nav className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <button 
            onClick={() => navigate("/restaurant/bookings")}
            className="hover:text-gray-900 transition-colors"
          >
            All Bookings
          </button>
          <ChevronRight size={14} strokeWidth={3} />
          <span className="text-gray-900">Booking Details</span>
        </nav>


        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {booking.userId?.fullName}
            </h1>
          </div>

          <div className="flex flex-col items-end gap-1">
            {booking.status === 'checked-in' && (
              <span className="px-5 py-1.5 rounded-full bg-green-100 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                Completed
              </span>
            )}
            {booking.status === 'canceled' && (
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                booking.canceledBy === 'RESTAURANT' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {booking.canceledBy === 'RESTAURANT' ? 'Cancelled by you' : 'Cancelled by customer'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">

          <div className="lg:col-span-4 space-y-6 md:space-y-10">
            <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6 md:space-y-8">
              <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
              <div className="space-y-6">
                {booking.userId?.phone ? (
                  <div className="flex items-center gap-4 text-gray-500 font-medium text-sm md:text-base">
                    <Phone size={22} className="text-gray-400" />
                    {booking.userId.phone}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-gray-500 font-medium text-sm md:text-base">
                    <Mail size={22} className="text-gray-400" />
                    <span className="truncate">{booking.userId?.email}</span>
                  </div>
                )}
              </div>
            </div>


            <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6 md:space-y-8">
              <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between font-medium text-sm md:text-base">
                  <span className="text-gray-400">Date</span>
                  <span className="text-gray-500 text-right">{formatDate(booking.bookingDate, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-sm md:text-base">
                  <span className="text-gray-400">Time</span>
                  <span className="text-gray-500">{formatTime12Hour(booking.slotTime)}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-sm md:text-base">
                  <span className="text-gray-400">Guests</span>
                  <span className="text-gray-500">{booking.guests} People</span>
                </div>
                <div className="flex items-center justify-between font-medium text-sm md:text-base">
                  <span className="text-gray-400">Rate per seat</span>
                  <span className="text-gray-500">₹{booking.slotPrice?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </div>
          </div>


          <div className="lg:col-span-8">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-full flex flex-col">
              <div className="p-6 md:p-10 pb-4 md:pb-6">
                <h3 className="text-xl font-bold text-gray-900">Pre-ordered Items</h3>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-[500px] md:min-w-0">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <th className="px-6 md:px-10 py-5">Item</th>
                        <th className="px-6 md:px-10 py-5 text-center">Qty</th>
                        <th className="px-6 md:px-10 py-5 text-right">Price</th>
                        <th className="px-6 md:px-10 py-5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {booking.preOrderItems?.length > 0 ? (
                        booking.preOrderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-6 md:px-10 py-4 md:py-6 font-bold text-gray-900">{item.name}</td>
                            <td className="px-6 md:px-10 py-4 md:py-6 text-center font-medium text-gray-400">{item.qty}</td>
                            <td className="px-6 md:px-10 py-4 md:py-6 text-right font-medium text-gray-400">₹{item.priceAtBooking?.toFixed(2)}</td>
                            <td className="px-6 md:px-10 py-4 md:py-6 text-right font-bold text-gray-900">₹{(item.priceAtBooking * item.qty).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-10 py-16 text-center text-gray-300 font-bold tracking-tight">No items pre-ordered</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 md:p-10 pt-8 space-y-3 border-t border-gray-50 bg-gray-50/50 text-sm font-medium">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-xs md:text-sm">Booking Fee ({booking.guests} x ₹{booking.slotPrice || 0})</span>
                  <span className="text-xs md:text-sm">₹{seatTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-xs md:text-sm">Food Total</span>
                  <span className="text-xs md:text-sm">₹{subtotal.toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="text-xs md:text-sm">Taxes</span>
                    <span className="text-xs md:text-sm">₹{tax.toFixed(2)}</span>
                  </div>
                )}
                {platformFee > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="text-xs md:text-sm">Platform Fee</span>
                    <span className="text-xs md:text-sm">₹{platformFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-6 mt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                  <p className="font-black text-gray-900">Total Payable</p>
                  <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">₹{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Actions</h3>
          </div>
          <div className="flex items-center w-full md:w-auto">
            {booking.status === 'approved' ? (
              <button 
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50"
                onClick={handleCancel}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Cancelling..." : (
                  <>
                    <XCircle size={20} />
                    Cancel Booking
                  </>
                )}
              </button>
            ) : (
              <div className="w-full text-center text-gray-400 font-bold text-sm italic">
                No active actions available for this booking status.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

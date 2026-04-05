import mongoose from 'mongoose';
import { Booking } from '../../models/Booking.model.js';
import { Restaurant } from '../../models/Restaurant.model.js';
import { Schedule } from '../../models/Schedule.model.js';
import { Coupon } from '../../models/Coupon.model.js';
import { Offer } from '../../models/Offer.model.js';
import { User } from '../../models/User.model.js';
import { WalletTransaction } from '../../models/WalletTransaction.model.js';
import { getRealTimeAvailability } from '../inventory.service.js';
import { TAX_RATE, PLATFORM_FEE_RATE, BOOKING_BUFFER_MINUTES } from '../../constants/constants.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import { getCategoryFromMinutes } from '../../utils/timeCategoryUtils.js';
import Razorpay from 'razorpay';
import { env } from '../../config/env.config.js';

const razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Validates the core conditions for a booking (existence, date, schedule, slots, availability)
 */
export const validateBookingBasics = async (restaurantId, bookingDate, slotTime, guests, userId) => {
    const requestedDate = new Date(bookingDate);
    const [restaurant, activeSchedule] = await Promise.all([
        Restaurant.findById(restaurantId).select('restaurantName menuItems').lean(),
        Schedule.findOne({
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            validFrom: { $lte: requestedDate }
        }).sort({ validFrom: -1 }).lean()
    ]);

    if (!restaurant || !activeSchedule) {
        throw { status: STATUS_CODES.NOT_FOUND, message: "Restaurant or Schedule not found." };
    }

    // Check if temporarily closed
    if (activeSchedule.closedTill && new Date(activeSchedule.closedTill) > new Date()) {
        throw { 
            status: STATUS_CODES.FORBIDDEN, 
            message: "Restaurant is temporarily closed. Please try again later.",
            closedTill: activeSchedule.closedTill 
        };
    }

    // 1. Date & Buffer check
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const bookingDateMidnight = new Date(requestedDate);
    bookingDateMidnight.setUTCHours(0, 0, 0, 0);

    if (bookingDateMidnight < today) {
        throw { status: STATUS_CODES.BAD_REQUEST, message: "Cannot book for a past date." };
    }

    if (bookingDateMidnight.getTime() === today.getTime()) {
        const now = new Date();
        const currentMinutes = (now.getHours() * 60) + now.getMinutes();
        if (slotTime <= currentMinutes + BOOKING_BUFFER_MINUTES) {
            throw { status: STATUS_CODES.BAD_REQUEST, message: `Slot too soon. Min ${BOOKING_BUFFER_MINUTES / 60}h buffer required.` };
        }
    }

    // 2. Closed day check
    const dayOfWeek = requestedDate.getDay();
    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
    const dayConfig = activeSchedule.openingHours?.days?.[dayIndex];

    if (!dayConfig || dayConfig.isClosed) {
        throw { status: STATUS_CODES.BAD_REQUEST, message: "Restaurant is closed on this day." };
    }

    // 3. Slot validity check
    const isValidSlot = dayConfig.generatedSlots?.some(slot => slot.startTime === parseInt(slotTime));
    if (!isValidSlot) {
        throw { status: STATUS_CODES.BAD_REQUEST, message: "The selected time slot is invalid." };
    }

    // 4. Real-time Seat Availability check
    const available = await getRealTimeAvailability(restaurantId, bookingDate, slotTime, userId);
    if (available < guests) {
        throw { status: STATUS_CODES.BAD_REQUEST, message: "Enough seats are no longer available for this slot." };
    }

    return { restaurant, activeSchedule };
};

/**
 * Calculates pricing including dishes, coupons, and offers
 */
export const calculateBookingFinals = async (restaurant, preOrderItems, guests, slotPrice, couponId, offerId, slotTime) => {
    let itemTotal = 0;
    const verifiedPreOrderItems = [];
    const currentCategory = getCategoryFromMinutes(slotTime);

    // 1. Dish Verification & Category Matching
    if (preOrderItems && preOrderItems.length > 0) {
        for (const item of preOrderItems) {
            const dbDish = restaurant.menuItems.find(m => m._id.toString() === item.dishId.toString());

            if (!dbDish || dbDish.isDeleted || !dbDish.isAvailable) {
                throw {
                    status: STATUS_CODES.BAD_REQUEST,
                    message: `Item "${dbDish?.name || 'Unknown Item'}" is no longer available. Please update your cart.`
                };
            }

            // Category Validation: Ensure item is available for the selected time slot (Case-Insensitive)
            if (dbDish.categories && dbDish.categories.length > 0) {
                const itemCategories = dbDish.categories.map(c => c.toLowerCase());
                const categoryToMatch = currentCategory.toLowerCase();

                if (!itemCategories.includes(categoryToMatch)) {
                    throw {
                        status: STATUS_CODES.BAD_REQUEST,
                        message: `Item "${dbDish.name}" is only available for: ${dbDish.categories.join(', ')}. Your slot is categorized as ${currentCategory}.`
                    };
                }
            }

            itemTotal += (dbDish.price * item.qty);
            verifiedPreOrderItems.push({
                dishId: dbDish._id,
                name: dbDish.name,
                qty: item.qty,
                priceAtBooking: dbDish.price
            });
        }
    }

    const bookingFee = (slotPrice || 0) * guests;
    const subtotal = bookingFee + itemTotal;
    const tax = itemTotal * TAX_RATE;
    const platformFee = subtotal * PLATFORM_FEE_RATE;

    // 2. Coupon Verification
    let discountAmount = 0;
    let couponDetails = null;
    if (couponId) {
        const coupon = await Coupon.findById(couponId).lean();
        const now = new Date();
        if (!coupon || !coupon.isActive || (coupon.expiryDate && new Date(coupon.expiryDate) < now)) {
            throw { status: STATUS_CODES.BAD_REQUEST, message: "Coupon is invalid or expired." };
        }

        if (coupon.usageLimit) {
            const usageCount = await Booking.countDocuments({ "appliedCoupon.couponId": coupon._id, status: { $ne: 'canceled' } });
            if (usageCount >= coupon.usageLimit) {
                throw { status: STATUS_CODES.BAD_REQUEST, message: "Coupon limit reached." };
            }
        }

        if (subtotal < (coupon.minOrderValue || 0)) {
            throw { status: STATUS_CODES.BAD_REQUEST, message: `Coupon needs min order of ₹${coupon.minOrderValue}` };
        }

        const rawDiscount = subtotal * (coupon.discountValue / 100);
        discountAmount = coupon.maxDiscountCap ? Math.min(rawDiscount, coupon.maxDiscountCap) : rawDiscount;
        couponDetails = { couponId: coupon._id, code: coupon.code, discountValue: coupon.discountValue, discountAmountApplied: discountAmount };
    }

    // 3. Offer Verification
    let offerDiscount = 0;
    let offerDetails = null;
    if (offerId) {
        const offer = await Offer.findOne({
            _id: offerId,
            restaurantId: restaurant._id,
            isActive: true,
            validFrom: { $lte: new Date() },
            $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gt: new Date() } }],
            minOrderValue: { $lte: subtotal }
        });
        if (!offer) {
            throw { status: STATUS_CODES.BAD_REQUEST, message: "Offer is no longer valid." };
        }
        offerDiscount = offer.discountValue;
        offerDetails = { offerId: offer._id, discountValue: offerDiscount };
    }

    const finalTotal = subtotal + tax + platformFee - discountAmount - offerDiscount;

    return {
        itemTotal,
        verifiedPreOrderItems,
        tax,
        platformFee,
        couponDetails,
        offerDetails,
        finalTotal
    };
};

/**
 * Creates a Razorpay order
 */
export const createRazorpayOrder = async (amount) => {
    const options = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
    };
    return await razorpayInstance.orders.create(options);
};

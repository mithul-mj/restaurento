import mongoose, { Schema } from "mongoose";

const walletTransactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        },
        amount: {
            type: Number,
            required: true, // Positive for credit (+), Negative for debit (-)
        },
        description: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);

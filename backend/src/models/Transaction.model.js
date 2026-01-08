import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
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
            required: true,
        },
        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);

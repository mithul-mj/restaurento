import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema({
    restaurantId: { 
        type: Schema.Types.ObjectId, 
        ref: "Restaurant", 
        required: true,
        index: true 
    },
    validFrom: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    openingHours: {
        isSameEveryDay: { type: Boolean, default: false },
        days: [{
            startTime: Number,
            endTime: Number,
            isClosed: { type: Boolean, default: false },
            generatedSlots: [{
                startTime: Number,
                endTime: Number
            }]
        }]
    },
    slotConfig: {
        duration: { type: Number, default: 60 },
        gap: { type: Number, default: 0 }
    },
    totalSeats: { type: Number },
    slotPrice: { type: Number }
}, { timestamps: true });

// Index for timeline queries
scheduleSchema.index({ restaurantId: 1, validFrom: -1 });

export const Schedule = mongoose.model("Schedule", scheduleSchema);

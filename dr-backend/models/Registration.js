import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String, // Keeping email for communication, though not in exact user list
        required: true,
        trim: true, // lowercase handled by setter usually, but fine here
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    college: {
        type: String,
        required: true,
        trim: true
    },
    events: [{
        name: String,
        date: String,
        time: String,
        category: String, // 'Wing'
        price: Number
    }],
    payment: {
        amount: { type: Number, required: true },
        method: { type: String, required: true }, // Cash, UPI, etc.
        transactionId: { type: String, default: "" }
    },
    participantCount: {
        type: Number,
        required: true,
        default: 1
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    registrationDateFormatted: {
        type: String // Stores the specific formatted date sent from client
    }
});

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;

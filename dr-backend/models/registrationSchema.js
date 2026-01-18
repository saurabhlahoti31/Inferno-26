import mongoose from "mongoose";

const regSchema = new mongoose.Schema(
    {
        sr_no: {
            type: Number,
            required: true,
            unique: true
        },
        receipt_no: {
            type: String,
            required: true,
            unique: true
        },
        registration_date: {
            type: Date,
            required: true
        },
        participant_name: {
            type: String,
            required: true
        },
        contact_no: {
            type: String,
            required: true
        },
        college_institute_name: {
            type: String,
            required: true
        },
        wing_name: {
            type: String,
            required: true
        },
        competition_name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        payment_method: {
            type: String,
            required: true
        },
        transaction_id_cheque_no: {
            type: String,
            required: true
        },
        payment_status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        no_of_participant: {
            type: Number,
            required: true
        },
        event_date: {
            type: Date,
            required: true
        },
        event_time: {
            type: String,
            required: true
        }
    }
)
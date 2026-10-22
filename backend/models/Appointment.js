const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: String,
        required: true
    },
    doctorName: { type: String, default: '' },
    doctorSpecialization: { type: String, default: '' },
    doctorHospital: { type: String, default: '' },
    consultationFee: { type: Number, default: 0 },
    date: {
        type: String,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'confirmed'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);

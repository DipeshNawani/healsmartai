const mongoose = require('mongoose');

const testBookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testId: {
        type: String,
        default: ''
    },
    testName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    collectionType: {
        type: String,
        enum: ['home', 'lab'],
        default: 'home'
    },
    address: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'sample_collected', 'processing', 'completed', 'cancelled'],
        default: 'booked'
    },
    reportUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TestBooking', testBookingSchema);

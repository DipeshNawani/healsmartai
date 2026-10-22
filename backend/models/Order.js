const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        medicineId: String,
        name: String,
        price: Number,
        quantity: Number,
        dosageForm: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    prescriptionUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
        default: 'placed'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        default: 'cod'
    },
    estimatedDelivery: {
        type: String,
        default: '30-45 minutes'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

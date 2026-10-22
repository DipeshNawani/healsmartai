const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    genericName: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Pain Relief',
            'Cold & Flu',
            'Digestive Health',
            'Vitamins & Supplements',
            'Skin Care',
            'Diabetes Care',
            'Heart Health',
            'Eye & Ear Care',
            'First Aid',
            'Ayurvedic',
            'Personal Care',
            'Baby Care'
        ]
    },
    manufacturer: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        default: null
    },
    dosageForm: {
        type: String,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Cream', 'Drops', 'Injection', 'Powder', 'Gel', 'Ointment', 'Inhaler', 'Spray'],
        default: 'Tablet'
    },
    packSize: {
        type: String,
        default: ''
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 4.0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    uses: {
        type: [String],
        default: []
    },
    sideEffects: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);

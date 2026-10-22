const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Blood Tests',
            'Imaging',
            'Cardiac Tests',
            'Diabetes & Metabolism',
            'Thyroid',
            'Liver & Kidney',
            'Allergy & Immunity',
            'Women Health',
            'Full Body Checkup',
            'Infection & Fever'
        ]
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
    parameters: {
        type: [String],
        default: []
    },
    preparationInstructions: {
        type: String,
        default: ''
    },
    reportTime: {
        type: String,
        default: '24-48 hours'
    },
    sampleType: {
        type: String,
        default: 'Blood'
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema);

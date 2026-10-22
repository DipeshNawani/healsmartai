const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    specialization: {
        type: String,
        required: true,
        enum: [
            'General Physician',
            'Cardiologist',
            'Dermatologist',
            'Orthopedic',
            'Neurologist',
            'Pediatrician',
            'Gynecologist',
            'ENT Specialist',
            'Ophthalmologist',
            'Psychiatrist',
            'Dentist',
            'Urologist',
            'Pulmonologist',
            'Gastroenterologist',
            'Oncologist'
        ]
    },
    degree: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    hospital: {
        type: String,
        default: ''
    },
    location: {
        city: { type: String, default: '' },
        state: { type: String, default: '' }
    },
    consultationFee: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    bio: {
        type: String,
        default: ''
    },
    availableDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    availableSlots: {
        type: [String],
        default: [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
            '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
        ]
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);

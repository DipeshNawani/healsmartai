const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['blood_pressure', 'blood_sugar', 'weight', 'heart_rate', 'temperature', 'spo2'],
        required: true
    },
    value: { type: Number, required: true },
    value2: { type: Number }, // e.g., diastolic for BP
    unit: { type: String, default: '' },
    notes: { type: String, default: '' },
    recordedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);

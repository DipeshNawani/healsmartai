const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    bloodGroup: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
}, {
    timestamps: true
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);

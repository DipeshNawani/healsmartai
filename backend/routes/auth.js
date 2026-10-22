const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const TestBooking = require('../models/TestBooking');
const ChatSession = require('../models/ChatSession');
const FamilyMember = require('../models/FamilyMember');
const HealthRecord = require('../models/HealthRecord');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        // Input validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        if (name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({ message: 'Name must be 2-50 characters' });
        }
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, authProvider: 'local' });
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email,
            avatar: user.avatar, role: user.role, token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
        res.json({
            _id: user._id, name: user.name, email: user.email,
            avatar: user.avatar, role: user.role, token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        const { name, email, avatar, googleId } = req.body;
        if (!email || !googleId) {
            return res.status(400).json({ message: 'Google authentication data missing' });
        }
        let user = await User.findOne({ email });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                if (avatar && !user.avatar) user.avatar = avatar;
                await user.save();
            }
        } else {
            user = await User.create({ name, email, avatar, googleId, authProvider: 'google' });
        }
        res.json({
            _id: user._id, name: user.name, email: user.email,
            avatar: user.avatar, role: user.role, token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id, name: req.user.name, email: req.user.email,
        avatar: req.user.avatar, phone: req.user.phone, address: req.user.address, role: req.user.role
    });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        if (req.body.address !== undefined) user.address = req.body.address;
        if (req.body.dob) user.dob = req.body.dob;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.avatar) user.avatar = req.body.avatar;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
            avatar: updatedUser.avatar, phone: updatedUser.phone, address: updatedUser.address, role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// ADMIN STATS
// ========================
router.get('/admin/stats', protect, async (req, res) => {
    try {
        const [users, appointments, orders, labBookings, chatSessions] = await Promise.all([
            User.countDocuments(),
            Appointment.countDocuments(),
            Order.countDocuments(),
            TestBooking.countDocuments(),
            ChatSession.countDocuments()
        ]);
        const orderDocs = await Order.find().select('totalAmount');
        const totalRevenue = orderDocs.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5).lean();
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
        res.json({
            users, appointments, orders, labBookings, chatSessions,
            totalRevenue: Math.round(totalRevenue),
            recentAppointments, recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// FAMILY MEMBERS
// ========================
router.get('/family', protect, async (req, res) => {
    try {
        const members = await FamilyMember.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/family', protect, async (req, res) => {
    try {
        const { name, relation, age, gender, bloodGroup, medicalHistory } = req.body;
        if (!name || !relation) return res.status(400).json({ message: 'Name and relation are required' });
        const member = await FamilyMember.create({
            user: req.user._id, name, relation, age, gender, bloodGroup, medicalHistory
        });
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/family/:id', protect, async (req, res) => {
    try {
        await FamilyMember.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Family member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// HEALTH RECORDS
// ========================
router.get('/health-records', protect, async (req, res) => {
    try {
        const { type, limit = 30 } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;
        const records = await HealthRecord.find(filter).sort({ recordedAt: -1 }).limit(parseInt(limit));
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/health-records', protect, async (req, res) => {
    try {
        const { type, value, value2, unit, notes, recordedAt } = req.body;
        if (!type || value === undefined) return res.status(400).json({ message: 'Type and value are required' });
        const record = await HealthRecord.create({
            user: req.user._id, type, value, value2, unit, notes,
            recordedAt: recordedAt || new Date()
        });
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

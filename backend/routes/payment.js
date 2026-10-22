const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }

        // Check if Razorpay keys are configured
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id_here') {
            // Demo mode — return a mock order for testing
            return res.json({
                id: 'order_demo_' + Date.now(),
                amount: Math.round(amount * 100),
                currency,
                receipt: receipt || 'receipt_' + Date.now(),
                status: 'created',
                demo: true
            });
        }

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt: receipt || 'receipt_' + Date.now(),
            notes: notes || {}
        };

        const order = await razorpay.orders.create(options);
        res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error('Razorpay create order error:', error.message);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
});

// Verify payment signature
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Demo mode verification
        if (razorpay_order_id?.startsWith('order_demo_')) {
            return res.json({ verified: true, demo: true });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification data missing' });
        }

        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ verified: true, paymentId: razorpay_payment_id });
        } else {
            res.status(400).json({ verified: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Razorpay verify error:', error.message);
        res.status(500).json({ message: 'Payment verification failed' });
    }
});

module.exports = router;

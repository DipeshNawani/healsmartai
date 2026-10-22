const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Security middleware
try {
    const helmet = require('helmet');
    app.use(helmet({ crossOriginResourcePolicy: false }));
} catch (e) { /* helmet not installed */ }

try {
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: { message: 'Too many requests, please try again later.' }
    });
    app.use('/api/', limiter);

    const aiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 10,
        message: { message: 'AI rate limit reached. Please wait a moment.' }
    });
    app.use('/api/ai/chat', aiLimiter);
    app.use('/api/ai/interactions', aiLimiter);
} catch (e) { /* express-rate-limit not installed */ }

// CORS — restrict to known origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/lab-tests', require('./routes/labTests'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'HealSmart AI API is running', features: 18 });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.log('Failed to connect to MongoDB:', err.message);
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (without DB)`);
    });
});

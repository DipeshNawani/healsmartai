const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// Demo doctors data (used when DB is empty or unavailable)
const DEMO_DOCTORS = [
    { _id: 'd1', name: 'Dr. Priya Sharma', specialization: 'General Physician', degree: 'MBBS, MD', experience: 12, hospital: 'Apollo Hospital', location: { city: 'Mumbai', state: 'Maharashtra' }, consultationFee: 500, rating: 4.8, totalReviews: 324, bio: 'Experienced general physician with expertise in preventive medicine and chronic disease management.', avatar: '', availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM','04:00 PM'], isAvailable: true },
    { _id: 'd2', name: 'Dr. Rajesh Patel', specialization: 'Cardiologist', degree: 'MBBS, DM Cardiology', experience: 18, hospital: 'Max Healthcare', location: { city: 'Delhi', state: 'Delhi' }, consultationFee: 1200, rating: 4.9, totalReviews: 512, bio: 'Leading cardiologist specializing in interventional cardiology and heart failure management.', avatar: '', availableDays: ['Monday','Wednesday','Friday'], availableSlots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM'], isAvailable: true },
    { _id: 'd3', name: 'Dr. Anita Desai', specialization: 'Dermatologist', degree: 'MBBS, MD Dermatology', experience: 10, hospital: 'Fortis Hospital', location: { city: 'Bangalore', state: 'Karnataka' }, consultationFee: 800, rating: 4.7, totalReviews: 287, bio: 'Skin specialist with expertise in cosmetic dermatology, acne treatment, and laser procedures.', avatar: '', availableDays: ['Monday','Tuesday','Thursday','Friday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','11:00 AM','11:30 AM','03:00 PM','03:30 PM','04:00 PM'], isAvailable: true },
    { _id: 'd4', name: 'Dr. Vikram Singh', specialization: 'Orthopedic', degree: 'MBBS, MS Orthopedics', experience: 15, hospital: 'AIIMS', location: { city: 'Delhi', state: 'Delhi' }, consultationFee: 1000, rating: 4.8, totalReviews: 445, bio: 'Expert orthopedic surgeon specializing in joint replacement and sports medicine.', avatar: '', availableDays: ['Tuesday','Wednesday','Thursday','Saturday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','02:00 PM','02:30 PM','03:00 PM'], isAvailable: true },
    { _id: 'd5', name: 'Dr. Meera Krishnan', specialization: 'Neurologist', degree: 'MBBS, DM Neurology', experience: 14, hospital: 'Narayana Health', location: { city: 'Chennai', state: 'Tamil Nadu' }, consultationFee: 1100, rating: 4.6, totalReviews: 198, bio: 'Neurologist specializing in stroke management, epilepsy, and neurodegenerative disorders.', avatar: '', availableDays: ['Monday','Wednesday','Friday'], availableSlots: ['10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'], isAvailable: true },
    { _id: 'd6', name: 'Dr. Suresh Reddy', specialization: 'Pediatrician', degree: 'MBBS, MD Pediatrics', experience: 20, hospital: 'Rainbow Children\'s Hospital', location: { city: 'Hyderabad', state: 'Telangana' }, consultationFee: 600, rating: 4.9, totalReviews: 678, bio: 'Renowned pediatrician with vast experience in neonatal care and child development.', avatar: '', availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','03:00 PM'], isAvailable: true },
    { _id: 'd7', name: 'Dr. Kavita Mehta', specialization: 'Gynecologist', degree: 'MBBS, MS OB-GYN', experience: 16, hospital: 'Lilavati Hospital', location: { city: 'Mumbai', state: 'Maharashtra' }, consultationFee: 900, rating: 4.7, totalReviews: 389, bio: 'Experienced gynecologist specializing in high-risk pregnancies and minimally invasive surgery.', avatar: '', availableDays: ['Monday','Tuesday','Thursday','Friday'], availableSlots: ['09:00 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM','04:00 PM'], isAvailable: true },
    { _id: 'd8', name: 'Dr. Arjun Nair', specialization: 'ENT Specialist', degree: 'MBBS, MS ENT', experience: 11, hospital: 'Manipal Hospital', location: { city: 'Pune', state: 'Maharashtra' }, consultationFee: 700, rating: 4.5, totalReviews: 156, bio: 'ENT specialist with expertise in sinus surgery, hearing disorders, and throat conditions.', avatar: '', availableDays: ['Monday','Wednesday','Thursday','Friday'], availableSlots: ['09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:30 PM'], isAvailable: true },
    { _id: 'd9', name: 'Dr. Sanjana Gupta', specialization: 'Ophthalmologist', degree: 'MBBS, MS Ophthalmology', experience: 13, hospital: 'Sankara Eye Hospital', location: { city: 'Bangalore', state: 'Karnataka' }, consultationFee: 750, rating: 4.6, totalReviews: 234, bio: 'Eye specialist with expertise in cataract surgery, LASIK, and retinal disorders.', avatar: '', availableDays: ['Monday','Tuesday','Wednesday','Friday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','03:30 PM','04:00 PM'], isAvailable: true },
    { _id: 'd10', name: 'Dr. Rahul Chopra', specialization: 'Psychiatrist', degree: 'MBBS, MD Psychiatry', experience: 9, hospital: 'NIMHANS', location: { city: 'Bangalore', state: 'Karnataka' }, consultationFee: 1000, rating: 4.8, totalReviews: 167, bio: 'Psychiatrist specializing in anxiety disorders, depression, and stress management therapy.', avatar: '', availableDays: ['Tuesday','Wednesday','Thursday','Saturday'], availableSlots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM'], isAvailable: true },
    { _id: 'd11', name: 'Dr. Pooja Iyer', specialization: 'Dentist', degree: 'BDS, MDS', experience: 8, hospital: 'Clove Dental', location: { city: 'Chennai', state: 'Tamil Nadu' }, consultationFee: 400, rating: 4.7, totalReviews: 445, bio: 'Expert dentist in cosmetic dentistry, root canals, and orthodontic treatments.', avatar: '', availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM','04:00 PM','04:30 PM'], isAvailable: true },
    { _id: 'd12', name: 'Dr. Anil Kumar', specialization: 'Pulmonologist', degree: 'MBBS, DM Pulmonology', experience: 17, hospital: 'Medanta Hospital', location: { city: 'Gurugram', state: 'Haryana' }, consultationFee: 1100, rating: 4.5, totalReviews: 203, bio: 'Pulmonologist specializing in asthma, COPD, and respiratory infections management.', avatar: '', availableDays: ['Monday','Wednesday','Friday'], availableSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','03:00 PM'], isAvailable: true },
];

// GET /api/doctors - List all doctors with filters
router.get('/', async (req, res) => {
    try {
        const { specialization, search, minFee, maxFee, rating, sort } = req.query;

        // Try DB first
        let doctors;
        try {
            const filter = { isAvailable: true };

            if (specialization && specialization !== 'All') {
                filter.specialization = specialization;
            }
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { hospital: { $regex: search, $options: 'i' } },
                    { 'location.city': { $regex: search, $options: 'i' } }
                ];
            }
            if (minFee || maxFee) {
                filter.consultationFee = {};
                if (minFee) filter.consultationFee.$gte = Number(minFee);
                if (maxFee) filter.consultationFee.$lte = Number(maxFee);
            }
            if (rating) {
                filter.rating = { $gte: Number(rating) };
            }

            let sortOption = { rating: -1 };
            if (sort === 'fee-low') sortOption = { consultationFee: 1 };
            else if (sort === 'fee-high') sortOption = { consultationFee: -1 };
            else if (sort === 'experience') sortOption = { experience: -1 };
            else if (sort === 'name') sortOption = { name: 1 };

            doctors = await Doctor.find(filter).sort(sortOption);
        } catch {
            doctors = [];
        }

        // Fallback to demo data if DB is empty
        if (!doctors || doctors.length === 0) {
            let filtered = [...DEMO_DOCTORS];

            if (specialization && specialization !== 'All') {
                filtered = filtered.filter(d => d.specialization === specialization);
            }
            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(d =>
                    d.name.toLowerCase().includes(s) ||
                    d.hospital.toLowerCase().includes(s) ||
                    d.location.city.toLowerCase().includes(s)
                );
            }
            if (minFee) filtered = filtered.filter(d => d.consultationFee >= Number(minFee));
            if (maxFee) filtered = filtered.filter(d => d.consultationFee <= Number(maxFee));
            if (rating) filtered = filtered.filter(d => d.rating >= Number(rating));

            if (sort === 'fee-low') filtered.sort((a, b) => a.consultationFee - b.consultationFee);
            else if (sort === 'fee-high') filtered.sort((a, b) => b.consultationFee - a.consultationFee);
            else if (sort === 'experience') filtered.sort((a, b) => b.experience - a.experience);
            else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
            else filtered.sort((a, b) => b.rating - a.rating);

            doctors = filtered;
        }

        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/doctors/:id - Get single doctor
router.get('/:id', async (req, res) => {
    try {
        let doctor;
        try {
            doctor = await Doctor.findById(req.params.id);
        } catch {
            doctor = null;
        }

        if (!doctor) {
            doctor = DEMO_DOCTORS.find(d => d._id === req.params.id);
        }

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/doctors/:id/slots - Get booked slots for a date
router.get('/:id/slots', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.json([]);

        let bookedSlots = [];
        try {
            const appointments = await Appointment.find({
                doctor: req.params.id,
                date,
                status: { $ne: 'cancelled' }
            });
            bookedSlots = appointments.map(a => a.timeSlot);
        } catch {
            // DB not available
        }

        res.json(bookedSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/doctors/book - Book an appointment
router.post('/book', protect, async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;

        if (!doctorId || !date || !timeSlot) {
            return res.status(400).json({ message: 'Doctor, date, and time slot are required' });
        }

        // Find doctor info (from DB or demo data)
        let doctor;
        try {
            doctor = await Doctor.findById(doctorId);
        } catch {
            doctor = null;
        }
        if (!doctor) {
            doctor = DEMO_DOCTORS.find(d => d._id === doctorId);
        }
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Save appointment with doctor details inline
        const appointment = await Appointment.create({
            user: req.user._id,
            doctorId,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            doctorHospital: doctor.hospital,
            consultationFee: doctor.consultationFee,
            date,
            timeSlot,
            reason: reason || ''
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Book appointment error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/doctors/appointments/my - Get user's appointments
router.get('/appointments/my', protect, async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// ========================
// DOCTOR REVIEWS
// ========================
const Review = require('../models/Review');

// GET /api/doctors/:id/reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ doctorId: req.params.id }).sort({ createdAt: -1 }).limit(20);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/doctors/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating) return res.status(400).json({ message: 'Rating is required' });
        const review = await Review.create({
            user: req.user._id,
            userName: req.user.name,
            doctorId: req.params.id,
            rating: Math.min(5, Math.max(1, rating)),
            comment: comment || ''
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


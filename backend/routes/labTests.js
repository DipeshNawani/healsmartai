const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');
const TestBooking = require('../models/TestBooking');
const { protect } = require('../middleware/auth');

// Demo lab tests
const DEMO_TESTS = [
    // Blood Tests
    { _id: 'lt1', name: 'Complete Blood Count (CBC)', category: 'Blood Tests', description: 'Measures key components of blood including RBC, WBC, hemoglobin, and platelets to detect infections, anemia, and other disorders.', price: 500, discountedPrice: 349, parameters: ['RBC Count', 'WBC Count', 'Hemoglobin', 'Hematocrit', 'Platelets', 'MCV', 'MCH', 'MCHC'], preparationInstructions: 'No special preparation needed. Fasting not required.', reportTime: '6-12 hours', sampleType: 'Blood', isPopular: true, isAvailable: true },
    { _id: 'lt2', name: 'Lipid Profile', category: 'Blood Tests', description: 'Comprehensive cholesterol panel measuring total cholesterol, HDL, LDL, triglycerides, and VLDL to assess heart disease risk.', price: 800, discountedPrice: 549, parameters: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL', 'Cholesterol/HDL Ratio'], preparationInstructions: '10-12 hours fasting required. Water is allowed.', reportTime: '12-24 hours', sampleType: 'Blood', isPopular: true, isAvailable: true },
    { _id: 'lt3', name: 'Vitamin D Test', category: 'Blood Tests', description: 'Measures 25-hydroxy vitamin D levels to check for deficiency that can cause bone weakness and fatigue.', price: 1200, discountedPrice: 799, parameters: ['25-OH Vitamin D'], preparationInstructions: 'No fasting required.', reportTime: '24 hours', sampleType: 'Blood', isPopular: true, isAvailable: true },
    { _id: 'lt4', name: 'Vitamin B12 Test', category: 'Blood Tests', description: 'Checks vitamin B12 levels essential for nerve function and red blood cell production.', price: 900, discountedPrice: 599, parameters: ['Vitamin B12 Level'], preparationInstructions: 'No fasting required.', reportTime: '24 hours', sampleType: 'Blood', isPopular: false, isAvailable: true },

    // Diabetes & Metabolism
    { _id: 'lt5', name: 'HbA1c (Glycosylated Hemoglobin)', category: 'Diabetes & Metabolism', description: 'Provides average blood sugar levels over 2-3 months. Essential for diabetes monitoring and diagnosis.', price: 600, discountedPrice: 399, parameters: ['HbA1c Level', 'Estimated Average Glucose'], preparationInstructions: 'No fasting required.', reportTime: '12-24 hours', sampleType: 'Blood', isPopular: true, isAvailable: true },
    { _id: 'lt6', name: 'Fasting Blood Sugar', category: 'Diabetes & Metabolism', description: 'Measures blood glucose after 8-12 hours of fasting to screen for diabetes.', price: 200, discountedPrice: 149, parameters: ['Fasting Glucose Level'], preparationInstructions: '8-12 hours fasting required. Only water allowed.', reportTime: '6 hours', sampleType: 'Blood', isPopular: false, isAvailable: true },

    // Thyroid
    { _id: 'lt7', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Thyroid', description: 'Complete thyroid function test measuring T3, T4, and TSH hormones to detect hypo/hyperthyroidism.', price: 900, discountedPrice: 599, parameters: ['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4'], preparationInstructions: 'No fasting required. Best taken in the morning.', reportTime: '12-24 hours', sampleType: 'Blood', isPopular: true, isAvailable: true },

    // Liver & Kidney
    { _id: 'lt8', name: 'Liver Function Test (LFT)', category: 'Liver & Kidney', description: 'Evaluates liver health by measuring enzymes, proteins, and bilirubin levels.', price: 700, discountedPrice: 499, parameters: ['SGOT/AST', 'SGPT/ALT', 'Total Bilirubin', 'Direct Bilirubin', 'Alkaline Phosphatase', 'Total Protein', 'Albumin', 'Globulin'], preparationInstructions: '10-12 hours fasting recommended.', reportTime: '12-24 hours', sampleType: 'Blood', isPopular: false, isAvailable: true },
    { _id: 'lt9', name: 'Kidney Function Test (KFT)', category: 'Liver & Kidney', description: 'Assesses kidney health by measuring creatinine, BUN, uric acid, and electrolytes.', price: 800, discountedPrice: 549, parameters: ['Creatinine', 'Blood Urea Nitrogen', 'Uric Acid', 'Sodium', 'Potassium', 'Chloride', 'Calcium'], preparationInstructions: '8-10 hours fasting recommended.', reportTime: '12-24 hours', sampleType: 'Blood', isPopular: false, isAvailable: true },

    // Imaging
    { _id: 'lt10', name: 'Chest X-Ray', category: 'Imaging', description: 'Radiographic imaging of the chest to evaluate lungs, heart, and chest wall structures.', price: 500, discountedPrice: 399, parameters: ['PA View', 'Lateral View'], preparationInstructions: 'Remove metallic objects. Wear loose clothing.', reportTime: '2-4 hours', sampleType: 'X-Ray', isPopular: false, isAvailable: true },
    { _id: 'lt11', name: 'Ultrasound Abdomen', category: 'Imaging', description: 'Non-invasive imaging of abdominal organs including liver, gallbladder, kidneys, and spleen.', price: 1500, discountedPrice: 1199, parameters: ['Liver', 'Gallbladder', 'Pancreas', 'Spleen', 'Kidneys', 'Urinary Bladder'], preparationInstructions: '6 hours fasting. Full bladder required.', reportTime: '2-4 hours', sampleType: 'Ultrasound', isPopular: false, isAvailable: true },
    { _id: 'lt12', name: 'MRI Brain', category: 'Imaging', description: 'Detailed magnetic resonance imaging of the brain to detect tumors, strokes, and neurological conditions.', price: 6000, discountedPrice: 4999, parameters: ['T1 Weighted', 'T2 Weighted', 'FLAIR', 'Diffusion'], preparationInstructions: 'Remove all metallic objects. Inform if you have implants.', reportTime: '24-48 hours', sampleType: 'MRI', isPopular: false, isAvailable: true },

    // Cardiac Tests
    { _id: 'lt13', name: 'ECG (Electrocardiogram)', category: 'Cardiac Tests', description: 'Records electrical activity of the heart to detect arrhythmias, heart attacks, and cardiac conditions.', price: 400, discountedPrice: 299, parameters: ['12-Lead ECG', 'Heart Rate', 'Rhythm Analysis'], preparationInstructions: 'No special preparation. Avoid caffeine 2 hours before.', reportTime: '1 hour', sampleType: 'ECG', isPopular: true, isAvailable: true },
    { _id: 'lt14', name: 'ECHO (Echocardiogram)', category: 'Cardiac Tests', description: 'Ultrasound of the heart to evaluate chambers, valves, and pumping function.', price: 2500, discountedPrice: 1999, parameters: ['Ejection Fraction', 'Chamber Sizes', 'Valve Function', 'Wall Motion'], preparationInstructions: 'No special preparation needed.', reportTime: '2-4 hours', sampleType: 'Ultrasound', isPopular: false, isAvailable: true },

    // Full Body Checkup
    { _id: 'lt15', name: 'Comprehensive Health Checkup', category: 'Full Body Checkup', description: 'Complete health screening with 70+ tests covering blood, thyroid, liver, kidney, diabetes, lipid, and vitamin levels.', price: 5000, discountedPrice: 2999, parameters: ['CBC', 'Lipid Profile', 'LFT', 'KFT', 'Thyroid Profile', 'HbA1c', 'Vitamin D', 'Vitamin B12', 'Iron Studies', 'Urine Routine'], preparationInstructions: '10-12 hours fasting required. Carry previous reports if any.', reportTime: '48-72 hours', sampleType: 'Blood + Urine', isPopular: true, isAvailable: true },

    // Allergy & Immunity
    { _id: 'lt16', name: 'Allergy Panel (Food & Environmental)', category: 'Allergy & Immunity', description: 'Tests for common food and environmental allergens using IgE antibody levels.', price: 3500, discountedPrice: 2499, parameters: ['Dust Mites', 'Pollen', 'Pet Dander', 'Mold', 'Milk', 'Eggs', 'Wheat', 'Peanuts', 'Shellfish', 'Soy'], preparationInstructions: 'No fasting required. Stop antihistamines 5 days before.', reportTime: '3-5 days', sampleType: 'Blood', isPopular: false, isAvailable: true },

    // Infection & Fever
    { _id: 'lt17', name: 'Dengue NS1 + IgM/IgG', category: 'Infection & Fever', description: 'Detects dengue fever through NS1 antigen and IgM/IgG antibodies for early and late-stage diagnosis.', price: 1200, discountedPrice: 899, parameters: ['NS1 Antigen', 'Dengue IgM Antibody', 'Dengue IgG Antibody'], preparationInstructions: 'No fasting required.', reportTime: '6-12 hours', sampleType: 'Blood', isPopular: false, isAvailable: true },
    { _id: 'lt18', name: 'Typhoid Panel (Widal Test)', category: 'Infection & Fever', description: 'Screens for typhoid fever by detecting antibodies against Salmonella typhi bacteria.', price: 500, discountedPrice: 349, parameters: ['Salmonella Typhi O', 'Salmonella Typhi H', 'Salmonella Paratyphi AH', 'Salmonella Paratyphi BH'], preparationInstructions: 'No fasting required.', reportTime: '12-24 hours', sampleType: 'Blood', isPopular: false, isAvailable: true },
];

const TIME_SLOTS = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM'];

// GET /api/lab-tests - List all tests with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, popular, sort } = req.query;

        let tests;
        try {
            const filter = { isAvailable: true };
            if (category && category !== 'All') filter.category = category;
            if (search) filter.name = { $regex: search, $options: 'i' };
            if (popular === 'true') filter.isPopular = true;

            let sortOption = { isPopular: -1, name: 1 };
            if (sort === 'price-low') sortOption = { discountedPrice: 1 };
            else if (sort === 'price-high') sortOption = { discountedPrice: -1 };
            else if (sort === 'name') sortOption = { name: 1 };

            tests = await LabTest.find(filter).sort(sortOption);
        } catch {
            tests = [];
        }

        if (!tests || tests.length === 0) {
            let filtered = [...DEMO_TESTS];

            if (category && category !== 'All') {
                filtered = filtered.filter(t => t.category === category);
            }
            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(t =>
                    t.name.toLowerCase().includes(s) ||
                    t.description.toLowerCase().includes(s)
                );
            }
            if (popular === 'true') {
                filtered = filtered.filter(t => t.isPopular);
            }

            if (sort === 'price-low') filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
            else if (sort === 'price-high') filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
            else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

            tests = filtered;
        }

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/lab-tests/categories - Get category list
router.get('/categories', (req, res) => {
    const categories = [
        { name: 'Blood Tests', icon: '🩸', count: 4 },
        { name: 'Diabetes & Metabolism', icon: '📊', count: 2 },
        { name: 'Thyroid', icon: '🦋', count: 1 },
        { name: 'Liver & Kidney', icon: '🫘', count: 2 },
        { name: 'Imaging', icon: '📷', count: 3 },
        { name: 'Cardiac Tests', icon: '❤️', count: 2 },
        { name: 'Full Body Checkup', icon: '🏥', count: 1 },
        { name: 'Allergy & Immunity', icon: '🤧', count: 1 },
        { name: 'Infection & Fever', icon: '🤒', count: 2 }
    ];
    res.json(categories);
});

// GET /api/lab-tests/:id - Get single test details
router.get('/:id', async (req, res) => {
    try {
        let test;
        try {
            test = await LabTest.findById(req.params.id);
        } catch {
            test = null;
        }
        if (!test) {
            test = DEMO_TESTS.find(t => t._id === req.params.id);
        }
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/lab-tests/book - Book a test
router.post('/book', protect, async (req, res) => {
    try {
        const { testId, testName, date, timeSlot, collectionType, address, price } = req.body;

        if (!testName || !date || !timeSlot) {
            return res.status(400).json({ message: 'Test name, date, and time slot are required' });
        }

        const booking = await TestBooking.create({
            user: req.user._id,
            testId: testId || '',
            testName,
            date,
            timeSlot,
            collectionType: collectionType || 'home',
            address: address || '',
            price: price || 0,
            status: 'booked'
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Book test error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/lab-tests/bookings/my - Get user's test bookings
router.get('/bookings/my', protect, async (req, res) => {
    try {
        const bookings = await TestBooking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Get lab bookings error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/lab-tests/slots/available - Get available time slots
router.get('/slots/available', (req, res) => {
    res.json(TIME_SLOTS);
});

module.exports = router;

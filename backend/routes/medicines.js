const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const DEMO_MEDICINES = [
    // Pain Relief
    { _id: 'm1', name: 'Dolo 650', genericName: 'Paracetamol 650mg', category: 'Pain Relief', manufacturer: 'Micro Labs', description: 'Effective relief from fever, headache, body pain, and toothache. Safe for most adults when used as directed.', price: 35, discountedPrice: 28, dosageForm: 'Tablet', packSize: 'Strip of 15 tablets', requiresPrescription: false, inStock: true, rating: 4.7, totalReviews: 2340, uses: ['Fever', 'Headache', 'Body Pain', 'Toothache'], sideEffects: ['Nausea', 'Allergic reactions (rare)'] },
    { _id: 'm2', name: 'Combiflam', genericName: 'Ibuprofen 400mg + Paracetamol 325mg', category: 'Pain Relief', manufacturer: 'Sanofi India', description: 'Dual-action pain relief combining ibuprofen and paracetamol for stronger relief from pain and inflammation.', price: 42, discountedPrice: 35, dosageForm: 'Tablet', packSize: 'Strip of 20 tablets', requiresPrescription: false, inStock: true, rating: 4.6, totalReviews: 1890, uses: ['Muscle Pain', 'Joint Pain', 'Dental Pain', 'Period Pain'], sideEffects: ['Stomach upset', 'Dizziness'] },
    { _id: 'm3', name: 'Volini Spray', genericName: 'Diclofenac Diethylamine', category: 'Pain Relief', manufacturer: 'Sun Pharma', description: 'Fast-acting pain relief spray for muscle and joint pain. Easy to apply without mess.', price: 220, discountedPrice: 185, dosageForm: 'Spray', packSize: '40g spray', requiresPrescription: false, inStock: true, rating: 4.4, totalReviews: 1120, uses: ['Muscle Sprain', 'Back Pain', 'Neck Pain', 'Sports Injury'], sideEffects: ['Skin irritation', 'Redness'] },

    // Cold & Flu
    { _id: 'm4', name: 'Sinarest New', genericName: 'Paracetamol + Phenylephrine + Chlorpheniramine', category: 'Cold & Flu', manufacturer: 'Centaur Pharma', description: 'Complete cold and flu relief tablet targeting headache, blocked nose, sneezing, and runny nose.', price: 55, discountedPrice: 45, dosageForm: 'Tablet', packSize: 'Strip of 10 tablets', requiresPrescription: false, inStock: true, rating: 4.3, totalReviews: 980, uses: ['Common Cold', 'Flu', 'Running Nose', 'Sneezing'], sideEffects: ['Drowsiness', 'Dry mouth'] },
    { _id: 'm5', name: 'Benadryl Cough Syrup', genericName: 'Diphenhydramine + Ammonium Chloride', category: 'Cold & Flu', manufacturer: 'Johnson & Johnson', description: 'Effective cough suppressant syrup for dry and wet cough with antihistamine properties.', price: 115, discountedPrice: 99, dosageForm: 'Syrup', packSize: '150ml bottle', requiresPrescription: false, inStock: true, rating: 4.5, totalReviews: 1560, uses: ['Dry Cough', 'Wet Cough', 'Allergic Cough', 'Throat Irritation'], sideEffects: ['Drowsiness', 'Dizziness'] },
    { _id: 'm6', name: 'Vicks VapoRub', genericName: 'Menthol + Camphor + Eucalyptus', category: 'Cold & Flu', manufacturer: 'P&G Health', description: 'Topical ointment for relief from cold symptoms including nasal congestion and cough.', price: 95, discountedPrice: 82, dosageForm: 'Ointment', packSize: '50ml jar', requiresPrescription: false, inStock: true, rating: 4.8, totalReviews: 3200, uses: ['Nasal Congestion', 'Cough', 'Cold', 'Body Aches'], sideEffects: ['Skin irritation (rare)'] },

    // Digestive Health
    { _id: 'm7', name: 'Gelusil MPS', genericName: 'Magaldrate + Simethicone', category: 'Digestive Health', manufacturer: 'Pfizer', description: 'Fast-acting antacid for relief from acidity, gas, heartburn, and indigestion.', price: 130, discountedPrice: 110, dosageForm: 'Syrup', packSize: '200ml bottle', requiresPrescription: false, inStock: true, rating: 4.4, totalReviews: 890, uses: ['Acidity', 'Gas', 'Heartburn', 'Indigestion'], sideEffects: ['Constipation', 'Diarrhea (rare)'] },
    { _id: 'm8', name: 'Eno Fruit Salt', genericName: 'Sodium Bicarbonate + Citric Acid', category: 'Digestive Health', manufacturer: 'GSK', description: 'Fast relief from acidity and gas. Effervescent antacid powder for quick action.', price: 25, discountedPrice: 20, dosageForm: 'Powder', packSize: '5g x 6 sachets', requiresPrescription: false, inStock: true, rating: 4.6, totalReviews: 4500, uses: ['Acidity', 'Gas', 'Stomach Discomfort'], sideEffects: ['Bloating'] },

    // Vitamins & Supplements
    { _id: 'm9', name: 'Becosules Capsules', genericName: 'Vitamin B Complex + Vitamin C', category: 'Vitamins & Supplements', manufacturer: 'Pfizer', description: 'Daily multivitamin capsule supporting energy metabolism, nerve health, and immune function.', price: 35, discountedPrice: 30, dosageForm: 'Capsule', packSize: 'Strip of 20 capsules', requiresPrescription: false, inStock: true, rating: 4.7, totalReviews: 2100, uses: ['Vitamin Deficiency', 'Mouth Ulcers', 'Energy Boost', 'Immunity'], sideEffects: ['Mild stomach upset'] },
    { _id: 'm10', name: 'Shelcal 500', genericName: 'Calcium + Vitamin D3', category: 'Vitamins & Supplements', manufacturer: 'Torrent Pharma', description: 'Calcium and Vitamin D3 supplement for strong bones, teeth, and prevention of osteoporosis.', price: 160, discountedPrice: 135, dosageForm: 'Tablet', packSize: 'Bottle of 30 tablets', requiresPrescription: false, inStock: true, rating: 4.5, totalReviews: 1340, uses: ['Calcium Deficiency', 'Bone Health', 'Osteoporosis Prevention'], sideEffects: ['Constipation', 'Gas'] },
    { _id: 'm11', name: 'Limcee Vitamin C', genericName: 'Ascorbic Acid 500mg', category: 'Vitamins & Supplements', manufacturer: 'Abbott', description: 'Chewable vitamin C tablets for enhanced immunity and antioxidant protection.', price: 30, discountedPrice: 24, dosageForm: 'Tablet', packSize: 'Strip of 15 chewable tablets', requiresPrescription: false, inStock: true, rating: 4.8, totalReviews: 3800, uses: ['Immunity Boost', 'Scurvy Prevention', 'Antioxidant', 'Skin Health'], sideEffects: ['Stomach upset at high doses'] },

    // Skin Care
    { _id: 'm12', name: 'Betadine Ointment', genericName: 'Povidone Iodine 5%', category: 'Skin Care', manufacturer: 'Win-Medicare', description: 'Antiseptic ointment for prevention and treatment of skin infections in wounds and cuts.', price: 70, discountedPrice: 58, dosageForm: 'Ointment', packSize: '15g tube', requiresPrescription: false, inStock: true, rating: 4.6, totalReviews: 920, uses: ['Wound Care', 'Cuts', 'Skin Infection Prevention', 'Burns'], sideEffects: ['Skin irritation', 'Staining'] },
    { _id: 'm13', name: 'Caladryl Lotion', genericName: 'Calamine + Diphenhydramine', category: 'Skin Care', manufacturer: 'Piramal', description: 'Soothing lotion for itchy skin, rashes, insect bites, and sunburn relief.', price: 120, discountedPrice: 99, dosageForm: 'Cream', packSize: '60ml bottle', requiresPrescription: false, inStock: true, rating: 4.3, totalReviews: 670, uses: ['Rashes', 'Insect Bites', 'Itching', 'Sunburn'], sideEffects: ['Drowsiness (mild)'] },

    // Diabetes Care
    { _id: 'm14', name: 'Metformin 500mg', genericName: 'Metformin Hydrochloride', category: 'Diabetes Care', manufacturer: 'USV Ltd', description: 'First-line medication for type 2 diabetes management. Helps control blood sugar levels.', price: 45, discountedPrice: 38, dosageForm: 'Tablet', packSize: 'Strip of 20 tablets', requiresPrescription: true, inStock: true, rating: 4.5, totalReviews: 1670, uses: ['Type 2 Diabetes', 'Blood Sugar Control', 'PCOS'], sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'] },
    { _id: 'm15', name: 'Glucometer Test Strips', genericName: 'Blood Glucose Test Strips', category: 'Diabetes Care', manufacturer: 'Accu-Chek', description: 'Accurate blood glucose test strips compatible with Accu-Chek glucometers for at-home monitoring.', price: 900, discountedPrice: 749, dosageForm: 'Tablet', packSize: 'Box of 50 strips', requiresPrescription: false, inStock: true, rating: 4.7, totalReviews: 2300, uses: ['Blood Sugar Monitoring', 'Diabetes Management'], sideEffects: [] },

    // Heart Health
    { _id: 'm16', name: 'Ecosprin 75', genericName: 'Aspirin 75mg', category: 'Heart Health', manufacturer: 'USV Ltd', description: 'Low-dose aspirin for prevention of heart attacks and strokes in at-risk patients.', price: 15, discountedPrice: 12, dosageForm: 'Tablet', packSize: 'Strip of 14 tablets', requiresPrescription: true, inStock: true, rating: 4.6, totalReviews: 1450, uses: ['Heart Attack Prevention', 'Stroke Prevention', 'Blood Thinning'], sideEffects: ['Stomach irritation', 'Bleeding risk'] },

    // Eye & Ear Care
    { _id: 'm17', name: 'Refresh Tears', genericName: 'Carboxymethylcellulose 0.5%', category: 'Eye & Ear Care', manufacturer: 'Allergan', description: 'Lubricating eye drops for relief from dry eyes, eye strain, and irritation from screen use.', price: 180, discountedPrice: 155, dosageForm: 'Drops', packSize: '10ml bottle', requiresPrescription: false, inStock: true, rating: 4.5, totalReviews: 1890, uses: ['Dry Eyes', 'Eye Strain', 'Contact Lens Comfort', 'Screen Fatigue'], sideEffects: ['Temporary blurring'] },

    // First Aid
    { _id: 'm18', name: 'Savlon Antiseptic Liquid', genericName: 'Chlorhexidine + Cetrimide', category: 'First Aid', manufacturer: 'ITC', description: 'All-purpose antiseptic liquid for wound cleaning, bathing, and surface disinfection.', price: 85, discountedPrice: 72, dosageForm: 'Syrup', packSize: '100ml bottle', requiresPrescription: false, inStock: true, rating: 4.7, totalReviews: 2800, uses: ['Wound Cleaning', 'First Aid', 'Antiseptic Bathing', 'Disinfection'], sideEffects: ['Skin irritation (if undiluted)'] },
    { _id: 'm19', name: 'Band-Aid Flexible Fabric', genericName: 'Adhesive Bandages', category: 'First Aid', manufacturer: 'Johnson & Johnson', description: 'Comfortable fabric bandages that flex with your body. Superior breathability for wound healing.', price: 55, discountedPrice: 45, dosageForm: 'Cream', packSize: 'Box of 30 strips', requiresPrescription: false, inStock: true, rating: 4.4, totalReviews: 1560, uses: ['Cuts', 'Scrapes', 'Minor Wounds', 'Blisters'], sideEffects: [] },

    // Ayurvedic
    { _id: 'm20', name: 'Chyawanprash', genericName: 'Ayurvedic Immunity Booster', category: 'Ayurvedic', manufacturer: 'Dabur', description: 'Traditional ayurvedic formulation with amla and 40+ herbs for enhanced immunity and vitality.', price: 350, discountedPrice: 299, dosageForm: 'Gel', packSize: '500g jar', requiresPrescription: false, inStock: true, rating: 4.6, totalReviews: 4200, uses: ['Immunity Boost', 'Energy', 'Digestion', 'Respiratory Health'], sideEffects: ['None known'] },
    { _id: 'm21', name: 'Ashwagandha Capsules', genericName: 'Withania Somnifera Extract', category: 'Ayurvedic', manufacturer: 'Himalaya', description: 'Natural adaptogen for stress relief, improved energy, better sleep, and overall wellness.', price: 250, discountedPrice: 210, dosageForm: 'Capsule', packSize: 'Bottle of 60 capsules', requiresPrescription: false, inStock: true, rating: 4.5, totalReviews: 3100, uses: ['Stress Relief', 'Energy', 'Sleep Quality', 'Muscle Strength'], sideEffects: ['Drowsiness', 'Stomach upset (rare)'] },
];

// GET /api/medicines - List medicines with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, prescription } = req.query;

        let medicines;
        try {
            const filter = { inStock: true };
            if (category && category !== 'All') filter.category = category;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { genericName: { $regex: search, $options: 'i' } },
                    { manufacturer: { $regex: search, $options: 'i' } }
                ];
            }
            if (prescription === 'true') filter.requiresPrescription = true;
            else if (prescription === 'false') filter.requiresPrescription = false;

            let sortOpt = { rating: -1 };
            if (sort === 'price-low') sortOpt = { discountedPrice: 1, price: 1 };
            else if (sort === 'price-high') sortOpt = { discountedPrice: -1, price: -1 };
            else if (sort === 'name') sortOpt = { name: 1 };
            else if (sort === 'popular') sortOpt = { totalReviews: -1 };

            medicines = await Medicine.find(filter).sort(sortOpt);
        } catch {
            medicines = [];
        }

        if (!medicines || medicines.length === 0) {
            let filtered = [...DEMO_MEDICINES];
            if (category && category !== 'All') filtered = filtered.filter(m => m.category === category);
            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(m =>
                    m.name.toLowerCase().includes(s) ||
                    m.genericName.toLowerCase().includes(s) ||
                    m.manufacturer.toLowerCase().includes(s)
                );
            }
            if (prescription === 'true') filtered = filtered.filter(m => m.requiresPrescription);
            else if (prescription === 'false') filtered = filtered.filter(m => !m.requiresPrescription);

            if (sort === 'price-low') filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
            else if (sort === 'price-high') filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
            else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
            else if (sort === 'popular') filtered.sort((a, b) => b.totalReviews - a.totalReviews);
            else filtered.sort((a, b) => b.rating - a.rating);

            medicines = filtered;
        }

        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/medicines/:id - Single medicine
router.get('/:id', async (req, res) => {
    try {
        let med;
        try { med = await Medicine.findById(req.params.id); } catch { med = null; }
        if (!med) med = DEMO_MEDICINES.find(m => m._id === req.params.id);
        if (!med) return res.status(404).json({ message: 'Medicine not found' });
        res.json(med);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/medicines/order - Place an order
router.post('/order', protect, async (req, res) => {
    try {
        const { items, deliveryAddress, phone, paymentMethod, prescriptionUrl } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        if (!deliveryAddress) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await Order.create({
            user: req.user._id,
            items: items.map(item => ({
                medicineId: item.medicineId || item._id || '',
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                dosageForm: item.dosageForm || ''
            })),
            totalAmount,
            deliveryAddress,
            phone: phone || '',
            paymentMethod: paymentMethod || 'cod',
            prescriptionUrl: prescriptionUrl || '',
            status: 'placed'
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Place order error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/medicines/orders/my - User's orders
router.get('/orders/my', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

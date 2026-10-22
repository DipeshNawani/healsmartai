import { useState, useEffect } from 'react';
import { FiSearch, FiClock, FiDroplet, FiFileText, FiX, FiCalendar, FiHome, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { initiatePayment } from '../../utils/payment';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './LabTests.css';

const CATEGORIES = [
    { name: 'All', icon: '🧪' },
    { name: 'Blood Tests', icon: '🩸' },
    { name: 'Diabetes & Metabolism', icon: '📊' },
    { name: 'Thyroid', icon: '🦋' },
    { name: 'Liver & Kidney', icon: '🫘' },
    { name: 'Imaging', icon: '📷' },
    { name: 'Cardiac Tests', icon: '❤️' },
    { name: 'Full Body Checkup', icon: '🏥' },
    { name: 'Allergy & Immunity', icon: '🤧' },
    { name: 'Infection & Fever', icon: '🤒' }
];

const TIME_SLOTS = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM'];

const LabTests = () => {
    const { user } = useAuth();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('popular');

    // Booking state
    const [selectedTest, setSelectedTest] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingSlot, setBookingSlot] = useState('');
    const [collectionType, setCollectionType] = useState('home');
    const [address, setAddress] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);

    useEffect(() => {
        fetchTests();
    }, [activeCategory, sortBy]);

    useEffect(() => {
        const timer = setTimeout(() => fetchTests(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory !== 'All') params.append('category', activeCategory);
            if (search) params.append('search', search);
            if (sortBy === 'popular') params.append('popular', 'true');
            else params.append('sort', sortBy);

            const { data } = await API.get(`/lab-tests?${params.toString()}`);
            setTests(data);
        } catch {
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    const openBooking = (test) => {
        if (!user) {
            toast.error('Please sign in to book a test');
            return;
        }
        setSelectedTest(test);
        setBookingDate('');
        setBookingSlot('');
        setCollectionType('home');
        setAddress('');
        setBookingSuccess(null);
    };

    const closeBooking = () => {
        setSelectedTest(null);
        setBookingSuccess(null);
    };

    const handleBook = async () => {
        if (!bookingDate || !bookingSlot) {
            toast.error('Please select a date and time slot');
            return;
        }
        if (collectionType === 'home' && !address.trim()) {
            toast.error('Please enter your address for home collection');
            return;
        }

        setBookingLoading(true);
        try {
            const testPrice = selectedTest.discountedPrice || selectedTest.price;

            // Step 1: Payment
            toast.loading('Processing payment...', { id: 'payment' });
            const paymentResult = await initiatePayment({
                amount: testPrice,
                description: `Lab Test: ${selectedTest.name}`,
                userName: user?.name,
                userEmail: user?.email
            });
            toast.dismiss('payment');

            if (!paymentResult.verified) {
                toast.error('Payment verification failed');
                return;
            }

            // Step 2: Book test
            const { data } = await API.post('/lab-tests/book', {
                testId: selectedTest._id,
                testName: selectedTest.name,
                date: bookingDate,
                timeSlot: bookingSlot,
                collectionType,
                address: collectionType === 'home' ? address : '',
                price: testPrice,
                paymentId: paymentResult.paymentId
            });
            setBookingSuccess(data);
            toast.success('Test booked & payment confirmed!');
        } catch (err) {
            toast.dismiss('payment');
            const msg = err.message || err.response?.data?.message || 'Booking failed';
            if (msg.includes('cancelled')) {
                toast.error('Payment was cancelled');
            } else {
                toast.error(msg);
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const getMinDate = () => new Date().toISOString().split('T')[0];

    const getDiscount = (test) => {
        if (!test.discountedPrice || test.discountedPrice >= test.price) return 0;
        return Math.round(((test.price - test.discountedPrice) / test.price) * 100);
    };

    return (
        <div className="lab-tests-page">
            <div className="lab-tests-container">
                {/* Header */}
                <div className="lab-tests-header">
                    <h1>Laboratory Tests</h1>
                    <p>Book diagnostic tests with home sample collection & fast reports</p>
                </div>

                {/* Category Chips */}
                <div className="category-chips">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.name}
                            className={`category-chip ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="lt-filters">
                    <div className="lt-search">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="lt-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="popular">Popular First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name A-Z</option>
                    </select>
                </div>

                {/* Tests Grid */}
                {loading ? (
                    <div className="no-tests">
                        <div className="empty-icon">⏳</div>
                        <h3>Loading tests...</h3>
                    </div>
                ) : tests.length === 0 ? (
                    <div className="no-tests">
                        <div className="empty-icon">🔍</div>
                        <h3>No tests found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="tests-grid">
                        {tests.map(test => (
                            <div key={test._id} className="test-card">
                                <div className="test-card-header">
                                    <h3>{test.name}</h3>
                                    {test.isPopular && <span className="popular-badge">POPULAR</span>}
                                </div>

                                <div className="test-category-badge">
                                    {CATEGORIES.find(c => c.name === test.category)?.icon} {test.category}
                                </div>

                                <p className="test-description">{test.description}</p>

                                <div className="test-meta">
                                    <div className="test-meta-item">
                                        <FiDroplet size={13} />
                                        {test.sampleType}
                                    </div>
                                    <div className="test-meta-item">
                                        <FiClock size={13} />
                                        {test.reportTime}
                                    </div>
                                    <div className="test-meta-item">
                                        <FiFileText size={13} />
                                        {test.parameters?.length || 0} parameters
                                    </div>
                                </div>

                                <div className="test-card-bottom">
                                    <div className="test-price">
                                        <span className="current">₹{test.discountedPrice || test.price}</span>
                                        {test.discountedPrice && test.discountedPrice < test.price && (
                                            <>
                                                <span className="original">₹{test.price}</span>
                                                <span className="discount">{getDiscount(test)}% OFF</span>
                                            </>
                                        )}
                                    </div>
                                    <button className="book-test-btn" onClick={() => openBooking(test)}>
                                        Book Test
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Booking Modal */}
                {selectedTest && (
                    <div className="lt-booking-overlay" onClick={(e) => e.target === e.currentTarget && closeBooking()}>
                        <div className="lt-booking-modal">
                            {bookingSuccess ? (
                                <div className="lt-success">
                                    <div className="success-icon">🧪✅</div>
                                    <h3>Test Booked!</h3>
                                    <p><span className="hl">{selectedTest.name}</span></p>
                                    <p>📅 <span className="hl">{bookingDate}</span> at <span className="hl">{bookingSlot}</span></p>
                                    <p>{collectionType === 'home' ? '🏠 Home Collection' : '🏥 Visit Lab'}</p>
                                    <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                        Report expected in {selectedTest.reportTime}
                                    </p>
                                    <button className="lt-success-btn" onClick={closeBooking}>Done</button>
                                </div>
                            ) : (
                                <>
                                    <div className="lt-modal-header">
                                        <h2>Book Test</h2>
                                        <button className="lt-modal-close" onClick={closeBooking}><FiX /></button>
                                    </div>

                                    {/* Test Summary */}
                                    <div className="lt-test-summary">
                                        <h3>{selectedTest.name}</h3>
                                        <p>{selectedTest.category} • ₹{selectedTest.discountedPrice || selectedTest.price}</p>
                                        {selectedTest.parameters?.length > 0 && (
                                            <div className="lt-params">
                                                {selectedTest.parameters.map((p, i) => (
                                                    <span key={i} className="lt-param-tag">{p}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Preparation Note */}
                                    {selectedTest.preparationInstructions && (
                                        <div className="lt-prep-note">
                                            <strong>⚠️ Preparation:</strong> {selectedTest.preparationInstructions}
                                        </div>
                                    )}

                                    {/* Collection Type */}
                                    <div className="lt-section">
                                        <label>Collection Type</label>
                                        <div className="collection-toggle">
                                            <button
                                                className={`toggle-option ${collectionType === 'home' ? 'active' : ''}`}
                                                onClick={() => setCollectionType('home')}
                                            >
                                                <span className="toggle-icon">🏠</span>
                                                Home Collection
                                            </button>
                                            <button
                                                className={`toggle-option ${collectionType === 'lab' ? 'active' : ''}`}
                                                onClick={() => setCollectionType('lab')}
                                            >
                                                <span className="toggle-icon">🏥</span>
                                                Visit Lab
                                            </button>
                                        </div>
                                        {collectionType === 'home' && (
                                            <textarea
                                                className="lt-address-input"
                                                placeholder="Enter your full address for sample collection..."
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="lt-section">
                                        <label><FiCalendar size={14} style={{ marginRight: 6 }} />Select Date</label>
                                        <input
                                            type="date"
                                            className="lt-date-input"
                                            value={bookingDate}
                                            onChange={(e) => { setBookingDate(e.target.value); setBookingSlot(''); }}
                                            min={getMinDate()}
                                        />
                                    </div>

                                    {/* Time Slots */}
                                    {bookingDate && (
                                        <div className="lt-section">
                                            <label>Select Time Slot</label>
                                            <div className="lt-slots-grid">
                                                {TIME_SLOTS.map(slot => (
                                                    <button
                                                        key={slot}
                                                        className={`lt-slot-btn ${bookingSlot === slot ? 'selected' : ''}`}
                                                        onClick={() => setBookingSlot(slot)}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm */}
                                    <button
                                        className="lt-confirm-btn"
                                        onClick={handleBook}
                                        disabled={!bookingDate || !bookingSlot || (collectionType === 'home' && !address.trim()) || bookingLoading}
                                    >
                                        {bookingLoading ? 'Booking...' : `Confirm • ₹${selectedTest.discountedPrice || selectedTest.price}`}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabTests;

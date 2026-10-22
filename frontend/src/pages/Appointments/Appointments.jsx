import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiClock, FiBriefcase, FiStar, FiX, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { initiatePayment } from '../../utils/payment';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Appointments.css';

const SPECIALIZATIONS = [
    'All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic',
    'Neurologist', 'Pediatrician', 'Gynecologist', 'ENT Specialist',
    'Ophthalmologist', 'Psychiatrist', 'Dentist', 'Pulmonologist'
];

const SPEC_ICONS = {
    'General Physician': '🩺', 'Cardiologist': '❤️', 'Dermatologist': '🧴',
    'Orthopedic': '🦴', 'Neurologist': '🧠', 'Pediatrician': '👶',
    'Gynecologist': '🤰', 'ENT Specialist': '👂', 'Ophthalmologist': '👁️',
    'Psychiatrist': '🧘', 'Dentist': '🦷', 'Pulmonologist': '🫁',
    'Gastroenterologist': '🫃', 'Oncologist': '🎗️', 'Urologist': '💧'
};

const Appointments = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeSpec, setActiveSpec] = useState('All');
    const [sortBy, setSortBy] = useState('rating');

    // Booking modal state
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingSlot, setBookingSlot] = useState('');
    const [bookingReason, setBookingReason] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);

    // Fetch doctors
    useEffect(() => {
        fetchDoctors();
    }, [activeSpec, sortBy]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeSpec !== 'All') params.append('specialization', activeSpec);
            if (search) params.append('search', search);
            params.append('sort', sortBy);

            const { data } = await API.get(`/doctors?${params.toString()}`);
            setDoctors(data);
        } catch {
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch booked slots when date changes
    useEffect(() => {
        if (selectedDoctor && bookingDate) {
            fetchBookedSlots();
        }
    }, [bookingDate, selectedDoctor]);

    const fetchBookedSlots = async () => {
        try {
            const { data } = await API.get(`/doctors/${selectedDoctor._id}/slots?date=${bookingDate}`);
            setBookedSlots(data);
        } catch {
            setBookedSlots([]);
        }
    };

    const openBooking = (doctor) => {
        if (!user) {
            toast.error('Please sign in to book an appointment');
            return;
        }
        setSelectedDoctor(doctor);
        setBookingDate('');
        setBookingSlot('');
        setBookingReason('');
        setBookedSlots([]);
        setBookingSuccess(null);
    };

    const closeBooking = () => {
        setSelectedDoctor(null);
        setBookingSuccess(null);
    };

    const handleBook = async () => {
        if (!bookingDate || !bookingSlot) {
            toast.error('Please select a date and time slot');
            return;
        }

        setBookingLoading(true);
        try {
            // Step 1: Payment
            toast.loading('Processing payment...', { id: 'payment' });
            const paymentResult = await initiatePayment({
                amount: selectedDoctor.consultationFee,
                description: `Appointment with ${selectedDoctor.name}`,
                userName: user?.name,
                userEmail: user?.email
            });
            toast.dismiss('payment');

            if (!paymentResult.verified) {
                toast.error('Payment verification failed');
                return;
            }

            // Step 2: Book appointment
            const { data } = await API.post('/doctors/book', {
                doctorId: selectedDoctor._id,
                date: bookingDate,
                timeSlot: bookingSlot,
                reason: bookingReason,
                paymentId: paymentResult.paymentId
            });
            setBookingSuccess(data);
            toast.success('Appointment booked & payment confirmed!');
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

    // Get min date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Check if date is an available day for the doctor
    const isDayAvailable = (dateStr) => {
        if (!dateStr || !selectedDoctor) return false;
        const day = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
        return selectedDoctor.availableDays?.includes(day);
    };

    return (
        <div className="appointments-page">
            <div className="appointments-container">
                {/* Header */}
                <div className="appointments-header">
                    <h1>Book an Appointment</h1>
                    <p>Find the best doctors and book your consultation instantly</p>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-search">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search doctors, hospitals, cities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="rating">Top Rated</option>
                        <option value="fee-low">Fee: Low to High</option>
                        <option value="fee-high">Fee: High to Low</option>
                        <option value="experience">Most Experienced</option>
                        <option value="name">Name A-Z</option>
                    </select>
                </div>

                {/* Specialization Pills */}
                <div className="spec-pills">
                    {SPECIALIZATIONS.map(spec => (
                        <button
                            key={spec}
                            className={`spec-pill ${activeSpec === spec ? 'active' : ''}`}
                            onClick={() => setActiveSpec(spec)}
                        >
                            {spec !== 'All' && SPEC_ICONS[spec]} {spec}
                        </button>
                    ))}
                </div>

                {/* Doctors Grid */}
                {loading ? (
                    <div className="no-doctors">
                        <div className="empty-icon">⏳</div>
                        <h3>Loading doctors...</h3>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="no-doctors">
                        <div className="empty-icon">🔍</div>
                        <h3>No doctors found</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {doctors.map(doctor => (
                            <div key={doctor._id} className="doctor-card">
                                <div className="doctor-card-top">
                                    <div className="doctor-avatar">
                                        {doctor.avatar ? (
                                            <img src={doctor.avatar} alt={doctor.name} />
                                        ) : (
                                            SPEC_ICONS[doctor.specialization] || '👨‍⚕️'
                                        )}
                                    </div>
                                    <div className="doctor-info">
                                        <h3>{doctor.name}</h3>
                                        <div className="doctor-spec">
                                            {SPEC_ICONS[doctor.specialization]} {doctor.specialization}
                                        </div>
                                        <div className="doctor-degree">{doctor.degree}</div>
                                    </div>
                                </div>

                                <div className="doctor-card-details">
                                    <div className="detail-item">
                                        <FiBriefcase size={14} />
                                        {doctor.experience} yrs exp
                                    </div>
                                    <div className="detail-item">
                                        <FiMapPin size={14} />
                                        {doctor.location?.city || 'India'}
                                    </div>
                                    <div className="detail-item">
                                        <FiClock size={14} />
                                        {doctor.hospital}
                                    </div>
                                </div>

                                <div className="doctor-card-bottom">
                                    <div>
                                        <div className="doctor-fee">
                                            ₹{doctor.consultationFee} <span>/consult</span>
                                        </div>
                                        <div className="doctor-rating">
                                            <FiStar size={14} fill="#ffd700" />
                                            {doctor.rating}
                                            <span>({doctor.totalReviews})</span>
                                        </div>
                                    </div>
                                    <button className="book-btn" onClick={() => openBooking(doctor)}>
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Booking Modal */}
                {selectedDoctor && (
                    <div className="booking-overlay" onClick={(e) => e.target === e.currentTarget && closeBooking()}>
                        <div className="booking-modal">
                            {bookingSuccess ? (
                                /* Success State */
                                <div className="booking-success">
                                    <div className="success-icon">✅</div>
                                    <h3>Appointment Confirmed!</h3>
                                    <p>
                                        <span className="detail-highlight">{selectedDoctor.name}</span>
                                    </p>
                                    <p>
                                        📅 <span className="detail-highlight">{bookingDate}</span> at{' '}
                                        <span className="detail-highlight">{bookingSlot}</span>
                                    </p>
                                    <p>🏥 {selectedDoctor.hospital}</p>
                                    <button className="success-close-btn" onClick={closeBooking}>
                                        Done
                                    </button>
                                </div>
                            ) : (
                                /* Booking Form */
                                <>
                                    <div className="booking-modal-header">
                                        <h2>Book Appointment</h2>
                                        <button className="modal-close-btn" onClick={closeBooking}>
                                            <FiX />
                                        </button>
                                    </div>

                                    <div className="modal-doctor-summary">
                                        <div className="doctor-avatar">
                                            {SPEC_ICONS[selectedDoctor.specialization] || '👨‍⚕️'}
                                        </div>
                                        <div>
                                            <h3>{selectedDoctor.name}</h3>
                                            <p>{selectedDoctor.specialization} • ₹{selectedDoctor.consultationFee}</p>
                                        </div>
                                    </div>

                                    <div className="booking-section">
                                        <label><FiCalendar size={14} style={{ marginRight: 6 }} />Select Date</label>
                                        <input
                                            type="date"
                                            className="date-input"
                                            value={bookingDate}
                                            onChange={(e) => {
                                                setBookingDate(e.target.value);
                                                setBookingSlot('');
                                            }}
                                            min={getMinDate()}
                                        />
                                        {bookingDate && !isDayAvailable(bookingDate) && (
                                            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>
                                                Doctor is not available on this day. Available: {selectedDoctor.availableDays?.join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    {bookingDate && isDayAvailable(bookingDate) && (
                                        <div className="booking-section">
                                            <label>Select Time Slot</label>
                                            <div className="slots-grid">
                                                {(selectedDoctor.availableSlots || []).map(slot => {
                                                    const isBooked = bookedSlots.includes(slot);
                                                    return (
                                                        <button
                                                            key={slot}
                                                            className={`slot-btn ${bookingSlot === slot ? 'selected' : ''}`}
                                                            onClick={() => setBookingSlot(slot)}
                                                            disabled={isBooked}
                                                        >
                                                            {slot}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="booking-section">
                                        <label>Reason for Visit (optional)</label>
                                        <textarea
                                            className="reason-input"
                                            placeholder="Describe your symptoms or reason..."
                                            value={bookingReason}
                                            onChange={(e) => setBookingReason(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        className="confirm-book-btn"
                                        onClick={handleBook}
                                        disabled={!bookingDate || !bookingSlot || !isDayAvailable(bookingDate) || bookingLoading}
                                    >
                                        {bookingLoading ? 'Booking...' : `Confirm Booking • ₹${selectedDoctor.consultationFee}`}
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

export default Appointments;

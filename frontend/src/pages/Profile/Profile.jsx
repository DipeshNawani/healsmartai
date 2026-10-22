import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiCalendar, FiShoppingBag, FiActivity, FiSettings, FiLogOut, FiSave, FiUsers, FiDownload, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { downloadICS, downloadLabTestICS } from '../../utils/calendarExport';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

const TABS = [
    { id: 'overview', label: 'Overview', icon: <FiUser size={15} /> },
    { id: 'appointments', label: 'Appointments', icon: <FiCalendar size={15} /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingBag size={15} /> },
    { id: 'lab-tests', label: 'Lab Tests', icon: <FiActivity size={15} /> },
    { id: 'family', label: 'Family', icon: <FiUsers size={15} /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings size={15} /> }
];

const ORDER_STEPS = ['placed', 'confirmed', 'dispatched', 'delivered'];

const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Profile form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [saving, setSaving] = useState(false);

    // History data
    const [appointments, setAppointments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [labBookings, setLabBookings] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [showAddFamily, setShowAddFamily] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', relation: '', age: '', gender: 'male', bloodGroup: '' });

    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setDob(user.dob || '');
            setGender(user.gender || '');
        }
    }, [user]);

    useEffect(() => {
        if (user && activeTab === 'appointments') fetchAppointments();
        if (user && activeTab === 'orders') fetchOrders();
        if (user && activeTab === 'lab-tests') fetchLabBookings();
        if (user && activeTab === 'family') fetchFamily();
    }, [activeTab, user]);

    const fetchAppointments = async () => {
        try { const { data } = await API.get('/doctors/appointments/my'); setAppointments(data); }
        catch { setAppointments([]); }
    };

    const fetchOrders = async () => {
        try { const { data } = await API.get('/medicines/orders/my'); setOrders(data); }
        catch { setOrders([]); }
    };

    const fetchLabBookings = async () => {
        try { const { data } = await API.get('/lab-tests/bookings/my'); setLabBookings(data); }
        catch { setLabBookings([]); }
    };

    const fetchFamily = async () => {
        try { const { data } = await API.get('/auth/family'); setFamilyMembers(data); }
        catch { setFamilyMembers([]); }
    };

    const addFamilyMember = async () => {
        if (!newMember.name || !newMember.relation) { toast.error('Name and relation required'); return; }
        try {
            await API.post('/auth/family', newMember);
            toast.success('Family member added!');
            setNewMember({ name: '', relation: '', age: '', gender: 'male', bloodGroup: '' });
            setShowAddFamily(false);
            fetchFamily();
        } catch { toast.error('Failed to add'); }
    };

    const removeFamilyMember = async (id) => {
        try {
            await API.delete(`/auth/family/${id}`);
            toast.success('Removed');
            fetchFamily();
        } catch { toast.error('Failed to remove'); }
    };

    const getOrderStep = (status) => ORDER_STEPS.indexOf(status || 'placed');

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile({ name, phone, address, dob, gender });
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        }
        setSaving(false);
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    // Not logged in
    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-login-prompt">
                        <div className="prompt-icon">🔐</div>
                        <h2>Sign In Required</h2>
                        <p>Please sign in to view your profile and manage your health records</p>
                        <Link to="/auth" className="login-link-btn">Sign In / Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    }

    const getInitial = () => {
        return user.name ? user.name.charAt(0).toUpperCase() : '👤';
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Hero Card */}
                <div className="profile-hero">
                    <div className="profile-avatar">
                        {user.avatar ? <img src={user.avatar} alt={user.name} /> : getInitial()}
                    </div>
                    <div className="profile-hero-info">
                        <h1>{user.name || 'User'}</h1>
                        <p className="profile-email">{user.email}</p>
                        <span className="profile-badge">✨ Heal Smart Member</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut size={14} style={{ marginRight: 4 }} /> Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* ===== OVERVIEW ===== */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="profile-stats">
                                <div className="stat-card">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-value">{appointments.length}</div>
                                    <div className="stat-label">Appointments</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🛍️</div>
                                    <div className="stat-value">{orders.length}</div>
                                    <div className="stat-label">Orders</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🧪</div>
                                    <div className="stat-value">{labBookings.length}</div>
                                    <div className="stat-label">Lab Tests</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">💚</div>
                                    <div className="stat-value">Active</div>
                                    <div className="stat-label">Health Status</div>
                                </div>
                            </div>

                            <div className="profile-form">
                                <h3>👤 Personal Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            className="form-input"
                                            type="email"
                                            value={user.email || ''}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            className="form-input"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            style={{ colorScheme: theme }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select
                                            className="form-input"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Your full address"
                                        />
                                    </div>
                                </div>
                                <button className="save-profile-btn" onClick={handleSaveProfile} disabled={saving}>
                                    <FiSave size={14} style={{ marginRight: 6 }} />
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ===== APPOINTMENTS ===== */}
                    {activeTab === 'appointments' && (
                        <div className="history-section">
                            <h3>📅 Appointment History</h3>
                            {appointments.length === 0 ? (
                                <div className="empty-history">
                                    <div className="empty-icon">📅</div>
                                    <h4>No appointments yet</h4>
                                    <p>Book your first appointment with a doctor</p>
                                    <Link to="/appointments" className="login-link-btn" style={{ marginTop: 16, display: 'inline-block' }}>
                                        Browse Doctors
                                    </Link>
                                </div>
                            ) : (
                                appointments.map((apt, i) => (
                                    <div key={apt._id || i} className="history-item">
                                        <div className="history-icon appointment">📋</div>
                                        <div className="history-info">
                                            <h4>{apt.doctorName || apt.doctor?.name || 'Doctor'}</h4>
                                            <p>{apt.doctorSpecialization || apt.doctor?.specialization || ''} • {apt.date} at {apt.timeSlot}</p>
                                        </div>
                                        <div className="history-right">
                                            <div className="amount">₹{apt.consultationFee || apt.doctor?.consultationFee || '-'}</div>
                                            <span className={`status-badge ${apt.status}`}>{apt.status?.toUpperCase()}</span>
                                            <button className="calendar-btn" onClick={() => downloadICS(apt)} title="Add to Calendar">
                                                <FiDownload size={12} /> .ics
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ===== ORDERS ===== */}
                    {activeTab === 'orders' && (
                        <div className="history-section">
                            <h3>🛍️ Order History</h3>
                            {orders.length === 0 ? (
                                <div className="empty-history">
                                    <div className="empty-icon">🛒</div>
                                    <h4>No orders yet</h4>
                                    <p>Order medicines from our store</p>
                                    <Link to="/medicines" className="login-link-btn" style={{ marginTop: 16, display: 'inline-block' }}>
                                        Browse Medicines
                                    </Link>
                                </div>
                            ) : (
                                orders.map((order, i) => {
                                    const currentStep = getOrderStep(order.status);
                                    return (
                                    <div key={order._id || i} className="history-item order-tracking">
                                        <div className="history-icon order">📦</div>
                                        <div className="history-info">
                                            <h4>{order.items?.length || 0} item(s) • ₹{order.totalAmount}</h4>
                                            <p>{order.deliveryAddress?.substring(0, 50)}</p>
                                            <div className="order-timeline">
                                                {ORDER_STEPS.map((step, si) => (
                                                    <div key={step} className={`timeline-step ${si <= currentStep ? 'done' : ''}`}>
                                                        <div className="timeline-dot" />
                                                        <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                                                        {si < ORDER_STEPS.length - 1 && <div className={`timeline-line ${si < currentStep ? 'done' : ''}`} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ===== LAB TESTS ===== */}
                    {activeTab === 'lab-tests' && (
                        <div className="history-section">
                            <h3>🧪 Lab Test Bookings</h3>
                            {labBookings.length === 0 ? (
                                <div className="empty-history">
                                    <div className="empty-icon">🧪</div>
                                    <h4>No lab tests booked</h4>
                                    <p>Book diagnostic tests with home collection</p>
                                    <Link to="/lab-tests" className="login-link-btn" style={{ marginTop: 16, display: 'inline-block' }}>
                                        Browse Tests
                                    </Link>
                                </div>
                            ) : (
                                labBookings.map((booking, i) => (
                                    <div key={booking._id || i} className="history-item">
                                        <div className="history-icon lab">🔬</div>
                                        <div className="history-info">
                                            <h4>{booking.testName}</h4>
                                            <p>{booking.date} at {booking.timeSlot} • {booking.collectionType === 'home' ? '🏠 Home' : '🏥 Lab'}</p>
                                        </div>
                                        <div className="history-right">
                                            <div className="amount" style={{ color: 'var(--accent-secondary)' }}>₹{booking.price}</div>
                                            <span className={`status-badge ${booking.status}`}>{booking.status?.replace('_', ' ').toUpperCase()}</span>
                                            <button className="calendar-btn" onClick={() => downloadLabTestICS(booking)} title="Add to Calendar">
                                                <FiDownload size={12} /> .ics
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ===== FAMILY ===== */}
                    {activeTab === 'family' && (
                        <div className="history-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3>👨‍👩‍👧‍👦 Family Members</h3>
                                <button className="login-link-btn" style={{ padding: '6px 16px', fontSize: '12px' }} onClick={() => setShowAddFamily(!showAddFamily)}>
                                    <FiPlus size={14} /> Add Member
                                </button>
                            </div>

                            {showAddFamily && (
                                <div className="add-family-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Name *</label>
                                            <input className="form-input" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Full Name" />
                                        </div>
                                        <div className="form-group">
                                            <label>Relation *</label>
                                            <select className="form-input" value={newMember.relation} onChange={e => setNewMember({...newMember, relation: e.target.value})}>
                                                <option value="">Select</option>
                                                <option value="spouse">Spouse</option>
                                                <option value="child">Child</option>
                                                <option value="parent">Parent</option>
                                                <option value="sibling">Sibling</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Age</label>
                                            <input className="form-input" type="number" value={newMember.age} onChange={e => setNewMember({...newMember, age: e.target.value})} placeholder="Age" />
                                        </div>
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <select className="form-input" value={newMember.gender} onChange={e => setNewMember({...newMember, gender: e.target.value})}>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Blood Group</label>
                                            <input className="form-input" value={newMember.bloodGroup} onChange={e => setNewMember({...newMember, bloodGroup: e.target.value})} placeholder="e.g. O+" />
                                        </div>
                                    </div>
                                    <button className="save-profile-btn" onClick={addFamilyMember} style={{ marginTop: 12 }}>
                                        <FiSave size={14} style={{ marginRight: 6 }} /> Save Member
                                    </button>
                                </div>
                            )}

                            {familyMembers.length === 0 ? (
                                <div className="empty-history">
                                    <div className="empty-icon">👨‍👩‍👧‍👦</div>
                                    <h4>No family members added</h4>
                                    <p>Add family members to book appointments on their behalf</p>
                                </div>
                            ) : (
                                familyMembers.map((m) => (
                                    <div key={m._id} className="history-item">
                                        <div className="history-icon family">👤</div>
                                        <div className="history-info">
                                            <h4>{m.name}</h4>
                                            <p>{m.relation} • {m.age ? `${m.age} yrs` : ''} {m.gender} {m.bloodGroup ? `• ${m.bloodGroup}` : ''}</p>
                                        </div>
                                        <div className="history-right">
                                            <button className="calendar-btn" onClick={() => removeFamilyMember(m._id)} title="Remove" style={{ color: 'var(--danger)' }}>
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ===== SETTINGS ===== */}
                    {activeTab === 'settings' && (
                        <>
                            <div className="settings-group">
                                <h3>🔔 Notifications</h3>
                                <div className="setting-row">
                                    <div className="setting-label">
                                        <h4>Email Notifications</h4>
                                        <p>Receive booking confirmations and health tips via email</p>
                                    </div>
                                    <button
                                        className={`toggle-switch ${emailNotif ? 'on' : ''}`}
                                        onClick={() => setEmailNotif(!emailNotif)}
                                    />
                                </div>
                                <div className="setting-row">
                                    <div className="setting-label">
                                        <h4>SMS Notifications</h4>
                                        <p>Get text reminders for appointments and deliveries</p>
                                    </div>
                                    <button
                                        className={`toggle-switch ${smsNotif ? 'on' : ''}`}
                                        onClick={() => setSmsNotif(!smsNotif)}
                                    />
                                </div>
                            </div>

                            <div className="settings-group">
                                <h3>🎨 Appearance</h3>
                                <div className="setting-row">
                                    <div className="setting-label">
                                        <h4>Dark Mode</h4>
                                        <p>Use dark theme for reduced eye strain</p>
                                    </div>
                                    <button
                                        className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}
                                        onClick={toggleTheme}
                                    />
                                </div>
                            </div>

                            <div className="settings-group">
                                <h3>🔒 Privacy & Security</h3>
                                <div className="setting-row">
                                    <div className="setting-label">
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                    <button className="toggle-switch" />
                                </div>
                                <div className="setting-row">
                                    <div className="setting-label">
                                        <h4>Data Sharing</h4>
                                        <p>Share anonymized health data for research</p>
                                    </div>
                                    <button className="toggle-switch" />
                                </div>
                            </div>

                            <div className="settings-group">
                                <h3>⚠️ Danger Zone</h3>
                                <div className="setting-row">
                                    <div className="setting-label">
                                        <h4>Delete Account</h4>
                                        <p>Permanently delete your account and all data</p>
                                    </div>
                                    <button className="logout-btn" onClick={() => toast.error('Account deletion is disabled in demo')}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

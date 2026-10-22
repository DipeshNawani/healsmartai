import { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiShoppingBag, FiActivity, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import './Admin.css';

const Admin = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await API.get('/auth/admin/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to load admin stats:', err);
        }
        setLoading(false);
    };

    if (!user) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-login"><div className="admin-login-icon">🔒</div><h2>Login Required</h2>
                    <Link to="/auth" className="btn btn-primary">Sign In</Link></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-header">
                    <h1>🛡️ Admin Dashboard</h1>
                    <p>Overview of HealSmart AI platform statistics</p>
                </div>

                {loading ? (
                    <div className="admin-loading">Loading stats...</div>
                ) : !stats ? (
                    <div className="admin-error">
                        <div className="error-icon">⚠️</div>
                        <h3>Unable to load stats</h3>
                        <p>Make sure you have admin privileges and the backend is running.</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card users">
                                <div className="stat-icon-wrap"><FiUsers size={22} /></div>
                                <div className="stat-number">{stats.users || 0}</div>
                                <div className="stat-name">Total Users</div>
                            </div>
                            <div className="admin-stat-card appointments">
                                <div className="stat-icon-wrap"><FiCalendar size={22} /></div>
                                <div className="stat-number">{stats.appointments || 0}</div>
                                <div className="stat-name">Appointments</div>
                            </div>
                            <div className="admin-stat-card orders">
                                <div className="stat-icon-wrap"><FiShoppingBag size={22} /></div>
                                <div className="stat-number">{stats.orders || 0}</div>
                                <div className="stat-name">Orders</div>
                            </div>
                            <div className="admin-stat-card tests">
                                <div className="stat-icon-wrap"><FiActivity size={22} /></div>
                                <div className="stat-number">{stats.labBookings || 0}</div>
                                <div className="stat-name">Lab Bookings</div>
                            </div>
                            <div className="admin-stat-card chats">
                                <div className="stat-icon-wrap"><FiMessageSquare size={22} /></div>
                                <div className="stat-number">{stats.chatSessions || 0}</div>
                                <div className="stat-name">AI Consultations</div>
                            </div>
                            <div className="admin-stat-card revenue">
                                <div className="stat-icon-wrap"><FiTrendingUp size={22} /></div>
                                <div className="stat-number">₹{stats.totalRevenue || 0}</div>
                                <div className="stat-name">Total Revenue</div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        {stats.recentAppointments && stats.recentAppointments.length > 0 && (
                            <div className="admin-section">
                                <h3>📅 Recent Appointments</h3>
                                <div className="admin-table">
                                    <div className="table-header">
                                        <span>Doctor</span>
                                        <span>Date</span>
                                        <span>Time</span>
                                        <span>Status</span>
                                    </div>
                                    {stats.recentAppointments.map((apt, i) => (
                                        <div key={i} className="table-row">
                                            <span>{apt.doctorName || 'Doctor'}</span>
                                            <span>{apt.date}</span>
                                            <span>{apt.timeSlot}</span>
                                            <span className={`status ${apt.status}`}>{apt.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.recentOrders && stats.recentOrders.length > 0 && (
                            <div className="admin-section">
                                <h3>📦 Recent Orders</h3>
                                <div className="admin-table">
                                    <div className="table-header">
                                        <span>Items</span>
                                        <span>Amount</span>
                                        <span>Payment</span>
                                        <span>Status</span>
                                    </div>
                                    {stats.recentOrders.map((order, i) => (
                                        <div key={i} className="table-row">
                                            <span>{order.items?.length || 0} item(s)</span>
                                            <span>₹{order.totalAmount}</span>
                                            <span>{order.paymentMethod}</span>
                                            <span className={`status ${order.status}`}>{order.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;

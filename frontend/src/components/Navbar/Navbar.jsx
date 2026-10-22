import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiCalendar, FiShoppingBag, FiLogOut, FiChevronDown, FiSun, FiMoon, FiActivity, FiHeart, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const dropdownRef = useRef(null);
    const servicesRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (servicesRef.current && !servicesRef.current.contains(e.target)) {
                setServicesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setDropdownOpen(false);
        setServicesOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isActive = (path) => location.pathname === path;

    const serviceLinks = [
        { to: '/symptom-checker', label: 'Symptom Checker' },
        { to: '/appointments', label: 'Appointments' },
        { to: '/lab-tests', label: 'Lab Tests' },
        { to: '/medicines', label: 'Medicines' },
        { to: '/health-tools', label: 'Health Tools' },
    ];

    const isServiceActive = serviceLinks.some(link => location.pathname === link.to);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">⚕</div>
                    <div className="logo-text">
                        Heal<span>Smart</span> AI
                    </div>
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                    <Link to="/ai-doctor" className={isActive('/ai-doctor') ? 'active' : ''}>AI Doctor</Link>

                    {/* Services dropdown — desktop */}
                    <div className="nav-dropdown-wrap" ref={servicesRef}>
                        <button
                            className={`nav-dropdown-trigger ${isServiceActive ? 'active' : ''}`}
                            onClick={() => setServicesOpen(!servicesOpen)}
                        >
                            Services <FiChevronDown size={14} className={servicesOpen ? 'rotated' : ''} />
                        </button>
                        {servicesOpen && (
                            <div className="nav-dropdown-menu">
                                {serviceLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={isActive(link.to) ? 'active' : ''}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile: show service links directly */}
                    <div className="mobile-service-links">
                        {serviceLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={isActive(link.to) ? 'active' : ''}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="navbar-right">
                    <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>
                    {user ? (
                        <div className="navbar-profile" ref={dropdownRef}>
                            <button className="navbar-profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <div className="avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} />
                                    ) : (
                                        getInitials(user.name)
                                    )}
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                                <FiChevronDown size={14} />
                            </button>

                            {dropdownOpen && (
                                <div className="navbar-dropdown">
                                    <Link to="/profile"><FiUser size={16} /> My Profile</Link>
                                    <Link to="/profile?tab=appointments"><FiCalendar size={16} /> My Appointments</Link>
                                    <Link to="/profile?tab=orders"><FiShoppingBag size={16} /> My Orders</Link>
                                    <Link to="/health-tools"><FiHeart size={16} /> Health Tools</Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin"><FiShield size={16} /> Admin Panel</Link>
                                    )}
                                    <div className="divider" />
                                    <button onClick={handleLogout} className="logout-btn">
                                        <FiLogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth" className="btn btn-primary" style={{ padding: '8px 24px', fontSize: '0.875rem' }}>
                            Login
                        </Link>
                    )}

                    <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

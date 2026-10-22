import { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiStar, FiPackage, FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { initiatePayment } from '../../utils/payment';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Medicines.css';

const CATEGORIES = [
    { name: 'All', icon: '💊' },
    { name: 'Pain Relief', icon: '💆' },
    { name: 'Cold & Flu', icon: '🤧' },
    { name: 'Digestive Health', icon: '🫃' },
    { name: 'Vitamins & Supplements', icon: '💪' },
    { name: 'Skin Care', icon: '🧴' },
    { name: 'Diabetes Care', icon: '📊' },
    { name: 'Heart Health', icon: '❤️' },
    { name: 'Eye & Ear Care', icon: '👁️' },
    { name: 'First Aid', icon: '🩹' },
    { name: 'Ayurvedic', icon: '🌿' },
    { name: 'Personal Care', icon: '🧼' },
    { name: 'Baby Care', icon: '👶' }
];

const DOSAGE_ICONS = {
    'Tablet': '💊', 'Capsule': '💊', 'Syrup': '🧴', 'Cream': '🧴',
    'Drops': '💧', 'Spray': '💨', 'Powder': '🥄', 'Gel': '🧴',
    'Ointment': '🧴', 'Inhaler': '💨', 'Injection': '💉'
};

const Medicines = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('rating');

    // Cart
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    useEffect(() => { fetchMedicines(); }, [activeCategory, sortBy]);
    useEffect(() => {
        const t = setTimeout(() => fetchMedicines(), 300);
        return () => clearTimeout(t);
    }, [search]);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory !== 'All') params.append('category', activeCategory);
            if (search) params.append('search', search);
            params.append('sort', sortBy);
            const { data } = await API.get(`/medicines?${params.toString()}`);
            setMedicines(data);
        } catch {
            setMedicines([]);
        } finally {
            setLoading(false);
        }
    };

    // Cart functions
    const addToCart = (med) => {
        const existing = cart.find(c => c._id === med._id);
        if (existing) {
            setCart(cart.map(c => c._id === med._id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, {
                _id: med._id,
                name: med.name,
                price: med.discountedPrice || med.price,
                quantity: 1,
                dosageForm: med.dosageForm,
                requiresPrescription: med.requiresPrescription,
                packSize: med.packSize
            }]);
        }
        toast.success(`${med.name} added to cart`);
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(c => {
            if (c._id === id) {
                const newQty = c.quantity + delta;
                return newQty > 0 ? { ...c, quantity: newQty } : c;
            }
            return c;
        }).filter(c => c.quantity > 0));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(c => c._id !== id));
    };

    const getCartQty = (id) => {
        const item = cart.find(c => c._id === id);
        return item ? item.quantity : 0;
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const placeOrder = async () => {
        if (!user) { toast.error('Please sign in to place an order'); return; }
        if (!deliveryAddress.trim()) { toast.error('Please enter delivery address'); return; }

        setOrderLoading(true);
        try {
            let paymentId = null;

            // Online payment via Razorpay
            if (paymentMethod === 'online') {
                toast.loading('Processing payment...', { id: 'payment' });
                const paymentResult = await initiatePayment({
                    amount: cartTotal,
                    description: `Medicine Order (${cart.length} items)`,
                    userName: user?.name,
                    userEmail: user?.email,
                    userPhone: phone
                });
                toast.dismiss('payment');

                if (!paymentResult.verified) {
                    toast.error('Payment verification failed');
                    return;
                }
                paymentId = paymentResult.paymentId;
            }

            const { data } = await API.post('/medicines/order', {
                items: cart.map(c => ({
                    medicineId: c._id,
                    name: c.name,
                    price: c.price,
                    quantity: c.quantity,
                    dosageForm: c.dosageForm
                })),
                deliveryAddress,
                phone,
                paymentMethod,
                paymentId
            });
            setOrderSuccess(data);
            setCart([]);
            toast.success(paymentMethod === 'online' ? 'Order placed & payment confirmed!' : 'Order placed successfully!');
        } catch (err) {
            toast.dismiss('payment');
            const msg = err.message || err.response?.data?.message || 'Failed to place order';
            if (msg.includes('cancelled')) {
                toast.error('Payment was cancelled');
            } else {
                toast.error(msg);
            }
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="medicines-page">
            <div className="medicines-container">
                {/* Header */}
                <div className="medicines-header">
                    <h1>Medicine Store</h1>
                    <p>Order medicines online - delivered to your door in 30 minutes</p>
                </div>

                {/* Category Pills */}
                <div className="med-categories">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.name}
                            className={`med-cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="med-filters">
                    <div className="med-search">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search medicines, generics, brands..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="med-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="rating">Top Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                        <option value="name">Name A-Z</option>
                    </select>
                </div>

                {/* Medicine Grid */}
                {loading ? (
                    <div className="no-medicines"><div className="empty-icon">⏳</div><h3>Loading medicines...</h3></div>
                ) : medicines.length === 0 ? (
                    <div className="no-medicines"><div className="empty-icon">🔍</div><h3>No medicines found</h3><p>Try a different search or category</p></div>
                ) : (
                    <div className="medicines-grid">
                        {medicines.map(med => {
                            const qty = getCartQty(med._id);
                            return (
                                <div key={med._id} className="med-card">
                                    {med.requiresPrescription && (
                                        <div className="med-card-badge"><span className="rx-badge">Rx</span></div>
                                    )}

                                    <div className="med-icon-area">
                                        {DOSAGE_ICONS[med.dosageForm] || '💊'}
                                    </div>

                                    <h3>{med.name}</h3>
                                    <div className="med-generic">{med.genericName}</div>
                                    <div className="med-mfr">{med.manufacturer} • {med.packSize}</div>

                                    <div className="med-tags">
                                        {(med.uses || []).slice(0, 3).map((u, i) => (
                                            <span key={i} className="med-tag">{u}</span>
                                        ))}
                                    </div>

                                    <div className="med-meta">
                                        <div className="med-meta-item">
                                            <FiStar size={12} fill="#ffd700" color="#ffd700" />
                                            {med.rating}
                                        </div>
                                        <div className="med-meta-item">
                                            <FiPackage size={12} />
                                            {med.dosageForm}
                                        </div>
                                    </div>

                                    <div className="med-card-bottom">
                                        <div className="med-price">
                                            <span className="current">₹{med.discountedPrice || med.price}</span>
                                            {med.discountedPrice && med.discountedPrice < med.price && (
                                                <span className="original">₹{med.price}</span>
                                            )}
                                        </div>

                                        {qty > 0 ? (
                                            <div className="qty-controls">
                                                <button className="qty-btn" onClick={() => updateQty(med._id, -1)}>
                                                    <FiMinus size={14} />
                                                </button>
                                                <span className="qty-count">{qty}</span>
                                                <button className="qty-btn" onClick={() => updateQty(med._id, 1)}>
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="add-cart-btn" onClick={() => addToCart(med)}>
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Floating Cart Button */}
                {cartCount > 0 && (
                    <button className="cart-float-btn" onClick={() => { setShowCart(true); setOrderSuccess(null); }}>
                        <FiShoppingCart size={18} />
                        View Cart
                        <span className="cart-badge">{cartCount}</span>
                        <span>• ₹{cartTotal}</span>
                    </button>
                )}

                {/* Cart Modal */}
                {showCart && (
                    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && setShowCart(false)}>
                        <div className="cart-modal">
                            {orderSuccess ? (
                                <div className="order-success">
                                    <div className="success-icon">🛍️✅</div>
                                    <h3>Order Placed!</h3>
                                    <p>Your medicines are on the way</p>
                                    <p>🏠 <span className="hl">{deliveryAddress}</span></p>
                                    <p>⏱️ Estimated delivery: <span className="hl">30-45 minutes</span></p>
                                    <p>💰 Total: <span className="hl">₹{orderSuccess.totalAmount}</span></p>
                                    <p>Payment: <span className="hl">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
                                    <button className="order-success-btn" onClick={() => { setShowCart(false); setOrderSuccess(null); }}>
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-header">
                                        <h2>🛒 Your Cart ({cartCount})</h2>
                                        <button className="cart-close" onClick={() => setShowCart(false)}><FiX /></button>
                                    </div>

                                    {cart.length === 0 ? (
                                        <div className="cart-empty">
                                            <div className="empty-icon">🛒</div>
                                            <p>Your cart is empty</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Cart Items */}
                                            {cart.map(item => (
                                                <div key={item._id} className="cart-item">
                                                    <div className="cart-item-icon">
                                                        {DOSAGE_ICONS[item.dosageForm] || '💊'}
                                                    </div>
                                                    <div className="cart-item-info">
                                                        <h4>{item.name}</h4>
                                                        <p>₹{item.price} × {item.quantity} • {item.packSize}</p>
                                                    </div>
                                                    <div className="cart-item-right">
                                                        <div className="item-total">₹{item.price * item.quantity}</div>
                                                        <button className="cart-remove" onClick={() => removeFromCart(item._id)}>
                                                            <FiTrash2 size={13} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Checkout */}
                                            <div className="checkout-section">
                                                <div className="checkout-total">
                                                    <span>Total</span>
                                                    <span className="total-amount">₹{cartTotal}</span>
                                                </div>

                                                <div className="checkout-field">
                                                    <label>Delivery Address *</label>
                                                    <textarea
                                                        className="checkout-input"
                                                        placeholder="Enter your full delivery address..."
                                                        value={deliveryAddress}
                                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                                    />
                                                </div>

                                                <div className="checkout-field">
                                                    <label>Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="checkout-input"
                                                        placeholder="+91 XXXXX XXXXX"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                </div>

                                                <div className="checkout-field">
                                                    <label>Payment Method</label>
                                                    <div className="payment-toggle">
                                                        <button
                                                            className={`pay-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                                                            onClick={() => setPaymentMethod('cod')}
                                                        >
                                                            💵 Cash on Delivery
                                                        </button>
                                                        <button
                                                            className={`pay-option ${paymentMethod === 'online' ? 'active' : ''}`}
                                                            onClick={() => setPaymentMethod('online')}
                                                        >
                                                            💳 Online Payment
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    className="place-order-btn"
                                                    onClick={placeOrder}
                                                    disabled={!deliveryAddress.trim() || orderLoading}
                                                >
                                                    {orderLoading ? 'Placing Order...' : `Place Order • ₹${cartTotal}`}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Medicines;

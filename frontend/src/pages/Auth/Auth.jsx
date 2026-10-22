import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { login, register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                toast.success('Welcome back!');
            } else {
                if (!formData.name.trim()) {
                    setError('Please enter your name');
                    setLoading(false);
                    return;
                }
                await register(formData.name, formData.email, formData.password);
                toast.success('Account created successfully!');
            }
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // useGoogleLogin gives us full control over the button UI
    const googleLoginHook = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch user info from Google using the access token
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();

                await googleLogin({
                    name: profile.name,
                    email: profile.email,
                    avatar: profile.picture || '',
                    googleId: profile.sub
                });

                toast.success(`Welcome, ${profile.given_name || profile.name}!`);
                navigate('/');
            } catch (err) {
                toast.error('Google login failed');
            }
        },
        onError: () => {
            toast.error('Google login failed. Please try again.');
        }
    });

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-bg-orb" />
                <div className="auth-bg-orb" />
                <div className="auth-bg-orb" />
            </div>

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <div className="auth-logo-icon">⚕</div>
                            <div>Heal<span>Smart</span> AI</div>
                        </div>
                        <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                        <p>{isLogin ? 'Sign in to access your health dashboard' : 'Join us for a healthier tomorrow'}</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Custom Google Login Button */}
                        <button
                            type="button"
                            className="auth-google-btn"
                            onClick={() => googleLoginHook()}
                        >
                            <svg className="google-icon" viewBox="0 0 48 48" width="20" height="20">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="auth-divider">or</div>

                        {error && <div className="auth-error">{error}</div>}

                        {!isLogin && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser className="input-icon" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18, pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        name="name"
                                        className="input-field"
                                        style={{ paddingLeft: 44 }}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18, pointerEvents: 'none', zIndex: 1 }} />
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field"
                                    style={{ paddingLeft: 44 }}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18, pointerEvents: 'none', zIndex: 1 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="input-field"
                                    style={{ paddingLeft: 44, paddingRight: 44 }}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 1 }}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

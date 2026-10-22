import { Link } from 'react-router-dom';
import { FiArrowRight, FiSend } from 'react-icons/fi';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1>
                                Talk to an AI doctor,<br />
                                book real ones too.
                            </h1>
                            <p>
                                Tell it your symptoms and it explains what might be going on.
                                Need a real doctor? Book one here. Need meds or a lab test?
                                That too. Everything's in one place.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/ai-doctor" className="btn btn-primary">
                                    Try the AI Doctor <FiArrowRight />
                                </Link>
                                <Link to="/appointments" className="btn btn-secondary">
                                    Browse Doctors
                                </Link>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="hero-mockup-card">
                                {/* Mockup Header */}
                                <div className="mockup-header">
                                    <div className="mockup-brand">
                                        <div className="mockup-logo-icon">⚕</div>
                                        <div className="mockup-brand-text">
                                            <div className="mockup-title">HealSmart AI</div>
                                            <div className="mockup-subtitle">AI Doctor Consultation</div>
                                        </div>
                                    </div>
                                    <div className="mockup-status-pill">
                                        <span className="pulse-dot"></span>
                                        <span>Online</span>
                                    </div>
                                </div>

                                {/* Mockup Chat Body */}
                                <div className="mockup-body">
                                    {/* User message */}
                                    <div className="mockup-msg user">
                                        <div className="mockup-bubble user">
                                            I have a throbbing headache on the right side and light sensitivity.
                                        </div>
                                    </div>

                                    {/* AI message */}
                                    <div className="mockup-msg ai">
                                        <div className="mockup-ai-avatar">🤖</div>
                                        <div className="mockup-ai-content">
                                            <div className="mockup-ai-tag">
                                                <span className="ai-name">AI Doctor</span>
                                                <span className="ai-badge">Clinical Assistant</span>
                                            </div>

                                            <div className="mockup-diagnosis-card">
                                                <div className="diag-header">
                                                    <span className="diag-badge">Assessment</span>
                                                    <h4>Migraine Symptoms Detected</h4>
                                                </div>

                                                <div className="diag-section">
                                                    <div className="diag-subheading">Symptoms Match:</div>
                                                    <ul className="diag-list">
                                                        <li>Unilateral throbbing pain & photophobia</li>
                                                        <li>Sensitivity to bright lights & sound</li>
                                                    </ul>
                                                </div>

                                                <div className="diag-section">
                                                    <div className="diag-subheading">Personalized Home Care:</div>
                                                    <ul className="diag-list">
                                                        <li>Rest in a dark, quiet room with cold compress</li>
                                                        <li>Stay well-hydrated & track potential triggers</li>
                                                    </ul>
                                                </div>

                                                {/* Interactive action buttons */}
                                                <div className="mockup-actions">
                                                    <Link to="/appointments" className="mockup-action-btn primary">
                                                        🩺 Book Neurologist
                                                    </Link>
                                                    <Link to="/medicines" className="mockup-action-btn secondary">
                                                        💊 Order Medicine
                                                    </Link>
                                                    <Link to="/lab-tests" className="mockup-action-btn secondary">
                                                        🧪 Book Lab Test
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mockup Input Footer */}
                                <div className="mockup-footer">
                                    <div className="mockup-input">
                                        <span>Type your follow-up symptoms...</span>
                                    </div>
                                    <Link to="/ai-doctor" className="mockup-send-btn" title="Open AI Doctor">
                                        <FiSend size={15} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What you can do */}
            <section className="features-section">
                <div className="container">
                    <h2>What you can do with it</h2>

                    <div className="features-list">
                        <div className="feature-row">
                            <div className="feature-number">01</div>
                            <div className="feature-body">
                                <h3>Describe your symptoms, get a clear answer</h3>
                                <p>
                                    Type what you're feeling - headache, stomach pain, a weird rash.
                                    The AI asks follow-ups, then tells you what it could be,
                                    what to try at home, and whether you should see a doctor.
                                </p>
                                <Link to="/ai-doctor" className="feature-link">
                                    Try it now <FiArrowRight />
                                </Link>
                            </div>
                        </div>

                        <div className="feature-row">
                            <div className="feature-number">02</div>
                            <div className="feature-body">
                                <h3>Book a doctor appointment online</h3>
                                <p>
                                    Pick a specialization - cardiology, dermatology, dentistry,
                                    whatever you need. See their experience and fees,
                                    choose a time slot, pay, and you're done. No phone calls.
                                </p>
                                <Link to="/appointments" className="feature-link">
                                    Find a doctor <FiArrowRight />
                                </Link>
                            </div>
                        </div>

                        <div className="feature-row">
                            <div className="feature-number">03</div>
                            <div className="feature-body">
                                <h3>Order medicines and get them delivered</h3>
                                <p>
                                    Browse by category, add what you need, and check out.
                                    Pay online or cash on delivery. Takes about two minutes.
                                </p>
                                <Link to="/medicines" className="feature-link">
                                    Browse medicines <FiArrowRight />
                                </Link>
                            </div>
                        </div>

                        <div className="feature-row">
                            <div className="feature-number">04</div>
                            <div className="feature-body">
                                <h3>Schedule a lab test</h3>
                                <p>
                                    Blood work, thyroid panels, full checkups - book online
                                    and choose between visiting the lab or home sample collection.
                                </p>
                                <Link to="/lab-tests" className="feature-link">
                                    Book a test <FiArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Numbers */}
            <section className="proof-section">
                <div className="container">
                    <div className="proof-grid">
                        <div className="proof-item">
                            <div className="proof-number">4</div>
                            <div className="proof-label">Services in one app</div>
                        </div>
                        <div className="proof-item">
                            <div className="proof-number">500+</div>
                            <div className="proof-label">Doctors across 12 specializations</div>
                        </div>
                        <div className="proof-item">
                            <div className="proof-number">24/7</div>
                            <div className="proof-label">AI doctor availability</div>
                        </div>
                        <div className="proof-item">
                            <div className="proof-number">~30s</div>
                            <div className="proof-label">Average AI response time</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-section">
                <div className="container">
                    <h2>How it works</h2>
                    <div className="how-grid">
                        <div className="how-item">
                            <span className="how-num">1</span>
                            <h3>Create a free account</h3>
                            <p>Sign up with your email or Google. Takes about 10 seconds.</p>
                        </div>
                        <div className="how-item">
                            <span className="how-num">2</span>
                            <h3>Pick what you need</h3>
                            <p>AI consultation, doctor appointment, medicine order, or lab test.</p>
                        </div>
                        <div className="how-item">
                            <span className="how-num">3</span>
                            <h3>Get it done</h3>
                            <p>Everything happens online. Pay, book, and track from your dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Try it - it's free to start</h2>
                        <p>
                            Make an account and talk to the AI doctor right now.
                            No credit card, no commitment.
                        </p>
                        <Link to="/auth" className="btn btn-primary btn-lg">
                            Get Started <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiFacebook, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3>Heal<span>Smart</span> AI</h3>
                        <p>Your AI-powered health companion. Get instant consultations, book appointments, order medicines, and manage your health — all in one place.</p>
                    </div>

                    <div className="footer-col">
                        <h4>Services</h4>
                        <Link to="/ai-doctor">AI Doctor</Link>
                        <Link to="/appointments">Book Appointment</Link>
                        <Link to="/lab-tests">Lab Tests</Link>
                        <Link to="/medicines">Medicines</Link>
                    </div>

                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="#">About Us</a>
                        <a href="#">Careers</a>
                        <a href="#">Blog</a>
                        <a href="#">Contact</a>
                    </div>

                    <div className="footer-col">
                        <h4>Support</h4>
                        <a href="#">Help Center</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">FAQs</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 HealSmart AI. All rights reserved.</p>
                    <div className="footer-socials">
                        <a href="#"><FiTwitter /></a>
                        <a href="#"><FiInstagram /></a>
                        <a href="#"><FiFacebook /></a>
                        <a href="#"><FiLinkedin /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

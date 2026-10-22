import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Landing from './pages/Landing/Landing';
import Auth from './pages/Auth/Auth';
import AiDoctorPage from './pages/AiDoctor/AiDoctor';
import AppointmentsPage from './pages/Appointments/Appointments';
import LabTestsPage from './pages/LabTests/LabTests';
import MedicinesPage from './pages/Medicines/Medicines';
import ProfilePage from './pages/Profile/Profile';
import HealthToolsPage from './pages/HealthTools/HealthTools';
import SymptomCheckerPage from './pages/SymptomChecker/SymptomChecker';
import AdminPage from './pages/Admin/Admin';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai-doctor" element={<AiDoctorPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/lab-tests" element={<LabTestsPage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/health-tools" element={<HealthToolsPage />} />
            <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

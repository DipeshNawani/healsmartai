import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('healsmartUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('healsmartUser');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('healsmartUser', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await API.post('/auth/register', { name, email, password });
        setUser(data);
        localStorage.setItem('healsmartUser', JSON.stringify(data));
        return data;
    };

    const googleLogin = async (googleData) => {
        const { data } = await API.post('/auth/google', googleData);
        setUser(data);
        localStorage.setItem('healsmartUser', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('healsmartUser');
    };

    const updateProfile = async (profileData) => {
        const { data } = await API.put('/auth/profile', profileData);
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('healsmartUser', JSON.stringify(updatedUser));
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

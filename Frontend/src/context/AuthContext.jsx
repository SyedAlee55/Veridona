import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if needed
});

// Set up interceptors once when module loads
let interceptorsConfigured = false;

const setupInterceptors = (setToken, logoutFn) => {
    if (interceptorsConfigured) return;
    interceptorsConfigured = true;

    // Axios request interceptor to add token
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            console.log('Request Interceptor - Token:', token ? 'Present' : 'Missing');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Authorization header set:', config.headers.Authorization.substring(0, 20) + '...');
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Axios response interceptor for refresh token
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    console.log('Access token expired, attempting to refresh with token:', refreshToken ? 'Present' : 'Missing');
                    const res = await axios.post('http://localhost:5000/api/auth/refresh', {
                        token: refreshToken,
                    });
                    if (res.status === 200) {
                        const { accessToken, refreshToken: newRefreshToken } = res.data;
                        console.log('Access token refreshed successfully');
                        localStorage.setItem('accessToken', accessToken);

                        // Store new refresh token if provided (Rotation)
                        if (newRefreshToken) {
                            console.log('Refresh token rotated');
                            localStorage.setItem('refreshToken', newRefreshToken);
                        }

                        setToken(accessToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Refresh token failed:', refreshError);
                    logoutFn();
                }
            }
            return Promise.reject(error);
        }
    );
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { token: refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setUser(null);
        }
    };

    // Set up interceptors once
    useEffect(() => {
        setupInterceptors(setToken, logout);
    }, []);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ ...decoded, token }); // Store minimum user info
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setToken(accessToken);
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, api }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

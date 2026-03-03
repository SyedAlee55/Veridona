import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Button, Paper } from '@mui/material';
import Navbar from '../../components/Navbar';

const DonorDashboard = () => {
    const { user, logout, api } = useAuth();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching donor data...');
                console.log('Access Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
                const res = await api.get('/donor');
                console.log('Donor data received:', res.data);
                setMessage(res.data.message);
            } catch (error) {
                console.error('Donor fetch error:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
            }
        };
        fetchData();
    }, [api]);

    return (
        <Box>
            <Navbar />
            <Box sx={{ p: 4, paddingTop: '100px' }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h3" gutterBottom color="primary">Donor Dashboard</Typography>
                    <Typography variant="h5">Welcome, {user?.username} ({user?.role})</Typography>
                    <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>Server Check: {message}</Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default DonorDashboard;

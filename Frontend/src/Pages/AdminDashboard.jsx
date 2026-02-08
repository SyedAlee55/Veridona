import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, Paper } from '@mui/material';

const AdminDashboard = () => {
    const { user, api } = useAuth(); // Removed logout
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/admin');
                setMessage(res.data.message);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [api]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f0f0f0' }}>
            <Navbar />
            <Box sx={{ p: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', border: '2px solid red' }}>
                    <Typography variant="h3" gutterBottom color="error">Admin Dashboard</Typography>
                    <Typography variant="h5">Welcome, {user?.username} ({user?.role})</Typography>
                    <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>Server Check: {message}</Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, Paper } from '@mui/material';
import Navbar from '../components/Navbar';

const ReceiverDashboard = () => {
    const { user, api } = useAuth(); // Removed logout
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/receiver');
                setMessage(res.data.message);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [api]);

    return (
        <Box>
            <Navbar />
            <Box sx={{ p: 4, paddingTop: '100px' }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: '#e0f7fa' }}>
                    <Typography variant="h3" gutterBottom color="info.main">Receiver Dashboard</Typography>
                    <Typography variant="h5">Welcome, {user?.username} ({user?.role})</Typography>
                    <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>Server Check: {message}</Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default ReceiverDashboard;

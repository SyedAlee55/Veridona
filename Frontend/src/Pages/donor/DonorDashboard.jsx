import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
                {/* <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h3" gutterBottom color="primary">Donor Dashboard</Typography>
                    <Typography variant="h5">Welcome, {user?.username} ({user?.role})</Typography>
                    <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>Server Check: {message}</Typography>
                </Paper> */}

                <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center', background: '#f5f5f5' }}>
                    <Typography variant="h4" gutterBottom>Make a Difference Today</Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Your contribution can change lives. Support our cause and help us reach more people in need.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => console.log('Donate Now Clicked')}
                        sx={{ fontSize: '1.2rem', px: 5, py: 1.5 }}
                    >
                        Donate Now
                    </Button>
                </Paper>

                <Box sx={{ mt: 6 }}>
                    <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', mb: 2 }}>Your Donations</Typography>
                    <TableContainer component={Paper} elevation={3}>
                        <Table sx={{ minWidth: 650 }} aria-label="donations table">
                            <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Amount (ETH)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { id: '0x123...abc', date: '2023-10-25', amount: '0.05', status: 'Completed' },
                                    { id: '0x456...def', date: '2023-11-02', amount: '0.10', status: 'Completed' },
                                    { id: '0x789...ghi', date: '2023-11-15', amount: '0.02', status: 'Pending' },
                                ].map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.date}
                                        </TableCell>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                        <TableCell>
                                            <span style={{
                                                color: row.status === 'Completed' ? 'green' : 'orange',
                                                fontWeight: 'bold'
                                            }}>
                                                {row.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default DonorDashboard;

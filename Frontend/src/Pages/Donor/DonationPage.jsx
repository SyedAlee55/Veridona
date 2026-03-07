import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import DonorDrawer from '../../components/DonorDrawer';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const DonationPage = () => {
    const { user, api } = useAuth();
    const [donationAmount, setDonationAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDonate = async () => {
        if (!donationAmount || donationAmount <= 0) {
            setMessage('Please enter a valid donation amount');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/donor/donate', {
                amount: parseFloat(donationAmount),
            });
            setMessage('Donation successful! Thank you for your contribution.');
            setDonationAmount('');
        } catch (error) {
            setMessage('Error processing donation: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DonorDrawer currentPage="/donor/donation">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
                    <FavoriteBorderIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#e53935' }} />
                    Make a Donation
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Donate Now
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                                Your contribution helps save lives. Every donation makes a difference.
                            </Typography>
                            <TextField
                                type="number"
                                label="Donation Amount"
                                placeholder="Enter amount"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: 'white' },
                                        '&:hover fieldset': { borderColor: 'white' },
                                    },
                                    '& .MuiOutlinedInput-input::placeholder': {
                                        color: 'rgba(255,255,255,0.7)',
                                        opacity: 1,
                                    },
                                    '& label': { color: 'white' },
                                }}
                                inputProps={{ style: { color: 'white' } }}
                            />
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleDonate}
                                disabled={loading}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#667eea',
                                    fontWeight: 'bold',
                                    '&:hover': { backgroundColor: '#f0f0f0' },
                                }}
                            >
                                {loading ? 'Processing...' : 'Donate'}
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Impact of Donations
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                                        <strong>$50</strong> - Provides blood screening
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                                        <strong>$100</strong> - Supports one blood transfusion
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                                        <strong>$500</strong> - Equips a donation center
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {message && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                            color: message.includes('Error') ? '#c62828' : '#2e7d32',
                            borderRadius: '8px',
                            border: `2px solid ${message.includes('Error') ? '#ef5350' : '#66bb6a'}`,
                        }}
                    >
                        {message}
                    </Box>
                )}
            </Box>
        </DonorDrawer>
    );
};

export default DonationPage;

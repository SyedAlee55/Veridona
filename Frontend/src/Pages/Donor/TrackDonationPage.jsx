import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Grid, LinearProgress, Chip } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DonorDrawer from '../../components/DonorDrawer';
import { useAuth } from '../../context/AuthContext';

const TrackDonationPage = () => {
    const { api } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const res = await api.get('/donor/donations');
            setDonations(res.data.donations || []);
        } catch (err) {
            setError('Error fetching donations: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'processing':
                return 'info';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getProgressValue = (status) => {
        switch (status) {
            case 'pending':
                return 33;
            case 'processing':
                return 66;
            case 'completed':
                return 100;
            default:
                return 0;
        }
    };

    return (
        <DonorDrawer currentPage="/donor/track-donation">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                    <TrackChangesIcon sx={{ mr: 2, color: '#4caf50' }} />
                    Track Your Donations
                </Typography>

                <Card elevation={3} sx={{ mb: 4, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
                    <CardContent>
                        <Typography variant="body1" sx={{ color: '#2e7d32' }}>
                            Monitor the status of your donations in real-time. See how your contributions are making a difference in the lives of blood recipients.
                        </Typography>
                    </CardContent>
                </Card>

                {error && (
                    <Card elevation={3} sx={{ mb: 3, backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: '#c62828' }}>
                                {error}
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Typography>Loading donations...</Typography>
                    </Box>
                ) : donations.length > 0 ? (
                    <Grid container spacing={3}>
                        {donations.map((donation) => (
                            <Grid item xs={12} key={donation.id}>
                                <Card elevation={2} sx={{ transition: 'all 0.3s ease', '&:hover': { elevation: 4, boxShadow: 3 } }}>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                                    ${donation.amount}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#999' }}>
                                                    {new Date(donation.date).toLocaleDateString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                                                    Status: {donation.status}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={getProgressValue(donation.status)}
                                                    sx={{
                                                        height: '8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor:
                                                                donation.status === 'completed'
                                                                    ? '#4caf50'
                                                                    : donation.status === 'processing'
                                                                        ? '#2196f3'
                                                                        : '#ff9800',
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                                <Chip
                                                    label={donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                    color={getStatusColor(donation.status)}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                        {donation.recipientName && (
                                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    <strong>Recipient:</strong> {donation.recipientName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                                                    <strong>Blood Type:</strong> {donation.bloodType || 'N/A'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                        <TrackChangesIcon sx={{ fontSize: 64, color: '#bbb', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                            No donations yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                            Start donating to see your contributions tracked here
                        </Typography>
                    </Paper>
                )}
            </Box>
        </DonorDrawer>
    );
};

export default TrackDonationPage;

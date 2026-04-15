import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DonorDrawer from '../../components/DonorDrawer';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const DonorDashboard = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
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

    const quickLinks = [
        {
            title: 'Make a Donation',
            icon: <FavoriteBorderIcon sx={{ fontSize: 48, color: '#e53935' }} />,
            description: 'Contribute to save lives',
            path: '/donor/donation',
            color: '#ffebee'
        },
        {
            title: 'Claim NFT',
            icon: <CardGiftcardIcon sx={{ fontSize: 48, color: '#f57c00' }} />,
            description: 'Get your digital certificate',
            path: '/donor/claim-nft',
            color: '#fff3e0'
        },
        {
            title: 'FAQ',
            icon: <HelpOutlineIcon sx={{ fontSize: 48, color: '#2196f3' }} />,
            description: 'Find answers',
            path: '/donor/faq',
            color: '#e3f2fd'
        },
        {
            title: 'Contact Us',
            icon: <ContactMailIcon sx={{ fontSize: 48, color: '#ff6f00' }} />,
            description: 'Get in touch',
            path: '/donor/contact',
            color: '#ffe0b2'
        },
        {
            title: 'Track Donation',
            icon: <TrackChangesIcon sx={{ fontSize: 48, color: '#4caf50' }} />,
            description: 'Monitor your impact',
            path: '/donor/track-donation',
            color: '#e8f5e9'
        },
    ];

    return (
        <DonorDrawer currentPage="/donor">
            <Box sx={{ width: '100%', p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                {/* Welcome Section */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 4,
                        background: 'linear-gradient(135deg, #151c3b 0%, #00d4ff 100%)',
                        color: 'white',
                        borderRadius: '12px',
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Welcome back, {user?.username}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Your contributions are making a real difference in saving lives. Thank you for being part of our mission.
                    </Typography>
                </Paper>

                {/* Server Status */}
                {message && (
                    <Paper elevation={2} sx={{ p: 2, mb: 4, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                        <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                            <strong>Status:</strong> {message}
                        </Typography>
                    </Paper>
                )}

                {/* Quick Links */}
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                    Quick Access
                </Typography>

                <Grid container spacing={3}>
                    {quickLinks.map((link) => (
                        <Grid item xs={12} sm={6} md={4} key={link.path}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    backgroundColor: link.color,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={() => navigate(link.path)}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                                    <Box sx={{ mb: 2 }}>
                                        {link.icon}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {link.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                        {link.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            mt: 'auto',
                                            background: 'linear-gradient(90deg, #151c3b 0%, #00d4ff 100%)',
                                            textTransform: 'none',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Go to Page
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Stats Section */}
                <Typography variant="h5" sx={{ mt: 5, mb: 3, fontWeight: 'bold', color: '#333' }}>
                    Your Impact
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                                --
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Total Donations
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f3e5f5' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 1 }}>
                                --
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Lives Impacted
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00', mb: 1 }}>
                                --
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                NFTs Earned
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 1 }}>
                                --
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Rank Badge
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </DonorDrawer>
    );
};

export default DonorDashboard;

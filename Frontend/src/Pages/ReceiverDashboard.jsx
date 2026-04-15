import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReceiverDrawer from '../components/ReceiverDrawer';
import CampaignIcon from '@mui/icons-material/Campaign';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const ReceiverDashboard = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/receiver');
                setMessage(res.data.message);
            } catch (error) {
                console.error('Receiver fetch error:', error);
            }
        };
        fetchData();
    }, [api]);

    const quickLinks = [
        {
            title: 'My Campaigns',
            icon: <CampaignIcon sx={{ fontSize: 48, color: '#0072ff' }} />,
            description: 'Manage and trigger payouts',
            path: '/receiver/campaigns',
            color: '#e3f2fd'
        },
        {
            title: 'FAQ',
            icon: <HelpOutlineIcon sx={{ fontSize: 48, color: '#2196f3' }} />,
            description: 'Find answers',
            path: '/receiver/faq',
            color: '#e8f5e9'
        },
        {
            title: 'Contact Us',
            icon: <ContactMailIcon sx={{ fontSize: 48, color: '#ff6f00' }} />,
            description: 'Get in touch',
            path: '/receiver/contact',
            color: '#ffe0b2'
        },
    ];

    return (
        <ReceiverDrawer currentPage="/receiver">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                {/* Welcome Section */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4, mb: 4,
                        background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                        color: 'white', borderRadius: '12px',
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Welcome to your Dashboard, {user?.username}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Create campaigns, track your funding progress, and request automated payouts smoothly.
                    </Typography>
                </Paper>

                {/* Server Status */}
                {message && (
                    <Paper elevation={2} sx={{ p: 2, mb: 4, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                        <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                            <strong>Server Check:</strong> {message}
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
                                    height: '100%', backgroundColor: link.color, display: 'flex',
                                    flexDirection: 'column', transition: 'all 0.3s ease', cursor: 'pointer',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 4 },
                                }}
                                onClick={() => navigate(link.path)}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                                    <Box sx={{ mb: 2 }}>{link.icon}</Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {link.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                        {link.description}
                                    </Typography>
                                    <Button
                                        variant="contained" size="small"
                                        sx={{
                                            mt: 'auto', background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
                                            textTransform: 'none', fontWeight: '600',
                                        }}
                                    >
                                        Open
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </ReceiverDrawer>
    );
};

export default ReceiverDashboard;

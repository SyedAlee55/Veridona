import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Card, CardContent, Grid, Alert } from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DonorDrawer from '../../components/DonorDrawer';
import { useAuth } from '../../context/AuthContext';

const ContactPage = () => {
    const { api } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setResponseMessage('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/donor/contact', formData);
            setResponseMessage('Your message has been sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setResponseMessage('Error sending message: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DonorDrawer currentPage="/donor/contact">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                    <ContactMailIcon sx={{ mr: 2, color: '#ff6f00' }} />
                    Contact Us
                </Typography>

                <Grid container spacing={4}>
                    {/* Contact Form */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                Send us a Message
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    multiline
                                    rows={5}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 3,
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        fontWeight: 'bold',
                                        py: 1.5,
                                    }}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>

                            {responseMessage && (
                                <Alert
                                    severity={responseMessage.includes('Error') ? 'error' : 'success'}
                                    sx={{ mt: 2 }}
                                >
                                    {responseMessage}
                                </Alert>
                            )}
                        </Paper>
                    </Grid>

                    {/* Contact Information */}
                    <Grid item size={12}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <EmailIcon sx={{ color: '#667eea', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Email
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                support@veridona.com
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card elevation={3}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <PhoneIcon sx={{ color: '#667eea', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Phone
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                +1 (555) 123-4567
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card elevation={3}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <LocationOnIcon sx={{ color: '#667eea', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Address
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                123 Donation Center Drive<br />
                                                Healthcare City, HC 12345
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card elevation={3} sx={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
                                <CardContent>
                                    <Typography variant="body2" sx={{ color: '#1565c0' }}>
                                        <strong>Response Time:</strong> We aim to respond to all inquiries within 24 hours during business days.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </DonorDrawer>
    );
};

export default ContactPage;

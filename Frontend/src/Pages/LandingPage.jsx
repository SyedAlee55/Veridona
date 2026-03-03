import React from "react";
import { Container, Grid, Typography, Box, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Navbar from "../components/Navbar";
import helpingPoorImage from "../assets/helpingPoor.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Box
        sx={{ pt: 12, pb: 8, backgroundColor: "#f5f5f5", minHeight: "100vh" }}
      >
        <Grid container sx={{justifyContent: "center", alignItems: "center",}}>
            <Grid container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    {/* Left Grid - About Veridona */}
                    <Grid item size={{xs: 12, sm: 6}}>
                        <Paper
                            elevation={3}
                            sx={{
                                padding: { xs: 2, sm: 3, md: 4 },
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <VolunteerActivismIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                                    Veridona
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
                                Veridona is a decentralized platform dedicated to connecting generous donors with those in need. 
                                Our mission is to revolutionize charitable giving by leveraging blockchain technology to ensure 
                                transparency, security, and direct impact.
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
                                We believe that every contribution matters. Through our innovative platform, donors can track their 
                                donations in real-time, while recipients receive support with complete transparency and trust. Together, 
                                we're building a more compassionate world.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: 'white',
                                        color: '#667eea',
                                        fontWeight: 'bold',
                                        '&:hover': { backgroundColor: '#f0f0f0' }
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    Learn More
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Grid - Image */}
                    <Grid item size={{xs: 12, sm: 6}}>
                        <Box
                            component="img"
                            src={helpingPoorImage}
                            alt="Helping people in need"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 2,
                                boxShadow: 3,
                                objectFit: 'cover',
                                minHeight: { xs: '300px', sm: '400px', md: '500px' }
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Features Section */}
                <Grid container spacing={3} sx={{ mt: 4 }}>
                    <Grid item size={{xs: 12, sm: 6, md: 4}}>
                        <Paper
                            sx={{
                                padding: 3,
                                textAlign: 'center',
                                borderRadius: 2,
                                boxShadow: 1,
                                '&:hover': { boxShadow: 4, transform: 'translateY(-5px)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <VolunteerActivismIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Transparent Giving
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Track every donation with blockchain verification for complete transparency
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item size={{xs: 12, sm: 6, md: 4}}>
                        <Paper
                            sx={{
                                padding: 3,
                                textAlign: 'center',
                                borderRadius: 2,
                                boxShadow: 1,
                                '&:hover': { boxShadow: 4, transform: 'translateY(-5px)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <VolunteerActivismIcon sx={{ fontSize: 40, color: '#764ba2', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Direct Impact
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Your contributions go directly to those who need them most
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item size={{xs: 12, sm: 6, md: 4}}>
                        <Paper
                            sx={{
                                padding: 3,
                                textAlign: 'center',
                                borderRadius: 2,
                                boxShadow: 1,
                                '&:hover': { boxShadow: 4, transform: 'translateY(-5px)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <VolunteerActivismIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Secure & Trusted
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Built on blockchain technology for maximum security and trust
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default LandingPage;

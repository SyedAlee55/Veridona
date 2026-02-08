import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'; // Assuming this icon is suitable for Veridona

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDashboardClick = () => {
        if (user) {
            if (user.role === 'donor') navigate('/donor');
            else if (user.role === 'receiver') navigate('/receiver');
            else if (user.role === 'admin') navigate('/admin');
        } else {
            navigate('/');
        }
    };

    return (
        <Box sx={{ flexGrow: 1, mb: 2, position: 'fixed', width: '100%' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <VolunteerActivismIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/')}>
                        Veridona
                    </Typography>

                    {user && (
                        <>
                            <Button color="inherit" onClick={handleDashboardClick}>Dashboard</Button>
                            <Button color="inherit" onClick={handleLogout} sx={{ ml: 1, border: '1px solid rgba(255,255,255,0.3)' }}>Logout</Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;

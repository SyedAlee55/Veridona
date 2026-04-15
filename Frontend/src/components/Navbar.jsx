import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
 // Assuming this icon is suitable for Veridona

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
            <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #151c3b 0%, #00d4ff 100%)' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <Box component="img" src="/Veridona.png" alt="Veridona Logo" sx={{ width: 32, height: 32 }} />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/')}>
                        Veridona
                    </Typography>

                    {/* <Button color="inherit" onClick={() => navigate('/')} sx={{ fontWeight: '500' }}>Home</Button> */}
                    
                    {user ? (
                        <>
                            <Button color="inherit" sx={{ fontWeight: '500', ml: 1 }}>
                                {user.username}
                            </Button>
                            <Button color="inherit" onClick={handleDashboardClick} sx={{ ml: 1 }}>Dashboard</Button>
                            <Button color="inherit" onClick={handleLogout} sx={{ ml: 1, border: '1px solid rgba(255,255,255,0.3)' }}>Logout</Button>
                        </>
                    ) : (
                        <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: '500' }}>Login</Button>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;

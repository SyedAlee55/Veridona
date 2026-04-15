import React, { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, IconButton, Typography,
    List, ListItem, ListItemIcon, ListItemText, Divider,
    useTheme, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import CampaignIcon from '@mui/icons-material/Campaign';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 280;

const ReceiverDrawer = ({ children, currentPage }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { label: 'Home', icon: <HomeIcon />, path: '/receiver' },
        { label: 'My Campaigns', icon: <CampaignIcon />, path: '/receiver/campaigns' },
        { label: 'FAQ', icon: <HelpOutlineIcon />, path: '/receiver/faq' },
        { label: 'Contact Us', icon: <ContactMailIcon />, path: '/receiver/contact' },
    ];

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo Section */}
            <Box
                sx={{
                    p: 2, display: 'flex', alignItems: 'center', gap: 1,
                    background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
                    color: 'white', cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
            >
                <Box component="img" src="/Veridona.png" alt="Veridona Logo" sx={{ width: 32, height: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Veridona Receiver
                </Typography>
            </Box>

            <Divider />

            {/* User Info */}
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Welcome
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', mt: 0.5 }}>
                    {user?.username}
                </Typography>
            </Box>

            <Divider />

            {/* Menu Items */}
            <List sx={{ flex: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.path}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setMobileOpen(false);
                        }}
                        sx={{
                            backgroundColor: currentPage === item.path ? '#e3f2fd' : 'transparent',
                            borderLeft: currentPage === item.path ? '4px solid #0072ff' : 'none',
                            paddingLeft: currentPage === item.path ? '12px' : '16px',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            color: currentPage === item.path ? '#0072ff' : 'inherit',
                        }}
                    >
                        <ListItemIcon sx={{ color: currentPage === item.path ? '#0072ff' : 'inherit', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontWeight: currentPage === item.path ? '600' : '500', fontSize: '0.95rem' }}
                        />
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Logout Button */}
            <ListItem
                button
                onClick={handleLogout}
                sx={{
                    m: 1, backgroundColor: '#ffebee', borderRadius: '8px', color: '#c62828',
                    '&:hover': { backgroundColor: '#ffcdd2' },
                }}
            >
                <ListItemIcon sx={{ color: '#c62828', minWidth: 40 }}>
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: '600', fontSize: '0.95rem' }} />
            </ListItem>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {isMobile && (
                <AppBar position="fixed" sx={{ background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                            Veridona
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', backgroundColor: '#fff', borderRight: '1px solid #e0e0e0' } }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {isMobile && (
                <Drawer
                    variant="temporary" anchor="left" open={mobileOpen} onClose={handleDrawerToggle}
                    sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, sm: `0px` }, mt: { xs: '64px', sm: 0 }, width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                {children}
            </Box>
        </Box>
    );
};

export default ReceiverDrawer;

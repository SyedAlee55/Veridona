import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'; // Assuming this icon is suitable for Veridona

const drawerWidth = 240;

const Navbar = (props) => {
    const { window } = props;
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

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

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Veridona
            </Typography>
            <Divider />
            <List>
                {user && (
                    <>
                        {(() => {
                            const roleButtons = {
                                donor: (
                                    <>
                                        <ListItem disablePadding>
                                            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate('/donor')}>
                                                <ListItemText primary="Dashboard" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => console.log("Connect Metamask Clicked")}>
                                                <ListItemText primary="Connect Metamask" sx={{ color: '#ff9800' }} />
                                            </ListItemButton>
                                        </ListItem>
                                    </>
                                ),
                                receiver: (
                                    <ListItem disablePadding>
                                        <ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate('/receiver')}>
                                            <ListItemText primary="Dashboard" />
                                        </ListItemButton>
                                    </ListItem>
                                ),
                                admin: (
                                    <ListItem disablePadding>
                                        <ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate('/admin')}>
                                            <ListItemText primary="Dashboard" />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            };
                            return roleButtons[user.role] || (
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ textAlign: 'center' }} onClick={handleDashboardClick}>
                                        <ListItemText primary="Dashboard" />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })()}
                        <ListItem disablePadding>
                            <ListItemButton sx={{ textAlign: 'center' }} onClick={handleLogout}>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar component="nav" position="sticky" sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="logo"
                        sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
                    >
                        <VolunteerActivismIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'block', sm: 'block' }, cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => navigate('/')}
                    >
                        Veridona
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {user && (
                            <>
                                {(() => {
                                    const roleButtons = {
                                        donor: (
                                            <>
                                                <Button color="inherit" onClick={() => navigate('/donor')}>Dashboard</Button>
                                                <Button
                                                    color="inherit"
                                                    onClick={() => console.log("Connect Metamask Clicked")}
                                                    sx={{ ml: 1, border: '1px solid #ff9800', color: '#ff9800' }}
                                                >
                                                    Connect Metamask
                                                </Button>
                                            </>
                                        ),
                                        receiver: (
                                            <Button color="inherit" onClick={() => navigate('/receiver')}>Dashboard</Button>
                                        ),
                                        admin: (
                                            <Button color="inherit" onClick={() => navigate('/admin')}>Dashboard</Button>
                                        )
                                    };
                                    return roleButtons[user.role] || <Button color="inherit" onClick={handleDashboardClick}>Dashboard</Button>;
                                })()}
                                <Button color="inherit" onClick={handleLogout} sx={{ ml: 1, border: '1px solid rgba(255,255,255,0.3)' }}>Logout</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    );
};

export default Navbar;

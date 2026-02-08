
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton, InputAdornment, MenuItem } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
});

const SignupSchema = Yup.object().shape({
    username: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Too Short!').required('Required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    role: Yup.string().oneOf(['donor', 'receiver'], 'Invalid Role').required('Required'),
});

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const { login, register, user } = useAuth();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrorMsg('');
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    useEffect(() => {
        if (user) {
            if (user.role === 'donor') navigate('/donor');
            else if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'receiver') navigate('/receiver');
        }
    }, [user, navigate]);

    const loginFormik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            setErrorMsg('');
            const result = await login(values.email, values.password);
            if (!result.success) {
                setErrorMsg(result.message);
            }
        },
    });

    const signupFormik = useFormik({
        initialValues: { username: '', email: '', password: '', confirmPassword: '', role: 'donor' },
        validationSchema: SignupSchema,
        onSubmit: async (values) => {
            setErrorMsg('');
            const data = values;
            console.log(data)
            const result = await register(data);
            if (result.success) {
                setIsLogin(true); // Switch to login after successful signup
                alert('Registration successful! Please login.');
            } else {
                setErrorMsg(result.message);
            }
        },
    });

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column', // Changed to column to stack Navbar and Content
                height: '100vh',
                width: '100vw',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Navbar />

            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Paper
                    elevation={10}
                    sx={{
                        padding: 4,
                        width: 400,
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                                    Welcome Back
                                </Typography>
                                {errorMsg && <Typography color="error" align="center">{errorMsg}</Typography>}
                                <form onSubmit={loginFormik.handleSubmit}>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email"
                                        margin="normal"
                                        value={loginFormik.values.email}
                                        onChange={loginFormik.handleChange}
                                        error={loginFormik.touched.email && Boolean(loginFormik.errors.email)}
                                        helperText={loginFormik.touched.email && loginFormik.errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        margin="normal"
                                        value={loginFormik.values.password}
                                        onChange={loginFormik.handleChange}
                                        error={loginFormik.touched.password && Boolean(loginFormik.errors.password)}
                                        helperText={loginFormik.touched.password && loginFormik.errors.password}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        fullWidth
                                        type="submit"
                                        sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                                    >
                                        Login
                                    </Button>
                                    <Typography align="center" variant="body2">
                                        Don't have an account?{' '}
                                        <Button onClick={toggleMode} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                                            Sign Up
                                        </Button>
                                    </Typography>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="secondary">
                                    Create Account
                                </Typography>
                                {errorMsg && <Typography color="error" align="center">{errorMsg}</Typography>}
                                <form onSubmit={signupFormik.handleSubmit}>
                                    <TextField
                                        fullWidth
                                        id="username"
                                        name="username"
                                        label="Username"
                                        margin="normal"
                                        value={signupFormik.values.username}
                                        onChange={signupFormik.handleChange}
                                        error={signupFormik.touched.username && Boolean(signupFormik.errors.username)}
                                        helperText={signupFormik.touched.username && signupFormik.errors.username}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email"
                                        margin="normal"
                                        value={signupFormik.values.email}
                                        onChange={signupFormik.handleChange}
                                        error={signupFormik.touched.email && Boolean(signupFormik.errors.email)}
                                        helperText={signupFormik.touched.email && signupFormik.errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        select
                                        id="role"
                                        name="role"
                                        label="Role"
                                        margin="normal"
                                        value={signupFormik.values.role}
                                        onChange={signupFormik.handleChange}
                                        error={signupFormik.touched.role && Boolean(signupFormik.errors.role)}
                                        helperText={signupFormik.touched.role && signupFormik.errors.role}
                                    >
                                        <MenuItem value="donor">Donor</MenuItem>
                                        <MenuItem value="receiver">Receiver</MenuItem>
                                    </TextField>

                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        margin="normal"
                                        value={signupFormik.values.password}
                                        onChange={signupFormik.handleChange}
                                        error={signupFormik.touched.password && Boolean(signupFormik.errors.password)}
                                        helperText={signupFormik.touched.password && signupFormik.errors.password}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        margin="normal"
                                        value={signupFormik.values.confirmPassword}
                                        onChange={signupFormik.handleChange}
                                        error={signupFormik.touched.confirmPassword && Boolean(signupFormik.errors.confirmPassword)}
                                        helperText={signupFormik.touched.confirmPassword && signupFormik.errors.confirmPassword}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        fullWidth
                                        type="submit"
                                        sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                                    >
                                        Sign Up
                                    </Button>
                                    <Typography align="center" variant="body2">
                                        Already have an account?{' '}
                                        <Button onClick={toggleMode} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                                            Login
                                        </Button>
                                    </Typography>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Paper>
            </Box>
        </Box>
    );
};

export default LoginSignup;
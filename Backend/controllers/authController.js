const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const validateRegister = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('donor', 'receiver').required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    return schema.validate(data);
};

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
};

exports.register = async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already exists' });

        user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already exists' });

        const newUser = new User({ username, email, password, role });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refreshsecret', { expiresIn: '7d' });

        // Store refresh token in RefreshToken collection
        await new RefreshToken({
            token: refreshToken,
            user: user.id
        }).save();

        console.log('User logged in successfully:', user.email);
        console.log('Refresh token stored in dedicated collection');

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const existingToken = await RefreshToken.findOne({ token });

        // If token is not found in DB but is valid signature-wise, it might be a reused token (security breach)
        if (!existingToken) {
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refreshsecret', async (err, decoded) => {
                if (!err && decoded) {
                    // Possible token reuse detection - invalidate all tokens for this user
                    console.warn(`[Security] Token reuse detected for user ID: ${decoded.id}`);
                    // await RefreshToken.deleteMany({ user: decoded.id }); 
                }
            });
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refreshsecret', async (err, decoded) => {
            if (err) {
                // If token is expired or invalid signature
                await RefreshToken.findByIdAndDelete(existingToken._id); // Clear invalid token
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Token is valid - ROTATE IT
            const payload = { id: user.id, role: user.role };
            const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
            const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refreshsecret', { expiresIn: '7d' });

            // Delete old token
            await RefreshToken.findByIdAndDelete(existingToken._id);

            // Create new token
            await new RefreshToken({
                token: newRefreshToken,
                user: user.id
            }).save();

            console.log('Token rotated successfully for user:', user.email);

            res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        });
    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    const { token } = req.body;

    // Even if no token provided, we just send success to clear frontend state
    if (!token) return res.status(200).json({ message: 'Logged out successfully' });

    try {
        const deletedToken = await RefreshToken.findOneAndDelete({ token });
        if (deletedToken) {
            console.log('User logged out, refresh token revoked');
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

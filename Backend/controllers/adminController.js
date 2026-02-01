// Controller for admin-specific operations
exports.getAdminDashboard = async (req, res) => {
    try {
        res.json({
            message: `Hello ${req.user.role}`,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add more admin-specific operations here
exports.getAllUsers = async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find().select('-password -refreshToken');
        res.json({
            message: 'All users',
            users
        });
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

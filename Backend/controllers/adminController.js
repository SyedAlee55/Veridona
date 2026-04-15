const User = require('../models/User');
const ReceiverApplication = require('../models/ReceiverApplication');

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

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken');
        res.json({ message: 'All users', users });
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all pending receiver applications
exports.getPendingApplications = async (req, res) => {
    try {
        const apps = await ReceiverApplication.find({ status: 'pending' })
            .populate('user', 'username email walletAddress');
        res.json({ applications: apps });
    } catch (err) {
        console.error('Get applications error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve a receiver application in DB (on-chain call happens from frontend)
exports.approveApplication = async (req, res) => {
    try {
        const { applicationId } = req.body;
        const app = await ReceiverApplication.findById(applicationId).populate('user');
        if (!app) return res.status(404).json({ message: 'Application not found' });

        app.status = 'approved';
        await app.save();

        res.json({ message: 'Application approved', walletAddress: app.user.walletAddress });
    } catch (err) {
        console.error('Approve application error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reject a receiver application
exports.rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.body;
        const app = await ReceiverApplication.findByIdAndUpdate(
            applicationId,
            { status: 'rejected' },
            { new: true }
        );
        if (!app) return res.status(404).json({ message: 'Application not found' });
        res.json({ message: 'Application rejected' });
    } catch (err) {
        console.error('Reject application error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

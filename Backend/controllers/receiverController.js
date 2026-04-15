const ReceiverApplication = require('../models/ReceiverApplication');

// Controller for receiver-specific operations
exports.getReceiverDashboard = async (req, res) => {
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
        console.error('Receiver dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReceiverProfile = async (req, res) => {
    try {
        // Fetch receiver-specific profile information
        res.json({
            message: 'Receiver profile',
            user: req.user
        });
    } catch (err) {
        console.error('Receiver profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitVerification = async (req, res) => {
    try {
        const { orgName, taxId, documentUrl, walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required for verification.' });
        }
        
        // Update user's wallet address if not already set or changed
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { walletAddress });
        
        // Ensure no existing pending or approved application
        const existingApp = await ReceiverApplication.findOne({ user: req.user._id });
        if (existingApp && existingApp.status !== 'rejected') {
            return res.status(400).json({ message: 'Application already exists' });
        }

        const app = new ReceiverApplication({
            user: req.user._id,
            orgName,
            taxId,
            documentUrl,
            walletAddress
        });

        await app.save();
        res.status(201).json({ message: 'Verification application submitted', application: app });
    } catch (err) {
        console.error('Submit verification error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getVerificationStatus = async (req, res) => {
    try {
        const application = await ReceiverApplication.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        if (!application) {
            return res.json({ status: 'none' });
        }
        res.json({ status: application.status, documentUrl: application.documentUrl, orgName: application.orgName });
    } catch (err) {
        console.error('Get verification status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

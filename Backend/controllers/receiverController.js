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

// Add more receiver-specific operations here
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

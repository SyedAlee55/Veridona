const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['donor', 'receiver', 'admin'],
        required: true,
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple missing values
    },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

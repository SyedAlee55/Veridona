const mongoose = require('mongoose');

const ReceiverApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orgName: {
        type: String,
        required: true,
    },
    taxId: {
        type: String,
        required: true,
    },
    documentUrl: {
        type: String,
        required: true,
    },
    walletAddress: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('ReceiverApplication', ReceiverApplicationSchema);

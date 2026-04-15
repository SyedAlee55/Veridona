const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes here require JWT authentication and admin role
router.use(authenticateJWT, authorizeRole('admin'));

// Admin dashboard
router.get('/dashboard', adminController.getAdminDashboard);

// Get all users (admin only)
router.get('/users', adminController.getAllUsers);

// Receiver verification queue
router.get('/applications', adminController.getPendingApplications);
router.post('/applications/approve', adminController.approveApplication);
router.post('/applications/reject', adminController.rejectApplication);

module.exports = router;

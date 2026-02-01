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

// Add more admin-specific routes here
// router.delete('/users/:id', adminController.deleteUser);
// router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;

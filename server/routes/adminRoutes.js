const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUser, updateUser, deleteUser,
  getAllProperties, approveProperty, getAnalytics, toggleFeature,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// Users
router.get('/users', ...adminOnly, getAllUsers);
router.get('/users/:id', ...adminOnly, getUser);
router.put('/users/:id', ...adminOnly, updateUser);
router.delete('/users/:id', ...adminOnly, deleteUser);

// Properties
router.get('/properties', ...adminOnly, getAllProperties);
router.put('/properties/:id/approve', ...adminOnly, approveProperty);
router.put('/properties/:id/feature', ...adminOnly, toggleFeature);

// Analytics
router.get('/analytics', ...adminOnly, getAnalytics);

module.exports = router;

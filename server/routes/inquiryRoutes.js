// routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendInquiry, getInquiries, updateInquiryStatus, getMyInquiries, addReply, markAsRead,
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, sendInquiry);
router.get('/', protect, authorize('agent', 'admin'), getInquiries);
router.get('/my', protect, getMyInquiries);
router.put('/:id', protect, authorize('agent', 'admin'), updateInquiryStatus);
router.put('/:id/read', protect, authorize('agent', 'admin'), markAsRead);
router.post('/:id/reply', protect, authorize('agent', 'admin'), addReply);

module.exports = router;
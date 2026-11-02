const express = require('express');
const router = express.Router();
const {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, getMyProperties, deletePropertyImage,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProperties);
router.get('/my-properties', protect, authorize('agent', 'admin'), getMyProperties);
router.get('/:id', getProperty);

router.post('/', protect, authorize('agent', 'admin'), upload.array('images', 10), createProperty);
router.put('/:id', protect, authorize('agent', 'admin'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorize('agent', 'admin'), deleteProperty);
router.delete('/:id/images/:imageId', protect, authorize('agent', 'admin'), deletePropertyImage);

module.exports = router;

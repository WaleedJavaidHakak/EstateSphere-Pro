const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: users.length, total, pages: Math.ceil(total / parseInt(limit)), users });
  } catch (err) { next(err); }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc    Update user (role, status, approval)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, isApproved } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive, isApproved },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin users' });

    // Delete user's properties and their images
    const properties = await Property.find({ agent: req.params.id });
    for (const prop of properties) {
      if (prop.images?.length) {
        await Promise.all(prop.images.map((img) => img.public_id && cloudinary.uploader.destroy(img.public_id)));
      }
      await prop.deleteOne();
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

// @desc    Get all properties (admin)
// @route   GET /api/admin/properties
// @access  Private (Admin)
exports.getAllProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isApproved } = req.query;
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [properties, total] = await Promise.all([
      Property.find(query).populate('agent', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Property.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: properties.length, total, pages: Math.ceil(total / parseInt(limit)), properties });
  } catch (err) { next(err); }
};

// @desc    Approve/unapprove property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private (Admin)
exports.approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true }
    );
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, property });
  } catch (err) { next(err); }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) };
    }).reverse();

    const [totalUsers, totalAgents, totalProperties, totalInquiries, pendingAgents] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' }),
      Property.countDocuments(),
      Inquiry.countDocuments(),
      User.countDocuments({ role: 'agent', isApproved: false }),
    ]);

    // Monthly properties
    const monthlyProperties = await Promise.all(
      last6Months.map(async ({ year, month, label }) => {
        const count = await Property.countDocuments({
          createdAt: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1),
          },
        });
        return { label, count };
      })
    );

    // Monthly users
    const monthlyUsers = await Promise.all(
      last6Months.map(async ({ year, month, label }) => {
        const count = await User.countDocuments({
          createdAt: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
        });
        return { label, count };
      })
    );

    // Property type distribution
    const typeStats = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent properties
    const recentProperties = await Property.find().sort({ createdAt: -1 }).limit(5).populate('agent', 'name');

    // Recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalAgents, totalProperties, totalInquiries, pendingAgents },
      monthlyProperties,
      monthlyUsers,
      typeStats,
      recentProperties,
      recentUsers,
    });
  } catch (err) { next(err); }
};

// @desc    Toggle featured property
// @route   PUT /api/admin/properties/:id/feature
// @access  Private (Admin)
exports.toggleFeature = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    property.isFeatured = !property.isFeatured;
    await property.save();
    res.status(200).json({ success: true, property });
  } catch (err) { next(err); }
};

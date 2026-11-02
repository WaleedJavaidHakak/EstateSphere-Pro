const Favorite = require('../models/Favorite');
const User = require('../models/User');

// @desc    Add to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    const existing = await Favorite.findOne({ user: req.user.id, property: propertyId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Property already in favorites' });
    }

    const favorite = await Favorite.create({ user: req.user.id, property: propertyId });

    // Update user favorites array
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: propertyId } });

    res.status(201).json({ success: true, message: 'Added to favorites', favorite });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      property: req.params.propertyId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: req.params.propertyId } });

    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'property',
        populate: { path: 'agent', select: 'name avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: favorites.length, favorites });
  } catch (err) {
    next(err);
  }
};

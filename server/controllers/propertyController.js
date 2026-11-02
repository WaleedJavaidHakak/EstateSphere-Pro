
const Property = require('../models/Property');
const { cloudinary } = require('../config/cloudinary');

// Upload image buffer directly to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'realestate',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });

// @desc    Get all properties with filters & pagination
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      keyword, city, type, status, bedrooms, bathrooms,
      minPrice, maxPrice, sort, page = 1, limit = 9, featured,
    } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'location.city': { $regex: keyword, $options: 'i' } },
        { 'location.address': { $regex: keyword, $options: 'i' } },
      ];
    }

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (type) query.type = type;
    if (status) query.status = status;
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: parseInt(bathrooms) };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (featured === 'true') query.isFeatured = true;
    query.isApproved = true;

    // Sort
    let sortOption = { createdAt: -1 };

    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('agent', 'name email avatar phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      properties,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'name email avatar phone bio role');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Increment views
    await Property.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });

    // Related properties
    const related = await Property.find({
      _id: { $ne: property._id },
      'location.city': property.location.city,
      type: property.type,
      isApproved: true,
    })
      .limit(3)
      .populate('agent', 'name avatar')
      .lean();

    res.status(200).json({
      success: true,
      property,
      related,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Agent, Admin)
exports.createProperty = async (req, res, next) => {
  try {
    const body = { ...req.body };
    body.agent = req.user.id;

    if (typeof body.location === 'string') {
      body.location = JSON.parse(body.location);
    }

    if (typeof body.features === 'string') {
      body.features = JSON.parse(body.features);
    }

    if (typeof body.amenities === 'string') {
      body.amenities = JSON.parse(body.amenities);
    }

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      body.images = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);

          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );
    }

    const property = await Property.create(body);
    await property.populate('agent', 'name email avatar');

    res.status(201).json({
      success: true,
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent who owns it, Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check ownership
    if (
      property.agent.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property',
      });
    }

    const body = { ...req.body };

    if (typeof body.location === 'string') {
      body.location = JSON.parse(body.location);
    }

    if (typeof body.features === 'string') {
      body.features = JSON.parse(body.features);
    }

    if (typeof body.amenities === 'string') {
      body.amenities = JSON.parse(body.amenities);
    }

    // Upload new images to Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);

          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );

      body.images = [...(property.images || []), ...newImages];
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('agent', 'name email avatar');

    res.status(200).json({
      success: true,
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent who owns it, Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (
      property.agent.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      await Promise.all(
        property.images.map((img) =>
          img.public_id
            ? cloudinary.uploader.destroy(img.public_id)
            : Promise.resolve()
        )
      );
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get agent's own properties
// @route   GET /api/properties/my-properties
// @access  Private (Agent)
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ agent: req.user.id })
      .populate('agent', 'name email avatar phone bio role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map((p) =>
        p.toObject ? p.toObject() : p
      ),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete image from property
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
exports.deletePropertyImage = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (
      property.agent.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const image = property.images.find(
      (img) => img._id.toString() === req.params.imageId
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    property.images = property.images.filter(
      (img) => img._id.toString() !== req.params.imageId
    );

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted',
      property,
    });
  } catch (err) {
    next(err);
  }
};

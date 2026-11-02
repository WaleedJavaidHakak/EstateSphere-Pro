
const Property = require('../models/Property');
const { cloudinary } = require('../config/cloudinary');

// Upload image buffer directly to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'realestate',
        transformation: [
          {
            width: 1200,
            height: 800,
            crop: 'limit',
            quality: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result) {
          return reject(new Error('Cloudinary image upload failed'));
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });

// Parse JSON fields safely
const parseJsonField = (value, fieldName) => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    const error = new Error(`Invalid ${fieldName} format`);
    error.statusCode = 400;
    throw error;
  }
};

// @desc    Get all properties with filters and pagination
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      keyword,
      city,
      type,
      status,
      bedrooms,
      bathrooms,
      minPrice,
      maxPrice,
      sort,
      featured,
    } = req.query;

    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};

    // Keyword search
    if (keyword) {
      const searchRegex = {
        $regex: String(keyword),
        $options: 'i',
      };

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    // City filter
    if (city) {
      query['location.city'] = {
        $regex: String(city),
        $options: 'i',
      };
    }

    // Property filters
    if (type) query.type = type;
    if (status) query.status = status;

    if (bedrooms) {
      query.bedrooms = {
        $gte: Math.max(0, parseInt(bedrooms, 10) || 0),
      };
    }

    if (bathrooms) {
      query.bathrooms = {
        $gte: Math.max(0, parseInt(bathrooms, 10) || 0),
      };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Math.max(0, Number(minPrice));
      }

      if (maxPrice) {
        query.price.$lte = Math.max(0, Number(maxPrice));
      }

      if (
        !Number.isFinite(query.price.$gte ?? 0) ||
        !Number.isFinite(query.price.$lte ?? 0)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price range',
        });
      }
    }

    // Featured listings
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Only approved properties are publicly visible
    query.isApproved = true;

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // Pagination validation
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 9)
    );

    const skip = (pageNum - 1) * limitNum;

    // Fetch properties and count in parallel
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

    // Increment property views
    await Property.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });

    // Find related properties
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

    // Always assign the authenticated user as the agent
    body.agent = req.user.id;

    // Parse incoming JSON fields
    body.location = parseJsonField(body.location, 'location');
    body.features = parseJsonField(body.features, 'features');
    body.amenities = parseJsonField(body.amenities, 'amenities');

    // Validate location
    if (!body.location || typeof body.location !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid property location is required',
      });
    }

    // All newly created listings belong to the Indian market
    body.location = {
      ...body.location,
      country: 'India',
    };

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      body.images = await Promise.all(
        req.files.map(async (file) => {
          if (!file.buffer) {
            throw new Error('Invalid image file');
          }

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

    // Prevent ownership changes
    delete body.agent;

    // Parse incoming JSON fields
    body.location = parseJsonField(body.location, 'location');
    body.features = parseJsonField(body.features, 'features');
    body.amenities = parseJsonField(body.amenities, 'amenities');

    // Keep the property in the Indian market
    if (body.location) {
      body.location = {
        ...body.location,
        country: 'India',
      };
    }

    // Upload new images to Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(async (file) => {
          if (!file.buffer) {
            throw new Error('Invalid image file');
          }

          const result = await uploadToCloudinary(file.buffer);

          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );

      body.images = [
        ...(property.images || []),
        ...newImages,
      ];
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

    // Check ownership
    if (
      property.agent.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    // Delete associated images from Cloudinary
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
    const properties = await Property.find({
      agent: req.user.id,
    })
      .populate('agent', 'name email avatar phone bio role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map((property) =>
        property.toObject ? property.toObject() : property
      ),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete image from property
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private (Agent who owns it, Admin)
exports.deletePropertyImage = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

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

    // Remove image from Cloudinary
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Remove image from MongoDB
    property.images = property.images.filter(
      (img) => img._id.toString() !== req.params.imageId
    );

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      property,
    });
  } catch (err) {
    next(err);
  }
};

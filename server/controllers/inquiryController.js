const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const sendEmail = require('../utils/sendEmail');

// @desc    Send inquiry
// @route   POST /api/inquiries
// @access  Private
exports.sendInquiry = async (req, res, next) => {
  try {
    const { propertyId, message, name, email, phone } = req.body;

    const property = await Property.findById(propertyId).populate('agent', 'email name');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      user: req.user.id,
      agent: property.agent._id,
      name: name || req.user.name,
      email: email || req.user.email,
      phone,
      message,
    });

    // Optional: Send email notification
    try {
      await sendEmail({
        email: property.agent.email,
        subject: `New Inquiry for "${property.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #2563eb;">New Property Inquiry</h2>
            <p><strong>Property:</strong> ${property.title}</p>
            <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
            ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; color: #555;">${message}</blockquote>
            <p>Login to your dashboard to respond to this inquiry.</p>
          </div>
        `,
      });
    } catch (e) {
      console.log('Email notification failed:', e.message);
    }

    res.status(201).json({ success: true, message: 'Inquiry sent successfully', inquiry });
  } catch (err) {
    next(err);
  }
};

// @desc    Add reply to inquiry (platform level)
// @route   POST /api/inquiries/:id/reply
// @access  Private (Agent, Admin)
exports.addReply = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Check authorization (agent who owns the property or admin)
    if (inquiry.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reply' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    // Add reply
    inquiry.replies.push({
      message,
      repliedBy: req.user.id,
      repliedByName: req.user.name,
      repliedByRole: req.user.role === 'admin' ? 'admin' : 'agent',
    });

    // Update status to replied if not already
    if (inquiry.status !== 'replied' && inquiry.status !== 'closed') {
      inquiry.status = 'replied';
    }

    await inquiry.save();

    // Optional: Send email notification to client
    try {
      await sendEmail({
        email: inquiry.email,
        subject: `Reply to your inquiry about ${inquiry.property.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #2563eb;">New Reply to Your Inquiry</h2>
            <p><strong>Property:</strong> ${inquiry.property.title}</p>
            <p><strong>Your Question:</strong></p>
            <blockquote style="border-left: 4px solid #ccc; padding-left: 16px;">${inquiry.message}</blockquote>
            <p><strong>Our Response:</strong></p>
            <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px;">${message}</blockquote>
            <p>Login to your dashboard to view the full conversation.</p>
          </div>
        `,
      });
    } catch (e) {
      console.log('Email notification failed:', e.message);
    }

    res.status(200).json({ success: true, message: 'Reply added successfully', inquiry });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inquiries (agent gets own, admin gets all)
// @route   GET /api/inquiries
// @access  Private (Agent, Admin)
exports.getInquiries = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { agent: req.user.id };
    const { status, page = 1, limit = 10 } = req.query;

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('property', 'title images location price')
        .populate('user', 'name email avatar')
        .populate('replies.repliedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Inquiry.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      inquiries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private (Agent, Admin)

/*
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (inquiry.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only admin can close
    if (req.body.status === 'closed' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can close inquiries' });
    }

    inquiry.status = req.body.status || inquiry.status;
    await inquiry.save();

    res.status(200).json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
};
*/

// @desc    Get user's sent inquiries
// @route   GET /api/inquiries/my
// @access  Private
exports.getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user.id })
      .populate('property', 'title images location price')
      .populate('agent', 'name avatar email')
      .populate('replies.repliedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: inquiries.length, inquiries });
  } catch (err) {
    next(err);
  }
};

// controllers/inquiryController.js (updated sections)

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private (Agent, Admin)
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Check authorization
    const isAgent = inquiry.agent.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAgent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this inquiry' });
    }

    const { status } = req.body;
    const allowedStatuses = ['pending', 'read', 'replied', 'closed'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Only admin can set status to 'closed'
    if (status === 'closed' && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admin can close inquiries' });
    }

    // Agent can update status (except 'closed')
    if (isAgent && status === 'closed') {
      return res.status(403).json({ success: false, message: 'Only admin can close inquiries' });
    }

    // Auto-set to 'read' when agent/admin views (handled separately)
    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark inquiry as read when opened
// @route   PUT /api/inquiries/:id/read
// @access  Private (Agent, Admin)
exports.markAsRead = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const isAgent = inquiry.agent.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAgent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only update if current status is 'pending'
    if (inquiry.status === 'pending') {
      inquiry.status = 'read';
      await inquiry.save();
    }

    res.status(200).json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
};
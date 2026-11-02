const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent is required'],
    },
    name: { type: String, required: [true, 'Your name is required'] },
    email: { type: String, required: [true, 'Your email is required'] },
    phone: { type: String, default: '' },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'read', 'replied', 'closed'],
      default: 'pending',
    },
    // අළුත් replies array එක
    replies: [
      {
        message: { type: String, required: true },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        repliedByName: { type: String },
        repliedByRole: { type: String, enum: ['agent', 'admin', 'user'] },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);

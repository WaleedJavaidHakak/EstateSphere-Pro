const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Property price is required'],
      min: [0, 'Price cannot be negative'],
    },
    type: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['house', 'apartment', 'condo', 'villa', 'townhouse', 'land', 'commercial', 'office'],
    },
    status: {
      type: String,
      required: [true, 'Property status is required'],
      enum: ['sale', 'rent'],
      default: 'sale',
    },
    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    area: { type: Number, min: 0 }, // sq ft
    yearBuilt: { type: Number },
    garage: { type: Number, default: 0 },
    floors: { type: Number, default: 1 },

    location: {
      address: { type: String, required: [true, 'Address is required'] },
      city: { type: String, required: [true, 'City is required'], index: true },
      province: { type: String, default: '' },
      country: { type: String, default: 'Pakistan' },
      zipCode: { type: String, default: '' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },

    features: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      enum: [
        'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Security',
        'Elevator', 'Air Conditioning', 'Heating', 'Internet', 'Laundry',
        'Pet Friendly', 'Furnished', 'Unfurnished', 'Solar Panels', 'Generator',
      ],
      default: [],
    },

    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent is required'],
    },

    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial index
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ 'location.city': 1, type: 1, status: 1, price: 1 });

module.exports = mongoose.model('Property', propertySchema);

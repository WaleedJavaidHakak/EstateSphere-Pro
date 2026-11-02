
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const connectDB = require('../config/db');

const cities = [
  { name: 'Bengaluru', state: 'Karnataka', pin: '560001', coords: [77.5946, 12.9716] },
  { name: 'Mumbai', state: 'Maharashtra', pin: '400001', coords: [72.8777, 19.0760] },
  { name: 'New Delhi', state: 'Delhi', pin: '110001', coords: [77.2090, 28.6139] },
  { name: 'Hyderabad', state: 'Telangana', pin: '500001', coords: [78.4867, 17.3850] },
  { name: 'Srinagar', state: 'Jammu and Kashmir', pin: '190001', coords: [74.7973, 34.0837] },
  { name: 'Pune', state: 'Maharashtra', pin: '411001', coords: [73.8567, 18.5204] },
  { name: 'Chennai', state: 'Tamil Nadu', pin: '600001', coords: [80.2707, 13.0827] },
  { name: 'Jaipur', state: 'Rajasthan', pin: '302001', coords: [75.7873, 26.9124] },
];

const types = [
  'house',
  'apartment',
  'condo',
  'villa',
  'townhouse',
  'commercial',
];

const amenitiesList = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Garden',
  'Balcony',
  'Security',
  'Air Conditioning',
  'Internet',
];

const featuresList = [
  'Marble Floors',
  'Open Kitchen',
  'Master Suite',
  'Walk-in Closet',
  'Smart Home',
  'Solar Panels',
];

const sampleImages = [
  { public_id: 'sample1', url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200' },
  { public_id: 'sample2', url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200' },
  { public_id: 'sample3', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200' },
  { public_id: 'sample4', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200' },
  { public_id: 'sample5', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200' },
  { public_id: 'sample6', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200' },
];

// Preserve existing users. Create demo accounts only when missing.
async function ensureUser(data) {
  let user = await User.findOne({ email: data.email });

  if (!user) {
    user = await User.create(data);
  }

  return user;
}

const seedDB = async () => {
  try {
    await connectDB();

    console.log('🇮🇳 Preparing Indian property listings...');

    const admin = await ensureUser({
      name: 'EstateSphere Admin',
      email: 'admin@realestate.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true,
      isActive: true,
      bio: 'EstateSphere platform administrator',
    });

    const agents = [];

    agents.push(await ensureUser({
      name: 'Rahul Sharma',
      email: 'ahmed@realestate.com',
      password: 'agent123',
      role: 'agent',
      isApproved: true,
      isActive: true,
      phone: '+91-9876543210',
      bio: 'Real estate consultant specializing in residential properties across Bengaluru and Mumbai.',
    }));

    agents.push(await ensureUser({
      name: 'Priya Kapoor',
      email: 'sara@realestate.com',
      password: 'agent123',
      role: 'agent',
      isApproved: true,
      isActive: true,
      phone: '+91-9876501234',
      bio: 'Property consultant specializing in luxury homes and commercial real estate in India.',
    }));

    const regularUsers = [];

    regularUsers.push(await ensureUser({
      name: 'Arjun Mehta',
      email: 'usman@example.com',
      password: 'user123',
      role: 'user',
    }));

    regularUsers.push(await ensureUser({
      name: 'Ananya Sharma',
      email: 'fatima@example.com',
      password: 'user123',
      role: 'user',
    }));

    regularUsers.push(await ensureUser({
      name: 'Aarav Khan',
      email: 'ali@example.com',
      password: 'user123',
      role: 'user',
    }));

    // Remove old property listings and only their associated inquiries.
    const oldProperties = await Property.find({}, '_id');
    const oldPropertyIds = oldProperties.map(property => property._id);

    if (oldPropertyIds.length > 0) {
      await Inquiry.deleteMany({
        property: { $in: oldPropertyIds },
      });

      await Property.deleteMany({
        _id: { $in: oldPropertyIds },
      });
    }

    console.log('🏠 Creating Indian properties...');

    const propertyData = [];

    for (let i = 0; i < 30; i++) {
      const city = cities[i % cities.length];
      const type = types[i % types.length];
      const agent = agents[i % agents.length];

      const status = i % 3 === 0 ? 'rent' : 'sale';
      const bedrooms = (i % 5) + 1;
      const bathrooms = Math.max(1, bedrooms - 1);

      // Sale prices: ₹35 lakh to ₹2.5 crore.
      // Rental prices: ₹15,000 to ₹80,000 per month.
      const price = status === 'rent'
        ? Math.floor(Math.random() * 65000 + 15000)
        : Math.floor(Math.random() * 21500000 + 3500000);

      const latitude = city.coords[1] + (Math.random() * 0.04 - 0.02);
      const longitude = city.coords[0] + (Math.random() * 0.04 - 0.02);

      propertyData.push({
        title: `${bedrooms} BHK ${type.charAt(0).toUpperCase() + type.slice(1)} in ${city.name}`,

        description: `Discover this beautiful ${type} in ${city.name}, ${city.state}, India. This property offers modern architecture, spacious interiors, quality finishes and convenient access to schools, hospitals, public transport, shopping centres and major roads. An excellent option for families and property investors.`,

        price,
        type,
        status,
        bedrooms,
        bathrooms,

        area: Math.floor(Math.random() * 2200 + 800),
        yearBuilt: Math.floor(Math.random() * 15 + 2010),
        garage: i % 3,
        floors: (i % 4) + 1,

        location: {
          address: `${10 + i}, ${['Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout', 'Jubilee Hills', 'Andheri', 'Baner', 'Rohini'][i % 8]}, ${city.name}`,
          city: city.name,
          province: city.state,
          country: 'India',
          zipCode: city.pin,

          coordinates: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },

        features: featuresList.slice(0, (i % 4) + 2),
        amenities: amenitiesList.slice(0, (i % 5) + 2),

        images: [
          sampleImages[i % sampleImages.length],
          sampleImages[(i + 1) % sampleImages.length],
        ],

        agent: agent._id,
        isFeatured: i < 6,
        isApproved: true,
        views: Math.floor(Math.random() * 500),
      });
    }

    const properties = await Property.insertMany(propertyData);

    console.log('📨 Creating sample inquiries...');

    await Inquiry.create([
      {
        property: properties[0]._id,
        user: regularUsers[0]._id,
        agent: agents[0]._id,
        name: regularUsers[0].name,
        email: regularUsers[0].email,
        phone: '+91-9876543210',
        message: 'I am interested in this property. Can we schedule a viewing this weekend?',
        status: 'pending',
      },
      {
        property: properties[1]._id,
        user: regularUsers[1]._id,
        agent: agents[1]._id,
        name: regularUsers[1].name,
        email: regularUsers[1].email,
        message: 'Is the property price negotiable? I would like to discuss further.',
        status: 'read',
      },
      {
        property: properties[2]._id,
        user: regularUsers[2]._id,
        agent: agents[0]._id,
        name: regularUsers[2].name,
        email: regularUsers[2].email,
        phone: '+91-9876501234',
        message: 'Can you share more details about the property and its amenities?',
        status: 'pending',
      },
    ]);

    console.log('\n✅ Indian property listings created successfully!');
    console.log(`🏠 Properties created: ${properties.length}`);
    console.log('🌍 Country: India');
    console.log('💰 Currency: INR (₹)');
    console.log('👥 Existing user accounts preserved.');
    console.log('\nDemo login credentials (only if these accounts were newly created):');
    console.log('Admin: admin@realestate.com / admin123');
    console.log('Agent: ahmed@realestate.com / agent123');
    console.log('Agent: sara@realestate.com / agent123');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDB();

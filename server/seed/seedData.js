require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');
const Inquiry = require('./models/Inquiry');

const connectDB = require('./config/db');

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan', 'Quetta'];
const types = ['house', 'apartment', 'condo', 'villa', 'townhouse', 'commercial'];
const amenitiesList = ['Swimming Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Security', 'Air Conditioning', 'Internet'];
const featuresList = ['Marble Floors', 'Open Kitchen', 'Master Suite', 'Walk-in Closet', 'Smart Home', 'Solar Panels'];

const sampleImages = [
  { public_id: 'sample1', url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200' },
  { public_id: 'sample2', url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200' },
  { public_id: 'sample3', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200' },
  { public_id: 'sample4', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200' },
  { public_id: 'sample5', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200' },
  { public_id: 'sample6', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200' },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Inquiry.deleteMany({});

    console.log('👤 Creating users...');

    // Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@realestate.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true,
      isActive: true,
      bio: 'Platform administrator',
    });

    // Agents
    const agents = await User.create([
      {
        name: 'Ahmed Khan',
        email: 'ahmed@realestate.com',
        password: 'agent123',
        role: 'agent',
        isApproved: true,
        phone: '+92-301-1234567',
        bio: 'Expert real estate agent with 10+ years of experience in Karachi and Lahore.',
      },
      {
        name: 'Sara Ali',
        email: 'sara@realestate.com',
        password: 'agent123',
        role: 'agent',
        isApproved: true,
        phone: '+92-321-9876543',
        bio: 'Specialized in luxury properties and commercial real estate in Islamabad.',
      },
      {
        name: 'Bilal Mahmood',
        email: 'bilal@realestate.com',
        password: 'agent123',
        role: 'agent',
        isApproved: false, // pending approval
        phone: '+92-333-5551234',
        bio: 'New agent specializing in affordable housing in Faisalabad.',
      },
    ]);

    // Regular users
    const users = await User.create([
      { name: 'Usman Tariq', email: 'usman@example.com', password: 'user123', role: 'user' },
      { name: 'Fatima Zahra', email: 'fatima@example.com', password: 'user123', role: 'user' },
      { name: 'Ali Hassan', email: 'ali@example.com', password: 'user123', role: 'user' },
    ]);

    console.log('🏠 Creating properties...');

    const propertyData = [];
    const coords = {
      Karachi: [67.0099, 24.8607],
      Lahore: [74.3587, 31.5204],
      Islamabad: [73.0479, 33.6844],
      Rawalpindi: [73.0479, 33.5651],
      Faisalabad: [73.0901, 31.4180],
      Peshawar: [71.5249, 34.0151],
      Multan: [71.4729, 30.1575],
      Quetta: [66.9750, 30.1798],
    };

    for (let i = 0; i < 30; i++) {
      const city = cities[i % cities.length];
      const type = types[i % types.length];
      const agent = agents[i % 2]; // only approved agents
      const status = i % 3 === 0 ? 'rent' : 'sale';
      const bedrooms = (i % 5) + 1;
      const bathrooms = Math.max(1, bedrooms - 1);
      const price = status === 'rent'
        ? Math.floor(Math.random() * 150000 + 20000)
        : Math.floor(Math.random() * 50000000 + 2000000);

      propertyData.push({
        title: `${bedrooms} Bed ${type.charAt(0).toUpperCase() + type.slice(1)} in ${city}`,
        description: `Beautiful and spacious ${type} located in the heart of ${city}. This property features modern architecture, premium finishes, and top-of-the-line amenities. Perfect for families looking for comfort and style. The property is well-connected to major roads, schools, hospitals, and shopping centers.`,
        price,
        type,
        status,
        bedrooms,
        bathrooms,
        area: Math.floor(Math.random() * 3000 + 800),
        yearBuilt: Math.floor(Math.random() * 20 + 2005),
        garage: i % 3,
        floors: i % 4 + 1,
        location: {
          address: `House ${i + 1}, Block ${String.fromCharCode(65 + (i % 10))}, DHA Phase ${(i % 8) + 1}`,
          city,
          province: city === 'Karachi' ? 'Sindh' : city === 'Lahore' || city === 'Faisalabad' || city === 'Multan' ? 'Punjab' : city === 'Peshawar' ? 'KPK' : city === 'Quetta' ? 'Balochistan' : 'Punjab',
          country: 'Pakistan',
          zipCode: `${Math.floor(Math.random() * 90000 + 10000)}`,
          coordinates: {
            type: 'Point',
            coordinates: [
              coords[city][0] + (Math.random() * 0.1 - 0.05),
              coords[city][1] + (Math.random() * 0.1 - 0.05),
            ],
          },
        },
        features: featuresList.slice(0, (i % 4) + 2),
        amenities: amenitiesList.slice(0, (i % 5) + 2),
        images: [sampleImages[i % sampleImages.length], sampleImages[(i + 1) % sampleImages.length]],
        agent: agent._id,
        isFeatured: i < 6,
        isApproved: true,
        views: Math.floor(Math.random() * 500),
      });
    }

    const properties = await Property.insertMany(propertyData);

    console.log('📨 Creating inquiries...');
    await Inquiry.create([
      {
        property: properties[0]._id,
        user: users[0]._id,
        agent: agents[0]._id,
        name: users[0].name,
        email: users[0].email,
        phone: '+92-300-1234567',
        message: 'I am interested in this property. Can we schedule a viewing this weekend?',
        status: 'pending',
      },
      {
        property: properties[1]._id,
        user: users[1]._id,
        agent: agents[0]._id,
        name: users[1].name,
        email: users[1].email,
        message: 'Is the price negotiable? I would like to discuss further.',
        status: 'read',
      },
      {
        property: properties[2]._id,
        user: users[2]._id,
        agent: agents[1]._id,
        name: users[2].name,
        email: users[2].email,
        phone: '+92-333-9876543',
        message: 'What utilities are included in the rental price? Is it furnished?',
        status: 'replied',
      },
    ]);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:   admin@realestate.com   / admin123');
    console.log('🏢 Agent 1: ahmed@realestate.com   / agent123');
    console.log('🏢 Agent 2: sara@realestate.com    / agent123');
    console.log('👤 User 1:  usman@example.com      / user123');
    console.log('👤 User 2:  fatima@example.com     / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();

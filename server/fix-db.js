const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  // Update all users with the broken avatar link
  const avatarResult = await User.updateMany(
    { 'avatar.url': 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png' },
    { $set: { 'avatar.url': '' } }
  );
  console.log(`Updated ${avatarResult.modifiedCount} users to fix broken avatars.`);
  
  // Approve all unapproved agents
  const agentResult = await User.updateMany(
    { role: 'agent', isApproved: false },
    { $set: { isApproved: true } }
  );
  console.log(`Approved ${agentResult.modifiedCount} pending agents.`);
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

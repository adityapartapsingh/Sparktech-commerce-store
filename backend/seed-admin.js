const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hash = await bcrypt.hash('Admin@1234', 12);

  const existing = await mongoose.connection.collection('users').findOne({ role: 'masteradmin' });

  if (existing) {
    await mongoose.connection.collection('users').updateOne(
      { role: 'masteradmin' },
      { $set: { password: hash, authProvider: 'local', isEmailVerified: true, isPhoneVerified: true, updatedAt: new Date() } }
    );
    console.log('✅ Reset masteradmin password to Admin@1234 | Email:', existing.email);
  } else {
    await mongoose.connection.collection('users').insertOne({
      name: 'Master Admin',
      email: 'adityapartapsingh92@gmail.com',
      password: hash,
      role: 'masteradmin',
      authProvider: 'local',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Created masteradmin: adityapartapsingh92@gmail.com | Password: Admin@1234');
  }
  process.exit(0);
}).catch(e => { console.error('❌', e.message); process.exit(1); });

// Complete Admin Login Fix - Create All Admin Users
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/maplorix');

const User = mongoose.model('User');

const createAllAdminUsers = async () => {
  try {
    console.log('🔧 Creating all admin users...');
    
    // Admin users to create
    const adminUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@maplorix.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        department: 'General'
      },
      {
        firstName: 'Maplorix',
        lastName: 'Admin',
        email: 'maplorixae@gmail.com',
        password: 'maplorixDXB',
        role: 'admin',
        isActive: true,
        department: 'General'
      },
      {
        firstName: 'Info',
        lastName: 'Admin',
        email: 'info@maplorix.ae',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        department: 'General'
      }
    ];
    
    for (const adminUser of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: adminUser.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${adminUser.email} already exists, updating...`);
        
        // Update existing user
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        await User.updateOne(
          { email: adminUser.email },
          { 
            $set: {
              role: 'admin',
              isActive: true,
              password: hashedPassword
            }
          }
        );
        console.log(`✅ Updated ${adminUser.email}`);
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        
        const user = new User({
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          department: adminUser.department
        });
        
        await user.save();
        console.log(`✅ Created ${adminUser.email}`);
      }
    }
    
    console.log('\n🎯 All admin users created/updated successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('1. Email: admin@maplorix.com | Password: admin123');
    console.log('2. Email: maplorixae@gmail.com | Password: maplorixDXB');
    console.log('3. Email: info@maplorix.ae | Password: admin123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    process.exit(1);
  }
};

createAllAdminUsers();

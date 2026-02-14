// Login Debug Script - Test API Directly
const { authAPI } = require('./src/services/api.js');

const testLogin = async (email, password) => {
  console.log('\n=== Testing Login ===');
  console.log('Email:', email);
  console.log('Password:', password);
  
  try {
    console.log('\n🔍 Calling authAPI.login...');
    const response = await authAPI.login(email, password);
    console.log('✅ API Response:', response);
    console.log('✅ Response structure:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('✅ Login successful!');
      console.log('✅ Token:', response.data?.token);
      console.log('✅ User:', response.data?.user);
    } else {
      console.log('❌ Login failed');
      console.log('❌ Error:', response.message);
    }
  } catch (error) {
    console.log('❌ API Error:', error.message);
    console.log('❌ Full Error:', error);
  }
};

// Test all admin credentials
const testAllAdmins = async () => {
  console.log('🧪 Testing All Admin Credentials...\n');
  
  const admins = [
    { email: 'admin@maplorix.com', password: 'admin123' },
    { email: 'maplorixae@gmail.com', password: 'maplorixDXB' },
    { email: 'info@maplorix.ae', password: 'admin123' }
  ];
  
  for (let i = 0; i < admins.length; i++) {
    console.log(`\n--- Test ${i + 1} ---`);
    await testLogin(admins[i].email, admins[i].password);
  }
};

testAllAdmins();

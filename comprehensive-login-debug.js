// Comprehensive Login Debug - Test Every Step
const { authAPI } = require('./src/services/api.js');

const debugLogin = async (email, password) => {
  console.log('\n=== COMPREHENSIVE LOGIN DEBUG ===');
  console.log('Email:', email);
  console.log('Password:', password);
  
  try {
    console.log('\n🔍 Step 1: Calling authAPI.login...');
    const apiResponse = await authAPI.login(email, password);
    console.log('✅ Raw API Response:', JSON.stringify(apiResponse, null, 2));
    
    // Check response structure
    console.log('\n🔍 Step 2: Checking response structure...');
    console.log('apiResponse.success:', apiResponse.success);
    console.log('apiResponse.data:', apiResponse.data);
    console.log('apiResponse.data?.token:', apiResponse.data?.token);
    console.log('apiResponse.data?.user:', apiResponse.data?.user);
    
    if (apiResponse.success) {
      console.log('\n✅ Step 3: Login successful - Testing localStorage...');
      
      // Test localStorage operations
      try {
        localStorage.setItem('authToken', apiResponse.data?.token || 'NO_TOKEN');
        localStorage.setItem('user', JSON.stringify(apiResponse.data?.user || 'NO_USER'));
        
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        console.log('Stored token:', storedToken);
        console.log('Stored user:', storedUser);
        
        if (storedToken && storedUser) {
          console.log('✅ Step 4: localStorage working correctly');
          console.log('🎯 Login should work!');
        } else {
          console.log('❌ Step 4: localStorage failed');
          console.log('❌ Token exists:', !!storedToken);
          console.log('❌ User exists:', !!storedUser);
        }
      } catch (storageError) {
        console.log('❌ Step 4: localStorage error:', storageError);
      }
    } else {
      console.log('❌ Step 3: Login failed');
      console.log('❌ Error message:', apiResponse.message || 'Unknown error');
    }
    
  } catch (error) {
    console.log('\n❌ API Call Failed:');
    console.log('Error message:', error.message);
    console.log('Error response:', error.response?.data);
    console.log('Error status:', error.response?.status);
    console.log('Full error:', error);
  }
};

// Test all admin credentials
const testAllCredentials = async () => {
  console.log('\n🧪 TESTING ALL ADMIN CREDENTIALS...\n');
  
  const credentials = [
    { email: 'admin@maplorix.com', password: 'admin123', name: 'Primary' },
    { email: 'maplorixae@gmail.com', password: 'maplorixDXB', name: 'Secondary' },
    { email: 'info@maplorix.ae', password: 'admin123', name: 'Tertiary' }
  ];
  
  for (let i = 0; i < credentials.length; i++) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`TESTING ${credentials[i].name.toUpperCase()} CREDENTIALS:`);
    await debugLogin(credentials[i].email, credentials[i].password);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DEBUG COMPLETE');
  console.log('📋 If localStorage shows correct values but login still fails,');
  console.log('   The issue is in the frontend auth flow or routing');
  console.log('📋 If localStorage shows NO_TOKEN or NO_USER,');
  console.log('   The issue is in the API response or data access');
};

// Run comprehensive test
testAllCredentials();

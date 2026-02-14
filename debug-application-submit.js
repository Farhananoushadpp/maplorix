// Debug script to test application submission
// Run this in browser console after navigating to /apply page

const testApplication = {
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  jobRole: 'Senior Frontend Developer',
  experience: '5+',
  expectedSalary: '$80,000 - $100,000',
  source: 'Website'
};

console.log('Testing application submission with:', testApplication);

// Test form validation
const validateTest = () => {
  console.log('Testing validation...');
  
  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'fullName', 'email', 'phone', 'location', 'jobRole', 'experience'];
  const missing = requiredFields.filter(field => !testApplication[field]);
  
  if (missing.length > 0) {
    console.error('Missing required fields:', missing);
    return false;
  }
  
  // Check email format
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(testApplication.email)) {
    console.error('Invalid email format');
    return false;
  }
  
  // Check phone length
  if (testApplication.phone.length < 10 || testApplication.phone.length > 20) {
    console.error('Phone number must be between 10 and 20 characters');
    return false;
  }
  
  // Check location length
  if (testApplication.location.length < 2 || testApplication.location.length > 100) {
    console.error('Location must be between 2 and 100 characters');
    return false;
  }
  
  // Check jobRole length
  if (testApplication.jobRole.length < 2 || testApplication.jobRole.length > 100) {
    console.error('Job role must be between 2 and 100 characters');
    return false;
  }
  
  // Check fullName length
  if (testApplication.fullName.length < 2 || testApplication.fullName.length > 100) {
    console.error('Full name must be between 2 and 100 characters');
    return false;
  }
  
  // Check experience level
  const validExperience = ['fresher', '1-3', '3-5', '5+', '10+', 'Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
  if (!validExperience.includes(testApplication.experience)) {
    console.error('Invalid experience level:', testApplication.experience);
    console.error('Valid options:', validExperience);
    return false;
  }
  
  console.log('✅ All validation checks passed!');
  return true;
};

// Test the validation
validateTest();

// Instructions:
// 1. Navigate to http://localhost:5173/apply
// 2. Open browser console
// 3. Copy and paste this script
// 4. Run the script to check validation
// 5. Fill the form with the test data and submit
// 6. Check console for detailed error messages

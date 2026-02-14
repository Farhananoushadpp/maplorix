// Test script to verify job posting API
import { jobsAPI } from './src/services/api.js';

const testJobData = {
  title: 'Test Software Engineer',
  company: 'Test Company',
  location: 'Test City',
  type: 'Full-time',
  category: 'Technology',
  experience: 'Mid Level',
  description: 'This is a test job description with enough characters to meet the minimum requirement.',
  requirements: 'Test requirements with enough characters.',
  salaryMin: 50000,
  salaryMax: 80000,
  currency: 'USD',
  featured: false,
  active: true,
  postedDate: new Date(),
};

console.log('Testing job posting with data:', testJobData);

// Test the API call
jobsAPI.createJob(testJobData)
  .then(response => {
    console.log('✅ Success! Job posted:', response);
  })
  .catch(error => {
    console.error('❌ Error posting job:', error);
    console.error('Response:', error.response?.data);
  });

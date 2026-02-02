/**
 * Connection Test Script
 * Tests the connection between frontend and backend
 */

import { jobsAPI, healthAPI } from '../src/services/api.js';

const testConnection = async () => {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await healthAPI.checkHealth();
    console.log('✅ Health Check:', healthResponse);
    console.log('   Status:', healthResponse.status);
    console.log('   Uptime:', healthResponse.uptime, 'seconds\n');

    // Test 2: Get Jobs
    console.log('2. Testing Jobs API...');
    const jobsResponse = await jobsAPI.getAllJobs();
    console.log('✅ Jobs API Response:', jobsResponse);
    console.log('   Total Jobs:', jobsResponse.data?.pagination?.total || 0);
    console.log('   Jobs Retrieved:', jobsResponse.data?.jobs?.length || 0, '\n');

    // Test 3: Get Featured Jobs
    console.log('3. Testing Featured Jobs API...');
    const featuredJobsResponse = await jobsAPI.getFeaturedJobs({ limit: 5 });
    console.log('✅ Featured Jobs Response:', featuredJobsResponse);
    console.log('   Featured Jobs:', featuredJobsResponse.data?.jobs?.length || 0, '\n');

    console.log('🎉 All tests passed! Frontend-Backend connection is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection Test Failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the backend server is running on http://localhost:4000');
    } else if (error.response) {
      console.error('   Server responded with:', error.response.status, error.response.statusText);
      console.error('   Response data:', error.response.data);
    }
    
    process.exit(1);
  }
};

// Run the test
testConnection();

// Debug script to check dashboard jobs issue
console.log('=== Dashboard Jobs Debug ===')

// Check if jobsAPI is working
import { jobsAPI } from './src/services/api.js'

// Test fetching jobs directly
jobsAPI.getAllJobs({ limit: 5 })
  .then(response => {
    console.log('✅ API Response:', response.data)
    console.log('✅ Jobs array:', response.data.jobs)
    console.log('✅ Number of jobs:', response.data.jobs?.length || 0)
    
    if (response.data.jobs && response.data.jobs.length > 0) {
      console.log('✅ First job structure:', response.data.jobs[0])
    } else {
      console.log('❌ No jobs found in API response')
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error)
    console.error('❌ Error response:', error.response?.data)
  })

// Test event dispatch
console.log('Testing event dispatch...')
window.dispatchEvent(new CustomEvent('jobPosted', { 
  detail: { 
    success: true, 
    job: {
      title: 'Test Job',
      company: 'Test Company',
      location: 'Test Location'
    }
  } 
}))

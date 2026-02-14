// Test script to verify dashboard refresh after job posting
console.log('Testing dashboard refresh functionality...')

// Simulate job posting event
setTimeout(() => {
  console.log('Dispatching jobPosted event...')
  window.dispatchEvent(new CustomEvent('jobPosted', { 
    detail: { 
      success: true, 
      job: {
        title: 'Test Job',
        company: 'Test Company'
      }
    } 
  }))
}, 2000)

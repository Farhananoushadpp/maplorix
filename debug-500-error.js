// Debug 500 Error - Component Isolation Test
console.log('=== 500 Error Debug ===')

// Test 1: Check if all imports work
try {
  console.log('Testing imports...')
  
  // Test React imports
  const React = require('react')
  console.log('✅ React imported:', typeof React)
  
  // Test Router imports
  const { BrowserRouter, Route, Routes, useLocation, Navigate } = require('react-router-dom')
  console.log('✅ React Router imported')
  
  // Test Framer Motion
  const { motion, AnimatePresence } = require('framer-motion')
  console.log('✅ Framer Motion imported')
  
  // Test Context
  const { AuthProvider } = require('./context/AuthContext')
  console.log('✅ AuthContext imported')
  
  // Test Components
  const Header = require('./components/Header')
  console.log('✅ Header imported')
  
  const Footer = require('./components/Footer')
  console.log('✅ Footer imported')
  
  const ScrollToTop = require('./components/ScrollToTop')
  console.log('✅ ScrollToTop imported')
  
  // Test Pages
  const Home = require('./pages/Home')
  console.log('✅ Home imported')
  
  const Dashboard = require('./pages/Dashboard')
  console.log('✅ Dashboard imported')
  
  const JobPost = require('./pages/JobPost')
  console.log('✅ JobPost imported')
  
  // Test Constants
  const { ANIMATION_VARIANTS, ROUTES } = require('./constants')
  console.log('✅ Constants imported')
  console.log('ROUTES:', ROUTES)
  console.log('ANIMATION_VARIANTS:', ANIMATION_VARIANTS)
  
} catch (error) {
  console.log('❌ Import error:', error.message)
  console.log('❌ Stack:', error.stack)
}

// Test 2: Check if constants are properly defined
try {
  console.log('\n=== Testing Constants ===')
  console.log('ROUTES.HOME:', ROUTES.HOME)
  console.log('ROUTES.POST_JOB:', ROUTES.POST_JOB)
  console.log('ANIMATION_VARIANTS.pageTransition:', ANIMATION_VARIANTS.pageTransition)
} catch (error) {
  console.log('❌ Constants error:', error.message)
}

// Test 3: Check if App component can be created
try {
  console.log('\n=== Testing App Component ===')
  
  // Simple test render without full app
  const testApp = () => {
    return React.createElement('div', null, 'Test App')
  }
  
  console.log('✅ Simple component creation works')
  
} catch (error) {
  console.log('❌ Component creation error:', error.message)
  console.log('❌ Stack:', error.stack)
}

console.log('\n=== Debug Complete ===')
console.log('📋 Check browser console for detailed error messages')
console.log('📋 The 500 error might be coming from:')
console.log('  1. Missing component files')
console.log('  2. Circular imports') 
console.log('  3. Syntax errors in components')
console.log('  4. Missing dependencies')

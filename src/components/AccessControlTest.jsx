import React from 'react'
import { useAuth } from '../context/AuthContext'
import { usePageAccess } from '../components/RouteAccess'

// Test component to verify access control
export const AccessControlTest = () => {
  const { user, isAuthenticated } = useAuth()
  
  // Test access for different pages
  const homeAccess = usePageAccess('/home')
  const aboutAccess = usePageAccess('/about')
  const feedAccess = usePageAccess('/feed')
  const contactAccess = usePageAccess('/contact')
  const dashboardAccess = usePageAccess('/dashboard')
  const adminPostsAccess = usePageAccess('/admin-posts')
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Access Control Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          User: {isAuthenticated ? `${user?.firstName} (${user?.role})` : 'Not authenticated'}
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Page Access Status:</h3>
        
        <div className={`p-2 rounded ${homeAccess.canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
          Home: {homeAccess.canAccess ? '✅ Accessible' : '❌ Restricted'} ({homeAccess.reason})
        </div>
        
        <div className={`p-2 rounded ${aboutAccess.canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
          About: {aboutAccess.canAccess ? '✅ Accessible' : '❌ Restricted'} ({aboutAccess.reason})
        </div>
        
        <div className={`p-2 rounded ${feedAccess.canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
          Feed: {feedAccess.canAccess ? '✅ Accessible' : '❌ Restricted'} ({feedAccess.reason})
        </div>
        
        <div className={`p-2 rounded ${contactAccess.canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
          Contact: {contactAccess.canAccess ? '✅ Accessible' : '❌ Restricted'} ({contactAccess.reason})
        </div>
        
        <div className={`p-2 rounded ${dashboardAccess.canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
          Dashboard: {dashboardAccess.canAccess ? '✅ Accessible' : '❌ Restricted'} ({dashboardAccess.reason})
        </div>
        
        <div className={`p-2 rounded ${adminPostsAccess.canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
          Admin Posts: {adminPostsAccess.canAccess ? '✅ Accessible' : '❌ Restricted'} ({adminPostsAccess.reason})
        </div>
      </div>
    </div>
  )
}

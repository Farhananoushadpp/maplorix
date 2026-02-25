# Maplorix Job Consultancy Website - Deployment Guide

## Overview
This guide will help you deploy the Maplorix job consultancy website with proper authentication and role-based access control.

## Features
- ✅ User authentication (Login/Register)
- ✅ Role-based access control (User/Admin)
- ✅ Protected routes
- ✅ Responsive design with Maplorix theme
- ✅ Job posting and application system
- ✅ Admin dashboard

## User Access Control

### Regular Users can access:
- Home
- About Us  
- Feed (job listings) - **Requires Login**
- Contact Us

### Admin Users can access:
- Home
- About Us
- Feed (job listings) - **Requires Login**
- Dashboard - **Requires Login**
- Admin Posts - **Requires Admin Role**
- Contact Us

## Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn
- Backend API running on port 4000 (or configured port)

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.production` file in the root directory:
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_APP_NAME=Maplorix
VITE_APP_DESCRIPTION=Professional Job Consultancy Services
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Build (Optional)
```bash
npm run preview
```

## Deployment Options

### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables in your hosting provider
4. Ensure backend API is accessible and CORS is configured

### Option 2: VPS/Dedicated Server
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Use a web server (Nginx, Apache) to serve the `dist` folder
5. Configure reverse proxy for API calls

### Option 3: Docker Deployment
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Backend Configuration
Ensure your backend API:
- Handles CORS properly
- Has authentication endpoints (`/api/auth/login`, `/api/auth/register`)
- Has user role management
- Provides job and application endpoints

## Authentication Flow
1. **New Users**: Register → Login → Access Feed
2. **Admin Users**: Login → Access Dashboard & Admin Posts
3. **Protected Routes**: Automatically redirect to login if not authenticated
4. **Role-Based Routes**: Show access denied for insufficient permissions

## Testing Before Deployment
1. Start backend server
2. Start frontend: `npm run dev`
3. Test registration flow
4. Test login for both user and admin roles
5. Test protected routes
6. Test role-based access

## Production Checklist
- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Build completes successfully
- [ ] All routes work correctly
- [ ] Authentication flow works
- [ ] Role-based access control works
- [ ] Responsive design works on mobile
- [ ] Forms validate properly
- [ ] Error handling is in place

## Troubleshooting

### Common Issues
1. **CORS Errors**: Configure backend to allow frontend domain
2. **API Connection**: Check API base URL in environment variables
3. **Authentication Issues**: Verify JWT token handling
4. **Build Errors**: Check Node.js version compatibility

### Debug Mode
Add to your `.env.production`:
```env
VITE_DEBUG=true
```

## Support
For deployment issues, check:
1. Browser console for errors
2. Network tab for API calls
3. Backend logs for authentication issues

## Security Notes
- Change default admin credentials
- Use HTTPS in production
- Implement rate limiting on API
- Regular security updates
- Monitor authentication logs

# Maplorix Frontend-Backend Connection Guide

## 🚀 **Connection Setup Complete**

The React frontend at `c:\Users\USER-ID\CascadeProjects\maplorix` is now properly configured to connect with the backend at `http://localhost:4000/api`.

## 📋 **Configuration Details**

### **✅ Backend API URL:**
```
http://localhost:4000/api
```

### **✅ Frontend API Configuration:**
- **File:** `src/services/api.js`
- **Base URL:** `import.meta.env.VITE_API_URL || 'http://localhost:4000/api'`
- **Authentication:** JWT Bearer token
- **Auto-token injection:** Request interceptor adds Authorization header

### **✅ Environment Variables:**
- **File:** `.env` (created)
- **API URL:** `VITE_API_URL=http://localhost:4000/api`
- **App Name:** Maplorix
- **Features:** Dashboard, Job Posting, Applications enabled

## 🔧 **API Endpoints Connected**

### **Authentication:**
- ✅ `POST /auth/login` - User login
- ✅ `POST /auth/register` - User registration  
- ✅ `GET /auth/me` - Get user profile
- ✅ `PUT /auth/me` - Update profile
- ✅ `POST /auth/change-password` - Change password

### **Jobs:**
- ✅ `GET /jobs` - Get all jobs
- ✅ `GET /jobs/:id` - Get job by ID
- ✅ `GET /jobs/featured` - Get featured jobs
- ✅ `POST /jobs` - Create job
- ✅ `PUT /jobs/:id` - Update job
- ✅ `DELETE /jobs/:id` - Delete job
- ✅ `GET /jobs/stats` - Get job statistics

### **Applications:**
- ✅ `GET /applications` - Get all applications
- ✅ `GET /applications/:id` - Get application by ID
- ✅ `POST /applications` - Create application
- ✅ `PUT /applications/:id` - Update application
- ✅ `DELETE /applications/:id` - Delete application
- ✅ `GET /applications/:id/resume` - Download resume
- ✅ `GET /applications/stats` - Get application statistics

### **Contacts:**
- ✅ `POST /contact` - Submit contact form
- ✅ `GET /contact` - Get all contacts
- ✅ `GET /contact/:id` - Get contact by ID
- ✅ `PUT /contact/:id` - Update contact
- ✅ `DELETE /contact/:id` - Delete contact

### **Health:**
- ✅ `GET /health` - Server health check

## 🌐 **How to Run**

### **1. Start Backend:**
```bash
cd c:\Users\USER-ID\CascadeProjects\maplorixBackend
npm run dev
```
**Backend will run on:** http://localhost:4000

### **2. Start Frontend:**
```bash
cd c:\Users\USER-ID\CascadeProjects\maplorix
npm run dev
```
**Frontend will run on:** http://localhost:5173 (or similar Vite port)

### **3. Access Application:**
Open browser and go to: http://localhost:5173

## 🔑 **Login Credentials**

### **Default Admin User:**
- **Email:** john.doe@company.com
- **Password:** password123

### **Test Registration:**
Use any unique email with password (min 6 chars)

## 🎯 **Features Available**

### **✅ Authentication:**
- Login/Register with JWT tokens
- Profile management
- Password change
- Auto-logout on token expiration

### **✅ Job Management:**
- View all jobs
- Create new jobs
- Edit/delete jobs
- Featured jobs section
- Job statistics

### **✅ Applications:**
- Submit job applications
- Track application status
- Download resumes
- Application statistics

### **✅ Contact System:**
- Contact form submission
- Admin contact management
- Contact categorization
- Response tracking

### **✅ UI/UX:**
- React with modern hooks
- Framer Motion animations
- Tailwind CSS styling
- Responsive design
- Error handling
- Loading states

## 🔧 **Troubleshooting**

### **❌ Connection Issues:**
1. **Backend not running:** Start backend with `npm run dev`
2. **Wrong port:** Check backend runs on port 4000
3. **CORS issues:** Backend allows frontend origin
4. **Environment variables:** Ensure `.env` file exists

### **❌ Authentication Issues:**
1. **Invalid credentials:** Use john.doe@company.com / password123
2. **Token expired:** Login again
3. **Network error:** Check both servers running

### **❌ API Issues:**
1. **404 errors:** Check endpoint URLs
2. **401 errors:** Check authentication token
3. **500 errors:** Check backend console logs

## 🎉 **Connection Status**

✅ **Frontend:** React app configured and ready
✅ **Backend:** Node.js API running and ready  
✅ **Connection:** API endpoints properly mapped
✅ **Authentication:** JWT system integrated
✅ **Environment:** Variables configured

**The Maplorix frontend is now fully connected to the backend!**

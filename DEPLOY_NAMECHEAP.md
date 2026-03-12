# Maplorix Deployment Guide for Namecheap

## 🌐 Namecheap Deployment Steps

### 1. Prepare Your Build
Your `dist/` folder is already built and ready for deployment.

### 2. Namecheap Shared Hosting Deployment

#### Option A: cPanel File Manager
1. **Login to Namecheap cPanel**
   - Go to your Namecheap account
   - Navigate to Hosting List → Manage → cPanel

2. **Upload Files via File Manager**
   - Open File Manager in cPanel
   - Navigate to `public_html` folder
   - Delete existing files (backup first if needed)
   - Upload all files from your `dist/` folder

#### Option B: FTP Upload
```bash
# Use an FTP client like FileZilla
# Connect with your Namecheap FTP credentials
# Host: ftp.yourdomain.com or server IP
# Username: your_cpanel_username
# Password: your_cpanel_password
# Port: 21

# Upload dist/ contents to public_html/
```

### 3. Configure .htaccess for React Router
Create `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType video/webm "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 🔗 Frontend-Backend Connection

### Important: Update API Base URL

Before deploying, update `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://your-backend-domain.com/api'  // Your live backend URL
    : 'http://localhost:4000/api',           // Local development
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Backend CORS Configuration

Ensure your backend allows requests from your frontend domain:

**If using Node.js/Express:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://your-namecheap-domain.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

---

## 📋 Environment Variables

Create `.env.production` in your project root (don't upload this):
```
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_URL=https://your-frontend-domain.com
```

Update `vite.config.js`:
```javascript
export default defineConfig({
  // ... other config
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
```

---

## 🚀 Quick Deploy Script

### For Windows (PowerShell):
```powershell
# Build the project
npm run build

# Upload via FTP using WinSCP or similar
# Or manually upload dist/ contents via cPanel
```

### Deploy with SCP (if you have SSH access):
```bash
# Compress build files
cd dist && zip -r ../maplorix-build.zip . && cd ..

# Upload to server
scp maplorix-build.zip user@your-server-ip:~/

# SSH into server and extract
ssh user@your-server-ip
cd ~/ && unzip maplorix-build.zip -d /home/username/public_html/
```

---

## 🔒 SSL/HTTPS Setup

1. **In Namecheap cPanel**:
   - Go to "SSL/TLS" section
   - Install free Let's Encrypt SSL
   - Or upload your SSL certificate

2. **Force HTTPS**:
   Add to `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

## ✅ Testing After Deployment

1. **Visit your domain**: `https://your-domain.com`
2. **Check browser console** for API errors
3. **Test authentication**: Login/Register
4. **Test job features**: View jobs, apply, post jobs
5. **Check network tab**: API calls should go to your backend

---

## 🐛 Troubleshooting

### Issue: API calls failing (CORS errors)
**Solution**: Update backend CORS to allow your frontend domain

### Issue: Routes not working (404 errors)
**Solution**: Ensure `.htaccess` is properly configured for React Router

### Issue: Static assets not loading
**Solution**: Check file paths and permissions (755 for folders, 644 for files)

### Issue: Mixed content warnings
**Solution**: Both frontend and backend must use HTTPS

---

## 📞 Backend Requirements Checklist

Ensure your backend server:
- ✅ Is running and accessible
- ✅ Has CORS configured for your frontend domain
- ✅ Uses HTTPS (for production)
- ✅ Database is connected and running
- ✅ API endpoints are working (test with Postman)
- ✅ Environment variables are set correctly

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] API calls connect to backend
- [ ] Authentication works (login/register)
- [ ] Job feed displays correctly
- [ ] Admin dashboard accessible (if applicable)
- [ ] SSL certificate active
- [ ] Mobile responsive design working
- [ ] SEO meta tags present (check with SEO tools)

---

## 📧 Need Help?

Common Namecheap support resources:
- Live Chat: Available 24/7
- Knowledge Base: https://www.namecheap.com/support/knowledgebase/
- Status Page: https://status.namecheap.com/

# Maplorix - Job Consultancy Website (React + Vite + Tailwind CSS)

A modern, professional job consultancy website for Maplorix built with React, Vite, and Tailwind CSS. The website features complete authentication system, role-based access control, and provides a seamless user experience for both job seekers and employers.

## 🔐 Authentication & Access Control

### User Roles & Permissions

**Regular Users can access:**

- Home
- About Us
- Feed (job listings) - **Requires Login**
- Contact Us

**Admin Users can access:**

- Home
- About Us
- Feed (job listings) - **Requires Login**
- Dashboard - **Requires Login**
- Admin Posts - **Requires Admin Role**
- Contact Us

### Authentication Features

- ✅ User Registration & Login
- ✅ JWT Token Authentication
- ✅ Role-based Access Control
- ✅ Protected Routes
- ✅ Auto-redirect for authenticated users
- ✅ Session management

## 🎨 Brand Guidelines

### Colors

- **Primary**: #023341 (dark teal) - Header, footer, main sections
- **Secondary**: #4CBD99 (teal green) - CTA buttons, highlights
- **Accent**: #149FC9 (blue) - Links, icons, accents
- **Tertiary**: #FFFFFF - Backgrounds and text on dark sections

### Typography

- **Headings (H1-H4)**: Montserrat font family, uppercase, bold
- **Body text**: Open Sans font family, sentence case, normal weight

## 🚀 Tech Stack

- **React 19** - Modern React with hooks
- **Vite 6** - Fast development server and build tool
- **Tailwind CSS** - Utility-first CSS framework with custom brand colors
- **React Router** - Client-side routing with animations
- **Framer Motion** - Smooth page transitions
- **PropTypes** - Runtime type checking
- **Axios** - HTTP client for API calls
- **JWT** - Authentication tokens

## 📁 Project Structure

```
maplorix/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ProtectedRoute.jsx  # Route protection wrapper
│   │   ├── PublicRoute.jsx      # Public route wrapper
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── context/           # React Context
│   │   ├── AuthContext.jsx     # Authentication context
│   │   ├── DataContext.jsx     # Data management context
│   │   └── ApplicationContext.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Dashboard.jsx      # User dashboard
│   │   ├── AdminPosts.jsx     # Admin job management
│   │   ├── PostsFeed.jsx      # Job listings feed
│   │   └── ...
│   ├── services/          # API services
│   │   └── api.js             # API configuration and methods
│   ├── constants/         # Application constants
│   │   └── index.js
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS + custom styles
├── deploy.sh              # Deployment script
├── DEPLOYMENT.md          # Deployment guide
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## 🛠️ Features

### Core Sections

1. **Authentication System** - Complete user auth with role management
2. **Header/Navbar** - Fixed navigation with user profile dropdown
3. **Hero Section** - Eye-catching introduction with CTAs
4. **About Us** - Company description and values
5. **Services** - Service offerings with icons
6. **Jobs Feed** - Job listings with application functionality
7. **Dashboard** - User dashboard for job management
8. **Admin Posts** - Admin panel for job management
9. **Contact** - Contact form with validation
10. **Footer** - Quick links and company details

### Interactive Features

- ✅ User authentication and authorization
- ✅ Role-based access control
- ✅ Protected routes with redirects
- ✅ Smooth scrolling navigation with active state
- ✅ Mobile-responsive hamburger menu
- ✅ Contact form with real-time validation
- ✅ Job application system
- ✅ Admin job management
- ✅ Scroll-to-top functionality
- ✅ Page transitions with animations
- ✅ Component-based architecture
- ✅ Custom React hooks for reusability

### Design Features

- ✅ Clean, corporate, modern design
- ✅ Fully responsive (mobile + desktop)
- ✅ Tailwind CSS utility classes
- ✅ Custom brand color palette
- ✅ Professional typography
- ✅ Card-based layouts
- ✅ Smooth transitions and hover effects

## 🔧 Architecture & Reusability

### Authentication Flow

1. **Registration**: User creates account → Redirect to login
2. **Login**: User authenticates → Redirect to dashboard/feed
3. **Protected Routes**: Check authentication → Redirect if needed
4. **Role-based Access**: Verify user role → Grant/deny access

### Context Management

- **AuthContext**: User authentication state and methods
- **DataContext**: Job and application data management
- **ApplicationContext**: Application-specific state

### Route Protection

- **ProtectedRoute**: Wrapper for authenticated routes
- **PublicRoute**: Wrapper for public routes (login/register)
- **Role-based Protection**: Admin-only routes

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Backend API running on port 4000 (or configured port)

### Installation

1. **Clone or download the project**

   ```bash
   git clone <repository-url>
   cd maplorix
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.production`:

   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   VITE_APP_NAME=Maplorix
   VITE_APP_DESCRIPTION=Professional Job Consultancy Services
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `./deploy.sh` - Automated deployment script

## 🚀 Deployment

### Quick Deployment

```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure environment variables
4. Ensure backend API is accessible

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🎯 Customization

### Brand Colors

Edit the colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#023341',
      secondary: '#4CBD99',
      accent: '#149FC9',
      // ... other colors
    }
  }
}
```

### User Roles

Default roles are configured in the registration form:

- `user` - Regular user access
- `admin` - Administrative access

### Content

Update content in `src/constants/index.js`:

- Navigation items
- Services data
- Job listings
- Contact information

## 🔐 Authentication Configuration

### Backend Requirements

Your backend API should provide:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- JWT token authentication
- User role management

### Frontend Configuration

- API base URL configured in environment variables
- Automatic token handling in API requests
- Protected route components
- Role-based access control

## 📱 Responsive Design

The website is fully responsive and optimized for:

- Desktop (1200px+)
- Tablets (768px - 1024px)
- Mobile phones (320px - 768px)
- Landscape orientations

## 🎨 Tailwind CSS Configuration

Custom configuration includes:

- Brand color palette
- Custom font families
- Extended animations
- Custom component classes
- Responsive breakpoints

## 🔧 Development

### Component Architecture

- Each section is a separate React component
- Custom hooks for reusable logic
- PropTypes for type safety
- Comprehensive documentation
- Context-based state management

### Styling Approach

- Tailwind CSS utilities for rapid development
- Reusable UI components
- Consistent design system
- Component-scoped styles

## 📊 Performance

- ⚡ Vite for fast development and builds
- 🗜️ Code splitting and tree shaking
- 🖼️ Optimized assets
- 📦 Minimal bundle size
- 🚀 Fast loading times
- 🔐 Secure authentication flow

## 🔒 Security Considerations

- JWT token authentication
- Protected routes and API endpoints
- Form validation on client-side
- XSS protection in form handling
- HTTPS ready
- Role-based access control
- Secure token storage

## 🚀 Future Enhancements

- [ ] Social login integration
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] File upload for resumes
- [ ] Advanced admin analytics
- [ ] Multi-language support

## 📞 Support

For questions or support regarding this website:

- Email: info@maplorix.com
- Phone: +1 (555) 123-4567

## 📄 License

This project is proprietary to Maplorix. All rights reserved.

---

**Maplorix** - Connecting Talent with Opportunity

Built with ❤️ using React, Vite, and Tailwind CSS

# Maplorix - Job Consultancy Website (React + Vite + Tailwind CSS)

A modern, professional job consultancy website for Maplorix built with React, Vite, and Tailwind CSS. The website follows strict brand guidelines and provides a seamless user experience for both job seekers and employers.

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

## 📁 Project Structure

```
maplorix/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Section.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Jobs.jsx
│   │   ├── Employers.jsx
│   │   ├── Candidates.jsx
│   │   ├── CTA.jsx
│   │   ├── Contact.jsx
│   │   ├── Footer.jsx
│   │   └── ScrollToTop.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Jobs.jsx
│   │   ├── Employers.jsx
│   │   ├── Candidates.jsx
│   │   └── Contact.jsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useNavigation.js
│   │   ├── useFormValidation.js
│   │   └── useScrollToTop.js
│   ├── constants/         # Application constants
│   │   └── index.js
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS + custom styles
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## 🛠️ Features

### Core Sections

1. **Header/Navbar** - Fixed navigation with mobile menu
2. **Hero Section** - Eye-catching introduction with CTAs
3. **About Us** - Company description and values
4. **Services** - Service offerings with icons
5. **Jobs** - Featured job listings with application functionality
6. **Employers** - Information for hiring companies
7. **Candidates** - Step-by-step application process
8. **Call to Action** - Conversion-focused section
9. **Contact** - Contact form with validation
10. **Footer** - Quick links and company details

### Interactive Features

- ✅ Smooth scrolling navigation with active state
- ✅ Mobile-responsive hamburger menu
- ✅ Contact form with real-time validation
- ✅ Job application pre-filling
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

### Custom Hooks

- **useNavigation** - Mobile menu state and navigation logic
- **useFormValidation** - Form validation and state management
- **useScrollToTop** - Scroll to top functionality

### Reusable Components

- **Button** - Consistent button styling with variants
- **Card** - Flexible card component with hover effects
- **Section** - Standardized section layout

### Constants & Configuration

- **ROUTES** - Centralized route definitions
- **NAVIGATION_ITEMS** - Navigation configuration
- **SERVICES_DATA** - Services content
- **JOBS_DATA** - Job listings
- **VALIDATION_RULES** - Form validation rules

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

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

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

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

### Content

Update content in `src/constants/index.js`:

- Navigation items
- Services data
- Job listings
- Contact information

### Adding New Sections

1. Create page component in `src/pages/`
2. Add route configuration in `src/constants/index.js`
3. Update navigation items if needed

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

## 🔒 Security Considerations

- Form validation on client-side
- XSS protection in form handling
- HTTPS ready
- No external dependencies except CDN assets

## 🚀 Future Enhancements

- [ ] Backend integration for contact form
- [ ] Dynamic job listings from API
- [ ] User authentication system
- [ ] Job application tracking
- [ ] Employer dashboard
- [ ] Advanced search functionality
- [ ] Blog/news section
- [ ] Testimonials carousel
- [ ] Social media integration

## 📞 Support

For questions or support regarding this website:

- Email: info@maplorix.com
- Phone: +1 (555) 123-4567

## 📄 License

This project is proprietary to Maplorix. All rights reserved.

---

**Maplorix** - Connecting Talent with Opportunity

Built with ❤️ using React, Vite, and Tailwind CSS

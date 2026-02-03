/**
 * Application Constants
 * Centralized configuration for better maintainability
 */

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
}

// Navigation Items Configuration
export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', path: ROUTES.HOME },
  { id: 'about', label: 'About Us', path: ROUTES.ABOUT },
  { id: 'contact', label: 'Contact Us', path: ROUTES.CONTACT },
]

// Contact Information
export const CONTACT_INFO = {
  phone: '+1 (555) 123-4567',
  email: 'info@maplorix.com',
  address: '123 Business Ave, Suite 100\nNew York, NY 10001',
  hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 2:00 PM',
}

// Footer Links Configuration
export const FOOTER_LINKS = {
  quick: [
    { label: 'About Us', href: ROUTES.ABOUT },
    { label: 'Services', href: ROUTES.SERVICES },
    { label: 'Post Job', href: ROUTES.POST_JOB },
  ],
  employers: [
    { label: 'Post Job', href: ROUTES.POST_JOB },
    { label: 'Our Services', href: ROUTES.SERVICES },
    { label: 'About Us', href: ROUTES.ABOUT },
  ],
  candidates: [
    { label: 'Upload Resume', href: ROUTES.RESUME_UPLOAD },
    { label: 'Our Services', href: ROUTES.SERVICES },
    { label: 'Get in Touch', href: ROUTES.CONTACT },
  ],
}

// Animation Variants
export const ANIMATION_VARIANTS = {
  pageTransition: {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3, ease: 'easeIn' } },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },
}

// Services Data
export const SERVICES_DATA = [
  {
    id: 1,
    icon: 'fa-briefcase',
    title: 'Job Placement',
    description:
      'We connect skilled professionals with their ideal positions, ensuring perfect matches for long-term success.',
  },
  {
    id: 2,
    icon: 'fa-users',
    title: 'Recruitment Solutions',
    description:
      "Comprehensive recruitment services tailored to your company's specific needs and culture.",
  },
  {
    id: 3,
    icon: 'fa-compass',
    title: 'Career Guidance',
    description:
      'Expert career counseling and guidance to help you navigate your professional journey.',
  },
  {
    id: 4,
    icon: 'fa-handshake',
    title: 'Employer Hiring Support',
    description:
      'End-to-end hiring support from job posting to candidate onboarding and beyond.',
  },
]

// Jobs Data
export const JOBS_DATA = [
  {
    id: 1,
    title: 'Senior Software Developer',
    company: 'Tech Solutions Inc.',
    location: 'New York, NY',
    type: 'Full-time',
  },
  {
    id: 2,
    title: 'Marketing Manager',
    company: 'Global Brands Ltd.',
    location: 'Los Angeles, CA',
    type: 'Full-time',
  },
  {
    id: 3,
    title: 'Financial Analyst',
    company: 'Finance Corp',
    location: 'Chicago, IL',
    type: 'Full-time',
  },
  {
    id: 4,
    title: 'UX Designer',
    company: 'Creative Agency',
    location: 'San Francisco, CA',
    type: 'Contract',
  },
  {
    id: 5,
    title: 'Project Manager',
    company: 'Construction Co.',
    location: 'Boston, MA',
    type: 'Full-time',
  },
  {
    id: 6,
    title: 'Data Scientist',
    company: 'AI Innovations',
    location: 'Seattle, WA',
    type: 'Full-time',
  },
]

// Candidate Steps Data
export const CANDIDATE_STEPS = [
  {
    id: 1,
    title: 'Create Your Profile',
    description:
      'Register with Maplorix and build your professional profile to showcase your skills and experience.',
  },
  {
    id: 2,
    title: 'Browse Opportunities',
    description:
      'Explore our curated job listings and find positions that match your career goals and expertise.',
  },
  {
    id: 3,
    title: 'Apply & Connect',
    description:
      'Submit your application and connect with our career consultants for personalized guidance.',
  },
  {
    id: 4,
    title: 'Land Your Dream Job',
    description:
      'Interview with top employers and secure your ideal position with our support throughout the process.',
  },
]

// Employer Benefits
export const EMPLOYER_BENEFITS = [
  'Access to pre-vetted talent pool',
  'Reduced hiring time by 40%',
  '90-day replacement guarantee',
  'Dedicated account manager',
]

// Form Validation Rules
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    message: 'Please enter a valid name (at least 2 characters)',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  subject: {
    required: true,
    minLength: 3,
    message: 'Please enter a subject (at least 3 characters)',
  },
  message: {
    required: true,
    minLength: 10,
    message: 'Please enter a message (at least 10 characters)',
  },
}

/**
 * Main App Component
 * Root component with routing and animations
 */

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import AboutPage from './pages/About';
import ServicesPage from './pages/Services';
import ResumeUploadPage from './pages/ResumeUpload';
import ContactPage from './pages/Contact';

// Constants
import { ANIMATION_VARIANTS, ROUTES } from './constants';

/**
 * AnimatedRoutes component for page transitions
 * @returns {JSX.Element} Animated routes
 */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path={ROUTES.HOME}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path={ROUTES.ABOUT}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AboutPage />
            </motion.div>
          }
        />
        <Route
          path={ROUTES.SERVICES}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ServicesPage />
            </motion.div>
          }
        />
        <Route
          path={ROUTES.RESUME_UPLOAD}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ResumeUploadPage />
            </motion.div>
          }
        />
        <Route
          path={ROUTES.CONTACT}
          element={
            <motion.div
              variants={ANIMATION_VARIANTS.pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ContactPage />
            </motion.div>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

/**
 * Main App component
 * @returns {JSX.Element} App component
 */
const App = () => {
  return (
    <Router>
      <Header />
      <AnimatedRoutes />
      <Footer />
      <ScrollToTop />
    </Router>
  );
};

export default App;

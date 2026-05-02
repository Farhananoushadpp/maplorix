/**
 * reCAPTCHA Utility Functions for Maplorix
 * Provides common reCAPTCHA functionality and error handling
 */

// Get reCAPTCHA site key from environment
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y';

// Development test key (Google's official test key)
export const RECAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y';

/**
 * Check if reCAPTCHA is available and loaded
 * @returns {boolean} Whether reCAPTCHA is ready
 */
export const isRecaptchaReady = () => {
  return typeof window !== 'undefined' && 
         window.grecaptcha && 
         window.grecaptcha.ready;
};

/**
 * Wait for reCAPTCHA to be ready
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} Promise that resolves when reCAPTCHA is ready
 */
export const waitForRecaptcha = (timeout = 10000) => {
  return new Promise((resolve) => {
    if (isRecaptchaReady()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isRecaptchaReady()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
};

/**
 * Get reCAPTCHA token from widget
 * @param {React.RefObject} recaptchaRef - Reference to reCAPTCHA widget
 * @returns {string|null} reCAPTCHA token or null if not available
 */
export const getRecaptchaToken = (recaptchaRef) => {
  if (!recaptchaRef.current) {
    console.warn('reCAPTCHA widget reference not available');
    return null;
  }

  try {
    return recaptchaRef.current.getValue();
  } catch (error) {
    console.error('Error getting reCAPTCHA token:', error);
    return null;
  }
};

/**
 * Reset reCAPTCHA widget
 * @param {React.RefObject} recaptchaRef - Reference to reCAPTCHA widget
 */
export const resetRecaptcha = (recaptchaRef) => {
  if (!recaptchaRef.current) {
    console.warn('reCAPTCHA widget reference not available');
    return;
  }

  try {
    recaptchaRef.current.reset();
  } catch (error) {
    console.error('Error resetting reCAPTCHA:', error);
  }
};

/**
 * Validate reCAPTCHA token
 * @param {React.RefObject} recaptchaRef - Reference to reCAPTCHA widget
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateRecaptcha = (recaptchaRef) => {
  const token = getRecaptchaToken(recaptchaRef);
  
  if (!token) {
    return {
      isValid: false,
      error: 'Please complete the reCAPTCHA challenge'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Handle reCAPTCHA errors with user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const handleRecaptchaError = (error) => {
  console.error('reCAPTCHA error:', error);

  if (error.response?.status === 400) {
    const errorMessage = error.response.data.message;
    
    if (errorMessage.includes('reCAPTCHA') || errorMessage.includes('captcha')) {
      return 'reCAPTCHA verification failed. Please try again.';
    }
  }

  if (error.message?.includes('timeout')) {
    return 'reCAPTCHA verification timed out. Please try again.';
  }

  if (error.message?.includes('network')) {
    return 'Network error during reCAPTCHA verification. Please check your connection.';
  }

  return 'reCAPTCHA verification failed. Please try again.';
};

/**
 * Check if running in development mode
 * @returns {boolean} Whether in development mode
 */
export const isDevelopmentMode = () => {
  return import.meta.env.DEV;
};

/**
 * Get appropriate reCAPTCHA site key based on environment
 * @returns {string} reCAPTCHA site key
 */
export const getRecaptchaSiteKey = () => {
  if (isDevelopmentMode()) {
    return RECAPTCHA_TEST_KEY;
  }
  
  return RECAPTCHA_SITE_KEY;
};

/**
 * Create reCAPTCHA error handler for forms
 * @param {Function} setError - Function to set error state
 * @param {React.RefObject} recaptchaRef - Reference to reCAPTCHA widget
 * @returns {Function} Error handler function
 */
export const createRecaptchaErrorHandler = (setError, recaptchaRef) => {
  return (error) => {
    const errorMessage = handleRecaptchaError(error);
    setError({ recaptcha: errorMessage });
    resetRecaptcha(recaptchaRef);
  };
};

/**
 * Add reCAPTCHA token to form data
 * @param {Object} formData - Original form data
 * @param {string} token - reCAPTCHA token
 * @returns {Object} Form data with reCAPTCHA token
 */
export const addRecaptchaTokenToFormData = (formData, token) => {
  return {
    ...formData,
    recaptchaToken: token
  };
};

// Error mapping utility for Maplorix Frontend

/**
 * Maps backend error responses and error codes to user-friendly messages.
 * Prevents displaying raw technical messages like AxiosError, MongoServerError, 500, etc.
 * 
 * @param {Object|Error|string} error - Error object or string
 * @returns {string} Clean user-friendly message
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.'

  // If string was passed directly
  if (typeof error === 'string') {
    return mapCodeOrMessageToFriendly(error)
  }

  // Extract from backend JSON response structure
  const responseData = error.response?.data
  const status = error.response?.status
  const errorCode = responseData?.errorCode || responseData?.code || responseData?.error

  // Check specific error codes from backend
  if (errorCode === 'USER_ALREADY_EXISTS') {
    return 'An account with this email or mobile number already exists.'
  }

  if (errorCode === 'INVALID_OTP') {
    return 'Invalid OTP. Please try again.'
  }

  if (errorCode === 'OTP_EXPIRED') {
    return 'OTP has expired. Please request a new OTP.'
  }

  if (errorCode === 'MAX_OTP_ATTEMPTS_EXCEEDED') {
    return 'Maximum OTP attempts exceeded. Please request a new OTP.'
  }

  if (errorCode === 'INVALID_CREDENTIALS') {
    return 'Invalid email or password.'
  }

  if (errorCode === 'ACCOUNT_DEACTIVATED') {
    return 'Your account has been deactivated.'
  }

  if (errorCode === 'VALIDATION_ERROR') {
    return responseData?.message || 'Please check your form inputs and try again.'
  }

  // Check backend message string
  if (responseData?.message && typeof responseData.message === 'string') {
    // If backend provided a readable message, map it or return it if clean
    const mapped = mapCodeOrMessageToFriendly(responseData.message)
    if (mapped) return mapped
    if (!isTechnicalErrorString(responseData.message)) {
      return responseData.message
    }
  }

  // Handle HTTP status codes
  if (status === 409) {
    return 'An account with this email or mobile number already exists.'
  }

  if (status === 401) {
    return 'Invalid email or password.'
  }

  if (status === 400) {
    return responseData?.message || 'Invalid request. Please check your information.'
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (status === 404) {
    return 'Requested resource not found.'
  }

  if (status >= 500) {
    return 'Server error. Please try again later.'
  }

  // Handle network connectivity issues
  if (
    error.code === 'ECONNREFUSED' ||
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('Network Error')
  ) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }

  // Fallback for general Error objects
  if (error.message && !isTechnicalErrorString(error.message)) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Checks if a string contains technical error details that shouldn't be shown to users.
 */
const isTechnicalErrorString = (msg) => {
  if (typeof msg !== 'string') return false
  const lower = msg.toLowerCase()
  return (
    lower.includes('axioserror') ||
    lower.includes('mongoservererror') ||
    lower.includes('500 internal server error') ||
    lower.includes('econnrefused') ||
    lower.includes('err_network') ||
    lower.includes('cast to objectid') ||
    lower.includes('unhandled rejection') ||
    lower.includes('syntaxerror') ||
    lower.includes('typeerror')
  )
}

/**
 * Maps known error string patterns to clean messages.
 */
const mapCodeOrMessageToFriendly = (str) => {
  if (!str) return ''
  const upper = str.toUpperCase()

  if (upper.includes('USER_ALREADY_EXISTS') || upper.includes('USER ALREADY EXISTS')) {
    return 'An account with this email or mobile number already exists.'
  }

  if (upper.includes('INVALID_OTP') || upper.includes('INVALID OTP')) {
    return 'Invalid OTP. Please try again.'
  }

  if (upper.includes('OTP_EXPIRED') || upper.includes('OTP HAS EXPIRED')) {
    return 'OTP has expired. Please request a new OTP.'
  }

  if (upper.includes('MAX_OTP_ATTEMPTS_EXCEEDED')) {
    return 'Maximum OTP attempts exceeded. Please request a new OTP.'
  }

  if (upper.includes('INVALID_CREDENTIALS') || upper.includes('INVALID EMAIL OR PASSWORD')) {
    return 'Invalid email or password.'
  }

  return ''
}

export default getFriendlyErrorMessage

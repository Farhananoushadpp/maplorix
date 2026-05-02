import React, { useState, useRef, useEffect } from 'react'
import { sendEmailViaMailto, logEmailData } from '../services/emailService'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    recaptchaToken: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // reCAPTCHA configuration
  const recaptchaRef = useRef()
  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y' // Test key for development

  const contactInfo = [
    {
      icon: 'fa-phone',
      title: 'Call Us',
      text: '044538999, +971581929900',
      description: 'Mon-Fri: 9AM-6PM GST',
    },
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      text: 'hr@maplorix.ae',
      description: 'We respond within 24 hours',
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Visit Us',
      text: 'A5 Block, Office No:45, Xavier Business Center',
      description: 'Burj Nahar Mall, Al Muteena, Dubai',
    },
    {
      icon: 'fa-clock',
      title: 'Business Hours',
      text: 'Mon-Fri: 9:00 AM - 7:00 PM',
      description: 'Saturday: 9:00 AM - 4:00 PM',
    },
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter a valid name (at least 2 characters)'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      newErrors.subject = 'Please enter a subject (at least 3 characters)'
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter a message (at least 10 characters)'
    }

    // reCAPTCHA validation
    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA challenge'
    }

    return newErrors
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      setErrors({ recaptcha: 'Please complete the reCAPTCHA challenge' })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Add reCAPTCHA token to form data
      const submissionData = {
        ...formData,
        recaptchaToken,
      }

      // Log the email data for debugging
      logEmailData(submissionData)

      // Open email client with pre-filled message to hr@maplorix.ae
      const result = sendEmailViaMailto(submissionData)

      setSubmitMessage(
        '📧 Your email client has been opened with your message pre-filled. Please send the email to hr@maplorix.ae to complete your submission.'
      )

      // Reset form and reCAPTCHA after successful opening
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          recaptchaToken: '',
        })
        setErrors({})
        // Reset reCAPTCHA widget
        if (recaptchaRef.current) {
          recaptchaRef.current.reset()
        }
      }, 2000)

      setTimeout(() => {
        setSubmitMessage('')
      }, 10000)
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitMessage(`❌ ${error.message}`)
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-primary overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          ></div>
        </div>
        <div className="relative z-10 container px-4 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Get In{' '}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-white/75 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
            Have questions? Ready to get started? We're here to help you
            succeed. Reach out and our team will respond within 24 hours.
          </p>
          {/* Quick contact chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <a
              href="tel:044538999"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            >
              <i className="fas fa-phone text-secondary"></i>
              044538999
            </a>
            <a
              href="mailto:hr@maplorix.ae"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            >
              <i className="fas fa-envelope text-accent"></i>
              hr@maplorix.ae
            </a>
            <span className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium">
              <i className="fas fa-map-marker-alt text-secondary"></i>
              Dubai, UAE
            </span>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      <div className="container px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-8">
              Get in Touch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-xl flex items-center justify-center mr-4">
                      <i className={`fas ${info.icon} text-accent text-xl`}></i>
                    </div>
                    <h4 className="font-bold text-primary">{info.title}</h4>
                  </div>
                  <p className="text-primary font-semibold mb-1">{info.text}</p>
                  <p className="text-gray-500 text-sm">{info.description}</p>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-6 border border-secondary/20">
              <h4 className="text-lg font-bold text-primary mb-4">
                Why Choose Maplorix?
              </h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mr-2 mt-1"></i>
                  <span>Expert career guidance and support</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mr-2 mt-1"></i>
                  <span>Personalized approach for every candidate</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mr-2 mt-1"></i>
                  <span>Proven track record of success</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mr-2 mt-1"></i>
                  <span>24/7 customer support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-primary mb-6">
              Send Us a Message
            </h3>

            {submitMessage && (
              <div
                className={`mb-6 p-4 rounded-xl text-center ${
                  submitMessage.includes('📧')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : submitMessage.includes('✅')
                      ? 'bg-secondary/10 text-secondary border border-secondary/20'
                      : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                <i
                  className={`fas ${
                    submitMessage.includes('📧')
                      ? 'fa-envelope-open-text'
                      : submitMessage.includes('✅')
                        ? 'fa-check-circle'
                        : 'fa-exclamation-circle'
                  } mr-2`}
                ></i>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your Email"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.email
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Subject"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.subject
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your Message"
                  rows={5}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-vertical ${
                    errors.message
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* reCAPTCHA Widget */}
              <div className="flex justify-center">
                <div
                  className="g-recaptcha"
                  data-sitekey={RECAPTCHA_SITE_KEY}
                  ref={recaptchaRef}
                ></div>
              </div>

              {errors.recaptcha && (
                <p className="text-red-500 text-sm text-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.recaptcha}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-secondary to-accent text-primary font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Sending Message...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-paper-plane mr-3"></i>
                    Send Message
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

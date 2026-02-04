import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const contactInfo = [
    {
      icon: 'fa-phone',
      title: 'Call Us',
      text: '044538999, 0581929900',
      description: 'Mon-Fri: 9AM-6PM GST'
    },
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      text: 'hr@maplorix.ae',
      description: 'We respond within 24 hours'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Visit Us',
      text: 'A5 Block, Office No:45, Xavier Business Center',
      description: 'Burj Nahar Mall, Al Muteena, Dubai'
    },
    {
      icon: 'fa-clock',
      title: 'Business Hours',
      text: 'Mon-Fri: 9:00 AM - 6:00 PM',
      description: 'Saturday: 10:00 AM - 2:00 PM'
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter a valid name (at least 2 characters)';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      newErrors.subject = 'Please enter a subject (at least 3 characters)';
    }
    
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter a message (at least 10 characters)';
    }
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setErrors({});
      
      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
      
    } catch (error) {
      setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">Contact Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg px-2">
            Have questions? Ready to get started? We're here to help you succeed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="order-2 lg:order-1">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8">Get in Touch</h3>
            
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <i className={`fas ${info.icon} text-secondary text-sm sm:text-base`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-1">{info.title}</h4>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium break-words">{info.text}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="order-1 lg:order-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8">Send Us a Message</h3>
            
            {submitMessage && (
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl ${
                submitMessage.includes('Thank you') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-xs sm:text-sm ${
                  submitMessage.includes('Thank you') ? 'text-green-800' : 'text-red-800'
                }`}>
                  {submitMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm sm:text-base ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm sm:text-base ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm sm:text-base ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="How can we help?"
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-600">{errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm sm:text-base resize-none ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us more about your needs..."
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-secondary to-accent text-primary font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Message
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

import React, { useState } from 'react';

const ContactPage = () => {
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
      text: '+1 (555) 123-4567',
      description: 'Mon-Fri: 9AM-6PM EST'
    },
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      text: 'info@maplorix.com',
      description: 'We respond within 24 hours'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Visit Us',
      text: '123 Business Ave, Suite 100',
      description: 'New York, NY 10001'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-primary mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions? Ready to get started? We're here to help you succeed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-8">Get in Touch</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
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
              <h4 className="text-lg font-bold text-primary mb-4">Why Choose Maplorix?</h4>
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
            <h3 className="text-2xl font-bold text-primary mb-6">Send Us a Message</h3>
            
            {submitMessage && (
              <div className={`mb-6 p-4 rounded-xl text-center ${
                submitMessage.includes('Thank you') 
                  ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                <i className={`fas ${submitMessage.includes('Thank you') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
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
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                    errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                    errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
  );
};

export default ContactPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../services/api';

const ResumeUpload = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobRole: '',
    experience: '',
    skills: '',
    coverLetter: '',
    linkedinProfile: '',
    portfolio: '',
    expectedSalary: '',
    availability: '',
    resume: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');

  const experienceOptions = [
    { value: '', label: 'Select Experience' },
    { value: 'fresher', label: 'Fresher' },
    { value: '1-3', label: '1–3 Years' },
    { value: '3-5', label: '3–5 Years' },
    { value: '5+', label: '5+ Years' }
  ];

  const availabilityOptions = [
    { value: '', label: 'Select Availability' },
    { value: 'immediately', label: 'Immediately' },
    { value: '2-weeks', label: '2 Weeks' },
    { value: '1-month', label: '1 Month' },
    { value: '2-months', label: '2 Months' },
    { value: '3-months', label: '3+ Months' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (at least 2 characters)';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone) || formData.phone.trim().length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Please enter your location';
    }
    
    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Please enter the job role you are applying for';
    }
    
    if (!formData.experience) {
      newErrors.experience = 'Please select your experience level';
    }
    
    if (!formData.resume) {
      newErrors.resume = 'Please upload your resume';
    } else {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(formData.resume.type)) {
        newErrors.resume = 'Please upload a PDF, DOC, or DOCX file';
      } else if (formData.resume.size > maxSize) {
        newErrors.resume = 'File size must be less than 5MB';
      }
    }
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      
      // Clear resume error when file is selected
      if (errors.resume) {
        setErrors(prev => ({
          ...prev,
          resume: ''
        }));
      }
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
    setUploadProgress(0);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'resume' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add resume file
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }
      
      // Add additional metadata
      formDataToSend.append('status', 'submitted');
      formDataToSend.append('source', 'website');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the API
      const response = await applicationsAPI.createApplication(formDataToSend);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setSubmitMessage('Thank you for submitting your resume! Our team will review your profile and contact you soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        jobRole: '',
        experience: '',
        skills: '',
        coverLetter: '',
        linkedinProfile: '',
        portfolio: '',
        expectedSalary: '',
        availability: '',
        resume: null
      });
      setErrors({});
      setUploadProgress(0);
      
      // Clear file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage('');
        navigate('/');
      }, 5000);
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      setSubmitMessage(error.response?.data?.message || 'Sorry, there was an error uploading your resume. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {/* Professional Header */}
      <div className="bg-primary text-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-secondary/20 rounded-full p-3">
                <i className="fas fa-file-upload text-secondary text-2xl"></i>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Our Talent Network</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Take the next step in your career journey. Upload your resume and let our expert team connect you with exceptional opportunities that match your skills and aspirations.
            </p>
            <div className="flex justify-center mt-6 space-x-8">
              <div className="flex items-center text-sm text-white/80">
                <i className="fas fa-shield-alt text-secondary mr-2"></i>
                Secure & Confidential
              </div>
              <div className="flex items-center text-sm text-white/80">
                <i className="fas fa-clock text-accent mr-2"></i>
                Quick Review Process
              </div>
              <div className="flex items-center text-sm text-white/80">
                <i className="fas fa-users text-secondary mr-2"></i>
                1000+ Companies
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div className="bg-white/20 rounded-full p-2">
                  <i className="fas fa-briefcase text-white"></i>
                </div>
                <div className="bg-white/20 rounded-full p-2">
                  <i className="fas fa-file-alt text-white"></i>
                </div>
                <div className="bg-white/20 rounded-full p-2">
                  <i className="fas fa-check text-white"></i>
                </div>
              </div>
              <div className="text-white text-sm">
                Step {uploadProgress > 0 ? '3' : '1'} of 4
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {submitMessage && (
              <div className={`p-4 rounded-lg border ${
                submitMessage.includes('Thank you') 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <i className={`fas ${submitMessage.includes('Thank you') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3`}></i>
                  {submitMessage}
                </div>
              </div>
            )}

            {/* Personal Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <i className="fas fa-user text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="New York, NY"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 rounded-full p-2">
                  <i className="fas fa-briefcase text-accent"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Professional Details</h3>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="jobRole" className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Job Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="jobRole"
                      name="jobRole"
                      value={formData.jobRole}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Software Developer"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.jobRole ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.jobRole && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.jobRole}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      disabled={isSubmitting}
                    >
                      {experienceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.experience && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="availability" className="block text-sm font-semibold text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                      disabled={isSubmitting}
                    >
                      {availabilityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="expectedSalary" className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Salary
                    </label>
                    <input
                      type="text"
                      id="expectedSalary"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleInputChange}
                      placeholder="e.g., $80,000 - $120,000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-2">
                    Key Skills
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="List your key skills separated by commas (e.g., JavaScript, React, Node.js, MongoDB, AWS)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Tell us why you're passionate about this role and what makes you an ideal candidate..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white resize-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary/10 rounded-full p-2">
                  <i className="fas fa-link text-secondary"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Professional Profiles</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                <div>
                  <label htmlFor="linkedinProfile" className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fab fa-linkedin text-gray-400"></i>
                    </div>
                    <input
                      type="url"
                      id="linkedinProfile"
                      name="linkedinProfile"
                      value={formData.linkedinProfile}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/johndoe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Portfolio Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-globe text-gray-400"></i>
                    </div>
                    <input
                      type="url"
                      id="portfolio"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 rounded-full p-2">
                  <i className="fas fa-file-upload text-accent"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Resume Upload</h3>
              </div>
              
              <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-8 rounded-lg border-2 border-dashed border-accent/30">
                <div className="text-center">
                  <div className="mb-4">
                    <i className="fas fa-cloud-upload-alt text-4xl text-accent"></i>
                  </div>
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-700">Upload Your Resume</span>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, DOC, or DOCX (Maximum file size: 5MB)
                    </p>
                    <input
                      type="file"
                      id="resume-upload"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <div className="mt-4">
                      <span className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
                        <i className="fas fa-folder-open mr-2"></i>
                        Choose File
                      </span>
                    </div>
                  </label>
                  
                  {formData.resume && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                      <div className="flex items-center justify-center text-green-700">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span className="font-medium">{formData.resume.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {errors.resume && (
                    <p className="text-red-500 text-sm mt-3 flex items-center justify-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.resume}
                    </p>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy & Trust Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <i className="fas fa-shield-alt text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy & Security Commitment</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your privacy is our top priority. By submitting your resume, you consent to Maplorix storing your information securely for recruitment purposes only. We use industry-standard encryption and will never share your data with third parties without your explicit consent. You can request data removal at any time.
                  </p>
                  <div className="flex items-center mt-3 space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <i className="fas fa-lock mr-1"></i>
                      256-bit Encryption
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-user-shield mr-1"></i>
                      GDPR Compliant
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-eye-slash mr-1"></i>
                      Private & Confidential
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="group relative px-8 py-4 bg-secondary hover:bg-secondary/90 text-primary font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                disabled={isSubmitting}
              >
                <span className="flex items-center">
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-3"></i>
                      {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-3"></i>
                      Submit Application
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <i className="fas fa-award text-yellow-500 mr-2"></i>
              <span>Trusted by 500+ Companies</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-users text-blue-500 mr-2"></i>
              <span>10,000+ Professionals</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-star text-green-500 mr-2"></i>
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;

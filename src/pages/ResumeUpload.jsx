import React, { useState } from 'react';

const ResumeUpload = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobRole: '',
    experience: '',
    skills: '',
    resume: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const experienceOptions = [
    { value: '', label: 'Select Experience' },
    { value: 'fresher', label: 'Fresher' },
    { value: '1-3', label: '1–3 Years' },
    { value: '3-5', label: '3–5 Years' },
    { value: '5+', label: '5+ Years' }
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
    
    // Simulate file upload with progress
    try {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
      }, 5000);
      
    } catch (error) {
      setSubmitMessage('Sorry, there was an error uploading your resume. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <section id="resume-upload" className="py-16 sm:py-20 bg-gray-50">
      <div className="container px-4">
        <div className="section-header">
          <h2 className="section-title">Upload Your Resume</h2>
          <div className="divider"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Page Title & Description */}
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              Join Our Talent Network
            </h3>
            <p className="text-text-light max-w-2xl mx-auto text-base sm:text-lg">
              Upload your resume and let our expert team help you find the perfect job opportunity. 
              We'll review your profile and match you with relevant positions.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            {submitMessage && (
              <div className={`mb-6 p-4 rounded-lg text-center ${
                submitMessage.includes('Thank you') 
                  ? 'bg-secondary/10 text-secondary' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">Personal Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-text-dark mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.fullName ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.email ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.phone ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-text-dark mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State/Country"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.location ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">Professional Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobRole" className="block text-sm font-medium text-text-dark mb-2">
                      Job Role / Position Applying For *
                    </label>
                    <input
                      type="text"
                      id="jobRole"
                      name="jobRole"
                      value={formData.jobRole}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Developer, Marketing Manager"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.jobRole ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.jobRole && (
                      <p className="text-red-500 text-sm mt-1">{errors.jobRole}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-text-dark mb-2">
                      Experience *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.experience ? 'border-red-500' : 'border-border-color'
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
                      <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-text-dark mb-2">
                    Skills (Optional)
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="List your key skills separated by commas (e.g., JavaScript, React, Node.js, MongoDB)"
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-vertical text-base ${
                      errors.skills ? 'border-red-500' : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.skills && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
                  )}
                </div>
              </div>

              {/* Resume Upload Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">Resume Upload</h4>
                
                <div>
                  <label htmlFor="resume-upload" className="block text-sm font-medium text-text-dark mb-2">
                    Upload Resume * (PDF / DOC / DOCX - Max size: 5MB)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resume-upload"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary/90 ${
                        errors.resume ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {formData.resume && (
                      <div className="mt-2 text-sm text-text-light">
                        Selected: {formData.resume.name} ({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                  {errors.resume && (
                    <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Privacy Note / Consent */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-text-light">
                  <strong>Privacy Note:</strong> By submitting your resume, you consent to Maplorix 
                  storing your personal information and resume for recruitment purposes. 
                  We will use this information to contact you about relevant job opportunities 
                  and will not share your data with third parties without your consent.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-full text-lg sm:text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
                    </span>
                  ) : (
                    'Submit Resume'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeUpload;

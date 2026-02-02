import React, { useState } from 'react';
import { jobsAPI } from '../services/api';

const JobPost = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
    company: '',
    jobType: 'Full-time',
    description: '',
    requirements: '',
    salary: '',
    category: 'Technology',
    experience: 'Mid Level',
    skills: '',
    applicationDeadline: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Remote', label: 'Remote' }
  ];

  const categoryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' }
  ];

  const experienceOptions = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead/Manager', label: 'Lead/Manager' },
    { value: 'Executive', label: 'Executive' }
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
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Please enter the job title';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Please enter the company name';
    }
    
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      newErrors.description = 'Please enter a job description (at least 20 characters)';
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Please enter the job requirements';
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
      // Prepare job data for API
      const jobData = {
        title: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        type: formData.jobType,
        category: formData.category,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements,
        salary: formData.salary ? { currency: 'USD', amount: formData.salary } : undefined,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined,
        contactInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        isActive: true,
        featured: false,
        tags: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : []
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Call the API
      const response = await jobsAPI.createJob(jobData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setSubmitMessage('Thank you for posting your job! Your listing has been submitted successfully and will be reviewed shortly. Qualified candidates will be able to apply soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        jobTitle: '',
        company: '',
        jobType: 'Full-time',
        description: '',
        requirements: '',
        salary: '',
        category: 'Technology',
        experience: 'Mid Level',
        skills: '',
        applicationDeadline: ''
      });
      setErrors({});
      setUploadProgress(0);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error posting job:', error);
      setSubmitMessage(error.response?.data?.message || 'Sorry, there was an error posting your job. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
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
              Post a Job Opportunity
            </h3>
            <p className="text-text-light max-w-2xl mx-auto text-base sm:text-lg">
              Create a job listing and find the perfect candidate for your organization. 
              Fill in the details below to post your job opportunity.
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
              {/* Contact Information Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">Contact Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-text-dark mb-2">
                      Your Name *
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

              {/* Job Details Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">Job Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-text-dark mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Developer"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.jobTitle ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-text-dark mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g., Tech Corp"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.company ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.company && (
                      <p className="text-red-500 text-sm mt-1">{errors.company}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="jobType" className="block text-sm font-medium text-text-dark mb-2">
                      Job Type *
                    </label>
                    <select
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.jobType ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    >
                      {jobTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.jobType && (
                      <p className="text-red-500 text-sm mt-1">{errors.jobType}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-text-dark mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.category ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-text-dark mb-2">
                      Experience Level *
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

                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-text-dark mb-2">
                      Salary (Optional)
                    </label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g., $80,000 - $120,000"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.salary ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.salary && (
                      <p className="text-red-500 text-sm mt-1">{errors.salary}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-dark mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-vertical text-base ${
                      errors.description ? 'border-red-500' : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-text-dark mb-2">
                    Requirements *
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="List the required qualifications, skills, and experience..."
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-vertical text-base ${
                      errors.requirements ? 'border-red-500' : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.requirements && (
                    <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-medium text-text-dark mb-2">
                    Application Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                      errors.applicationDeadline ? 'border-red-500' : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.applicationDeadline && (
                    <p className="text-red-500 text-sm mt-1">{errors.applicationDeadline}</p>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">Additional Information</h4>
                
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-text-dark mb-2">
                    Required Skills (Optional)
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="List required skills separated by commas (e.g., JavaScript, React, Node.js, MongoDB)"
                    rows={3}
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

              {/* Privacy Note / Consent */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-text-light">
                  <strong>Privacy Note:</strong> By posting this job, you confirm that you have the authority 
                  to recruit for this position. Maplorix will use this information to connect you with 
                  qualified candidates and will not share your data with third parties without your consent.
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
                      {uploadProgress > 0 ? `Posting... ${uploadProgress}%` : 'Posting...'}
                    </span>
                  ) : (
                  'Post Job'
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

export default JobPost;

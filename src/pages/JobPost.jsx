import React, { useState } from 'react'
import { jobsAPI } from '../services/api'

const JobPost = () => {
  const [formData, setFormData] = useState({
    // Job Details (matching backend API field names)
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    category: 'Technology',
    customCategory: '',
    department: '',
    experience: 'Mid Level',

    // Contact Information
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',

    // Company Information
    companyWebsite: '',
    companySize: '',
    companyIndustry: '',
    companyDescription: '',

    // Work Location
    workLocationType: 'On-site',

    // Salary Information
    salaryMin: '',
    salaryMax: '',
    salaryType: 'Annual',
    currency: 'AED', // Default to AED as required

    // Job Content
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: '',

    // Application Details
    applicationDeadline: '',
    applicationMethod: 'Email',
    applicationEmail: '',
    applicationUrl: '',

    // Additional Info
    tags: '',
    featured: false,
    urgent: false,
    status: 'active', // Active by default
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Contract-to-hire', label: 'Contract-to-hire' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Temporary', label: 'Temporary' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ]

  const categoryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Education', label: 'Education' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Customer Service', label: 'Customer Service' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Other', label: 'Other' },
  ]

  const experienceOptions = [
    { value: 'Entry Level', label: 'Entry Level (0-2 years)' },
    { value: 'Junior Level', label: 'Junior Level (2-4 years)' },
    { value: 'Mid Level', label: 'Mid Level (4-6 years)' },
    { value: 'Senior Level', label: 'Senior Level (6-10 years)' },
    { value: 'Lead/Manager', label: 'Lead/Manager (10+ years)' },
    { value: 'Executive', label: 'Executive (15+ years)' },
  ]

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ]

  const workLocationOptions = [
    { value: 'On-site', label: 'On-site' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ]

  const salaryTypeOptions = [
    { value: 'Annual', label: 'Annual Salary' },
    { value: 'Hourly', label: 'Hourly Rate' },
    { value: 'Monthly', label: 'Monthly Salary' },
    { value: 'Project-based', label: 'Project-based' },
    { value: 'Commission', label: 'Commission-based' },
  ]

  const currencyOptions = [
    { value: 'AED', label: 'AED - UAE Dirham' }, // Default currency
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
  ]

  const applicationMethodOptions = [
    { value: 'Email', label: 'Email Application' },
    { value: 'Website', label: 'Company Website' },
    { value: 'Platform', label: 'Apply on Platform' },
    { value: 'Both', label: 'Email + Platform' },
  ]

  const validateForm = () => {
    const newErrors = {}

    // Required fields that actually exist in the form
    if (!formData.company?.trim()) {
      newErrors.company = 'Company name is required'
    }

    // Contact Information Validation
    if (
      !formData.contactName?.trim() ||
      formData.contactName.trim().length < 2
    ) {
      newErrors.contactName = 'Contact name is required (at least 2 characters)'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (
      !formData.contactEmail?.trim() ||
      !emailRegex.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (
      !formData.contactPhone?.trim() ||
      !phoneRegex.test(formData.contactPhone) ||
      formData.contactPhone.replace(/\D/g, '').length < 10
    ) {
      newErrors.contactPhone =
        'Please enter a valid phone number (at least 10 digits)'
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Job location is required'
    }

    if (!formData.title?.trim()) {
      newErrors.title = 'Job title is required'
    }

    // Custom Category Validation
    if (formData.category === 'Other' && !formData.customCategory?.trim()) {
      newErrors.customCategory =
        'Please specify category when Other is selected'
    }

    // Job Content Validation
    if (
      !formData.description?.trim() ||
      formData.description.trim().length < 50
    ) {
      newErrors.description =
        'Job description is required (at least 50 characters)'
    }

    if (
      !formData.requirements?.trim() ||
      formData.requirements.trim().length < 20
    ) {
      newErrors.requirements =
        'Job requirements are required (at least 20 characters)'
    }

    // Optional website validation (only if provided)
    if (formData.companyWebsite && !isValidUrl(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Please enter a valid website URL'
    }

    // Optional salary validation (only if both provided)
    if (
      formData.salaryMin &&
      formData.salaryMax &&
      parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)
    ) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary'
    }

    return newErrors
  }

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('JobPost form submission started')

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')
    setUploadProgress(0)

    try {
      // Prepare job data matching backend API expectations
      const jobData = {
        // Required fields
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        category:
          formData.category === 'Other'
            ? formData.customCategory
            : formData.category,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements,

        // Optional fields - flatten salary object
        salaryMin: formData.salaryMin
          ? parseFloat(formData.salaryMin)
          : undefined,
        salaryMax: formData.salaryMax
          ? parseFloat(formData.salaryMax)
          : undefined,
        currency: formData.currency,
        applicationDeadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline)
          : undefined,
        featured: formData.featured,
        active: true,
        postedDate: new Date(),
      }

      console.log('Submitting job data:', jobData)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Call the API
      console.log('Calling jobsAPI.createJob...')
      const response = await jobsAPI.createJob(jobData)
      console.log('API response:', response)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setSubmitMessage(
        '🎉 Thank you for posting your job! Your listing has been successfully submitted and will be reviewed shortly. Qualified candidates will be able to apply soon.'
      )

      // Emit custom event to refresh dashboard
      window.dispatchEvent(
        new CustomEvent('jobPosted', {
          detail: {
            success: true,
            job: response.data?.job || jobData,
          },
        })
      )

      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        category: 'Technology',
        customCategory: '',
        department: '',
        experience: 'Mid Level',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactTitle: '',
        companyWebsite: '',
        companySize: '',
        companyIndustry: '',
        companyDescription: '',
        workLocationType: 'On-site',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'Annual',
        currency: 'AED', // Reset to AED default
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        skills: '',
        applicationDeadline: '',
        applicationMethod: 'Email',
        applicationEmail: '',
        applicationUrl: '',
        tags: '',
        featured: false,
        urgent: false,
      })
      setErrors({})
      setUploadProgress(0)

      // Clear success message after 8 seconds
      setTimeout(() => {
        setSubmitMessage('')
      }, 8000)
    } catch (error) {
      console.error('Error posting job:', error)
      setSubmitMessage(
        error.response?.data?.message ||
          '❌ Sorry, there was an error posting your job. Please try again.'
      )
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="resume-upload" className="py-16 sm:py-20 bg-gray-50 pt-20">
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
              Create a job listing and find the perfect candidate for your
              organization. Fill in the details below to post your job
              opportunity.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            {submitMessage && (
              <div
                className={`mb-6 p-4 rounded-lg text-center ${
                  submitMessage.includes('Thank you')
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">
                  Contact Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.contactName
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.contactEmail
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.contactEmail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.contactPhone
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.contactPhone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contactPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
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
                        errors.location
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">
                  Job Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="jobTitle"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Developer"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.title ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
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
                        errors.company
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.company && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="jobType"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Job Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.type ? 'border-red-500' : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    >
                      {jobTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.category
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Custom Category Field - Show when Other is selected */}
                  {formData.category === 'Other' && (
                    <div>
                      <label
                        htmlFor="customCategory"
                        className="block text-sm font-medium text-text-dark mb-2"
                      >
                        Specify Category *
                      </label>
                      <input
                        type="text"
                        id="customCategory"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleInputChange}
                        placeholder="e.g., Hospitality, Retail, Construction"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                          errors.customCategory
                            ? 'border-red-500'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.customCategory && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.customCategory}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Engineering, Marketing, Sales"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.department
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-text-dark mb-2"
                    >
                      Experience Level *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                        errors.experience
                          ? 'border-red-500'
                          : 'border-border-color'
                      }`}
                      disabled={isSubmitting}
                    >
                      {experienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.experience && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="salaryMin"
                        className="block text-sm font-medium text-text-dark mb-2"
                      >
                        Minimum Salary (Optional)
                      </label>
                      <input
                        type="number"
                        id="salaryMin"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleInputChange}
                        placeholder="e.g., 80000"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                          errors.salaryMin
                            ? 'border-red-500'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.salaryMin && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.salaryMin}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="salaryMax"
                        className="block text-sm font-medium text-text-dark mb-2"
                      >
                        Maximum Salary (Optional)
                      </label>
                      <input
                        type="number"
                        id="salaryMax"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleInputChange}
                        placeholder="e.g., 120000"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                          errors.salaryMax
                            ? 'border-red-500'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.salaryMax && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.salaryMax}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="salaryType"
                        className="block text-sm font-medium text-text-dark mb-2"
                      >
                        Salary Type
                      </label>
                      <select
                        id="salaryType"
                        name="salaryType"
                        value={formData.salaryType}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                          errors.salaryType
                            ? 'border-red-500'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      >
                        {salaryTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.salaryType && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.salaryType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-text-dark mb-2"
                      >
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                          errors.currency
                            ? 'border-red-500'
                            : 'border-border-color'
                        }`}
                        disabled={isSubmitting}
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.currency && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.currency}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-text-dark mb-2"
                  >
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
                      errors.description
                        ? 'border-red-500'
                        : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="requirements"
                    className="block text-sm font-medium text-text-dark mb-2"
                  >
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
                      errors.requirements
                        ? 'border-red-500'
                        : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.requirements && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.requirements}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="applicationDeadline"
                    className="block text-sm font-medium text-text-dark mb-2"
                  >
                    Application Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-base ${
                      errors.applicationDeadline
                        ? 'border-red-500'
                        : 'border-border-color'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.applicationDeadline && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.applicationDeadline}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary border-b pb-2">
                  Additional Information
                </h4>

                <div>
                  <label
                    htmlFor="skills"
                    className="block text-sm font-medium text-text-dark mb-2"
                  >
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
                  <strong>Privacy Note:</strong> By posting this job, you
                  confirm that you have the authority to recruit for this
                  position. Maplorix will use this information to connect you
                  with qualified candidates and will not share your data with
                  third parties without your consent.
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
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {uploadProgress > 0
                        ? `Posting... ${uploadProgress}%`
                        : 'Posting...'}
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
  )
}

export default JobPost

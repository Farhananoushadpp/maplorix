// Post Job Page Component
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experience: 'Entry Level',
    description: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD',
    },
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const jobData = {
        ...formData,
        salary: {
          min: formData.salary.min ? Number(formData.salary.min) : undefined,
          max: formData.salary.max ? Number(formData.salary.max) : undefined,
          currency: formData.salary.currency,
        },
        postedBy: user?._id,
      }

      await jobsAPI.createJob(jobData)
      setSuccessMessage('Job posted successfully!')
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error posting job:', error)
      setErrors({ submit: 'Failed to post job. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Post a Job</h2>
          <p className="mt-2 text-gray-600">Fill in the details to post your job opening</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.company ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="e.g., Tech Solutions Inc."
            />
            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="e.g., New York, NY or Remote"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Level</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="Describe the job role, responsibilities, and requirements..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Salary</label>
              <input
                type="number"
                name="salary.min"
                value={formData.salary.min}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Salary</label>
              <input
                type="number"
                name="salary.max"
                value={formData.salary.max}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                name="salary.currency"
                value={formData.salary.currency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostJob

// Apply for Job Page Component
import React, { useState } from 'react'
import { applicationsAPI } from '../services/api'

const ApplyJob = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    job: '',
    jobRole: '',
    customJobRole: '',
    experience: 'Entry Level',
    skills: '',
    resume: null,
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const experienceLevels = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Executive',
  ]

  // 100+ Job Options with valid MongoDB ObjectIds
  const jobOptions = [
    // Software Development
    {
      id: '507f1f77bcf86cd799439011',
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
    },
    {
      id: '507f1f77bcf86cd799439012',
      title: 'Backend Developer',
      company: 'Digital Innovations',
    },
    {
      id: '507f1f77bcf86cd799439013',
      title: 'Full Stack Developer',
      company: 'WebCraft Studios',
    },
    {
      id: '507f1f77bcf86cd799439014',
      title: 'Mobile App Developer',
      company: 'AppMasters',
    },
    {
      id: '507f1f77bcf86cd799439015',
      title: 'React Developer',
      company: 'ReactPro Agency',
    },
    {
      id: '507f1f77bcf86cd799439016',
      title: 'Vue.js Developer',
      company: 'VueTech Solutions',
    },
    {
      id: '507f1f77bcf86cd799439017',
      title: 'Angular Developer',
      company: 'Angular Experts',
    },
    {
      id: '507f1f77bcf86cd799439018',
      title: 'Node.js Developer',
      company: 'NodeCraft',
    },
    {
      id: '507f1f77bcf86cd799439019',
      title: 'Python Developer',
      company: 'PythonWorks',
    },
    {
      id: '507f1f77bcf86cd799439020',
      title: 'Java Developer',
      company: 'JavaMasters',
    },
    {
      id: '507f1f77bcf86cd799439021',
      title: 'C# Developer',
      company: 'CSharp Solutions',
    },
    {
      id: '507f1f77bcf86cd799439022',
      title: 'PHP Developer',
      company: 'PHPExperts',
    },
    {
      id: '507f1f77bcf86cd799439023',
      title: 'Ruby Developer',
      company: 'RubyCraft',
    },
    {
      id: '507f1f77bcf86cd799439024',
      title: 'Go Developer',
      company: 'GoTech',
    },
    {
      id: '507f1f77bcf86cd799439025',
      title: 'Rust Developer',
      company: 'RustInnovations',
    },

    // Data & Analytics
    {
      id: '507f1f77bcf86cd799439026',
      title: 'Data Scientist',
      company: 'DataDrive Analytics',
    },
    {
      id: '507f1f77bcf86cd799439027',
      title: 'Data Analyst',
      company: 'Analytics Pro',
    },
    {
      id: '507f1f77bcf86cd799439028',
      title: 'Machine Learning Engineer',
      company: 'ML Innovations',
    },
    {
      id: '507f1f77bcf86cd799439029',
      title: 'AI Engineer',
      company: 'AI Tech Solutions',
    },
    {
      id: '507f1f77bcf86cd799439030',
      title: 'Business Intelligence Analyst',
      company: 'BI Insights',
    },
    {
      id: '507f1f77bcf86cd799439031',
      title: 'Data Engineer',
      company: 'DataFlow Systems',
    },
    {
      id: '507f1f77bcf86cd799439032',
      title: 'Research Scientist',
      company: 'Research Labs',
    },
    {
      id: '507f1f77bcf86cd799439033',
      title: 'Quantitative Analyst',
      company: 'QuantPro Analytics',
    },

    // DevOps & Infrastructure
    {
      id: '507f1f77bcf86cd799439034',
      title: 'DevOps Engineer',
      company: 'DevOps Masters',
    },
    {
      id: '507f1f77bcf86cd799439035',
      title: 'Cloud Engineer',
      company: 'CloudTech Solutions',
    },
    {
      id: '507f1f77bcf86cd799439036',
      title: 'AWS Engineer',
      company: 'AWS Experts',
    },
    {
      id: '507f1f77bcf86cd799439037',
      title: 'Azure Engineer',
      company: 'AzurePro',
    },
    {
      id: '507f1f77bcf86cd799439038',
      title: 'Google Cloud Engineer',
      company: 'GCP Solutions',
    },
    {
      id: '507f1f77bcf86cd799439039',
      title: 'Kubernetes Engineer',
      company: 'KubeTech',
    },
    {
      id: '507f1f77bcf86cd799439040',
      title: 'Docker Engineer',
      company: 'ContainerPro',
    },
    {
      id: '507f1f77bcf86cd799439041',
      title: 'Site Reliability Engineer',
      company: 'SRE Masters',
    },
    {
      id: '507f1f77bcf86cd799439042',
      title: 'Infrastructure Engineer',
      company: 'InfraTech',
    },

    // Cybersecurity
    {
      id: '507f1f77bcf86cd799439043',
      title: 'Cybersecurity Analyst',
      company: 'SecureNet',
    },
    {
      id: '507f1f77bcf86cd799439044',
      title: 'Security Engineer',
      company: 'SecurityPro',
    },
    {
      id: '507f1f77bcf86cd799439045',
      title: 'Penetration Tester',
      company: 'Pentest Experts',
    },
    {
      id: '507f1f77bcf86cd799439046',
      title: 'Security Consultant',
      company: 'SecurityConsult',
    },
    {
      id: '507f1f77bcf86cd799439047',
      title: 'Information Security Officer',
      company: 'InfoSec Pro',
    },

    // UI/UX Design
    {
      id: '507f1f77bcf86cd799439048',
      title: 'UI Designer',
      company: 'DesignCraft',
    },
    {
      id: '507f1f77bcf86cd799439049',
      title: 'UX Designer',
      company: 'UX Masters',
    },
    {
      id: '507f1f77bcf86cd799439050',
      title: 'Product Designer',
      company: 'ProductDesign Pro',
    },
    {
      id: '507f1f77bcf86cd799439051',
      title: 'Graphic Designer',
      company: 'GraphicWorks',
    },
    {
      id: '507f1f77bcf86cd799439052',
      title: 'Web Designer',
      company: 'WebDesign Studio',
    },
    {
      id: '507f1f77bcf86cd799439053',
      title: 'Mobile Designer',
      company: 'MobileDesign Pro',
    },
    {
      id: '507f1f77bcf86cd799439054',
      title: 'Design System Engineer',
      company: 'DesignSystem Tech',
    },

    // Product Management
    {
      id: '507f1f77bcf86cd799439055',
      title: 'Product Manager',
      company: 'ProductMasters',
    },
    {
      id: '507f1f77bcf86cd799439056',
      title: 'Technical Product Manager',
      company: 'TechProduct Pro',
    },
    {
      id: '507f1f77bcf86cd799439057',
      title: 'Product Owner',
      company: 'ProductOwner Experts',
    },
    {
      id: '507f1f77bcf86cd799439058',
      title: 'Program Manager',
      company: 'ProgramMasters',
    },
    {
      id: '507f1f77bcf86cd799439059',
      title: 'Project Manager',
      company: 'ProjectPro',
    },
    {
      id: '507f1f77bcf86cd799439060',
      title: 'Scrum Master',
      company: 'AgileMasters',
    },

    // Marketing & Sales
    {
      id: '507f1f77bcf86cd799439061',
      title: 'Marketing Manager',
      company: 'MarketingPro',
    },
    {
      id: '507f1f77bcf86cd799439062',
      title: 'Digital Marketing Manager',
      company: 'DigitalMarketing Tech',
    },
    {
      id: '507f1f77bcf86cd799439063',
      title: 'Content Marketing Manager',
      company: 'ContentMasters',
    },
    {
      id: '507f1f77bcf86cd799439064',
      title: 'SEO Specialist',
      company: 'SEO Experts',
    },
    {
      id: '507f1f77bcf86cd799439065',
      title: 'Social Media Manager',
      company: 'SocialMedia Pro',
    },
    {
      id: '507f1f77bcf86cd799439066',
      title: 'Sales Manager',
      company: 'SalesMasters',
    },
    {
      id: '507f1f77bcf86cd799439067',
      title: 'Business Development Manager',
      company: 'BizDev Pro',
    },
    {
      id: '507f1f77bcf86cd799439068',
      title: 'Account Manager',
      company: 'AccountMasters',
    },
    {
      id: '507f1f77bcf86cd799439069',
      title: 'Sales Representative',
      company: 'SalesPro',
    },

    // HR & Recruitment
    {
      id: '507f1f77bcf86cd799439070',
      title: 'HR Manager',
      company: 'HR Solutions',
    },
    {
      id: '507f1f77bcf86cd799439071',
      title: 'Recruitment Manager',
      company: 'RecruitPro',
    },
    {
      id: '507f1f77bcf86cd799439072',
      title: 'Talent Acquisition Specialist',
      company: 'TalentAcq Pro',
    },
    {
      id: '507f1f77bcf86cd799439073',
      title: 'HR Business Partner',
      company: 'HRBP Solutions',
    },
    {
      id: '507f1f77bcf86cd799439074',
      title: 'Training and Development Manager',
      company: 'TrainingPro',
    },
    {
      id: '507f1f77bcf86cd799439075',
      title: 'Compensation Analyst',
      company: 'Compensation Experts',
    },

    // Finance & Accounting
    {
      id: '507f1f77bcf86cd799439076',
      title: 'Financial Analyst',
      company: 'FinancePro',
    },
    {
      id: '507f1f77bcf86cd799439077',
      title: 'Accountant',
      company: 'AccountingMasters',
    },
    {
      id: '507f1f77bcf86cd799439078',
      title: 'Senior Accountant',
      company: 'SeniorAccounting Pro',
    },
    {
      id: '507f1f77bcf86cd799439079',
      title: 'Finance Manager',
      company: 'FinanceMasters',
    },
    {
      id: '507f1f77bcf86cd799439080',
      title: 'Controller',
      company: 'ControllerPro',
    },
    { id: '507f1f77bcf86cd799439081', title: 'CFO', company: 'CFO Solutions' },
    {
      id: '507f1f77bcf86cd799439082',
      title: 'Bookkeeper',
      company: 'BookkeepingPro',
    },
    {
      id: '507f1f77bcf86cd799439083',
      title: 'Tax Specialist',
      company: 'TaxExperts',
    },

    // Operations & Supply Chain
    {
      id: '507f1f77bcf86cd799439084',
      title: 'Operations Manager',
      company: 'OperationsPro',
    },
    {
      id: '507f1f77bcf86cd799439085',
      title: 'Supply Chain Manager',
      company: 'SupplyChain Masters',
    },
    {
      id: '507f1f77bcf86cd799439086',
      title: 'Logistics Coordinator',
      company: 'LogisticsPro',
    },
    {
      id: '507f1f77bcf86cd799439087',
      title: 'Procurement Manager',
      company: 'Procurement Experts',
    },
    {
      id: '507f1f77bcf86cd799439088',
      title: 'Quality Assurance Manager',
      company: 'QualityPro',
    },
    {
      id: '507f1f77bcf86cd799439089',
      title: 'Process Engineer',
      company: 'ProcessTech',
    },

    // Customer Support
    {
      id: '507f1f77bcf86cd799439090',
      title: 'Customer Support Manager',
      company: 'SupportPro',
    },
    {
      id: '507f1f77bcf86cd799439091',
      title: 'Customer Service Representative',
      company: 'CustomerService Pro',
    },
    {
      id: '507f1f77bcf86cd799439092',
      title: 'Technical Support Engineer',
      company: 'TechSupport Masters',
    },
    {
      id: '507f1f77bcf86cd799439093',
      title: 'Customer Success Manager',
      company: 'CustomerSuccess Pro',
    },
    {
      id: '507f1f77bcf86cd799439094',
      title: 'Help Desk Specialist',
      company: 'HelpDesk Experts',
    },

    // Healthcare
    {
      id: '507f1f77bcf86cd799439095',
      title: 'Registered Nurse',
      company: 'HealthCare Plus',
    },
    {
      id: '507f1f77bcf86cd799439096',
      title: 'Medical Assistant',
      company: 'MedicalPro',
    },
    {
      id: '507f1f77bcf86cd799439097',
      title: 'Healthcare Administrator',
      company: 'HealthAdmin Solutions',
    },
    {
      id: '507f1f77bcf86cd799439098',
      title: 'Medical Coder',
      company: 'MedicalCoding Pro',
    },
    {
      id: '507f1f77bcf86cd799439099',
      title: 'Healthcare Consultant',
      company: 'HealthConsult Experts',
    },

    // Education
    {
      id: '507f1f77bcf86cd799439100',
      title: 'Teacher',
      company: 'EducationPro',
    },
    {
      id: '507f1f77bcf86cd799439101',
      title: 'Professor',
      company: 'University Masters',
    },
    {
      id: '507f1f77bcf86cd799439102',
      title: 'Education Consultant',
      company: 'EducationConsult',
    },
    {
      id: '507f1f77bcf86cd799439103',
      title: 'Curriculum Developer',
      company: 'CurriculumPro',
    },
    {
      id: '507f1f77bcf86cd799439104',
      title: 'Training Specialist',
      company: 'TrainingExperts',
    },

    // Legal
    { id: '507f1f77bcf86cd799439105', title: 'Lawyer', company: 'LegalPro' },
    {
      id: '507f1f77bcf86cd799439106',
      title: 'Paralegal',
      company: 'ParalegalMasters',
    },
    {
      id: '507f1f77bcf86cd799439107',
      title: 'Legal Assistant',
      company: 'LegalAssist Pro',
    },
    {
      id: '507f1f77bcf86cd799439108',
      title: 'Compliance Officer',
      company: 'ComplianceExperts',
    },
    {
      id: '507f1f77bcf86cd799439109',
      title: 'Corporate Counsel',
      company: 'CorporateLegal Pro',
    },

    // Additional Roles
    {
      id: '507f1f77bcf86cd799439110',
      title: 'Consultant',
      company: 'ConsultingPro',
    },
    {
      id: '507f1f77bcf86cd799439111',
      title: 'Business Analyst',
      company: 'BusinessAnalysis Masters',
    },
    {
      id: '507f1f77bcf86cd799439112',
      title: 'Systems Analyst',
      company: 'SystemsAnalysis Pro',
    },
    {
      id: '507f1f77bcf86cd799439113',
      title: 'Database Administrator',
      company: 'DatabasePro',
    },
    {
      id: '507f1f77bcf86cd799439114',
      title: 'Network Administrator',
      company: 'NetworkMasters',
    },
    {
      id: '507f1f77bcf86cd799439115',
      title: 'IT Support Specialist',
      company: 'ITSupport Pro',
    },
    {
      id: '507f1f77bcf86cd799439116',
      title: 'Technical Writer',
      company: 'TechWriting Experts',
    },
    {
      id: '507f1f77bcf86cd799439117',
      title: 'Content Writer',
      company: 'ContentMasters',
    },
    {
      id: '507f1f77bcf86cd799439118',
      title: 'Copywriter',
      company: 'CopyWriting Pro',
    },
    {
      id: '507f1f77bcf86cd799439119',
      title: 'Email Marketing Specialist',
      company: 'EmailMarketing Experts',
    },
    {
      id: '507f1f77bcf86cd799439120',
      title: 'E-commerce Manager',
      company: 'EcommercePro',
    },
    {
      id: '507f1f77bcf86cd799439121',
      title: 'Other',
      company: 'Custom Position',
    },
  ]

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    } else if (formData.location.length < 2 || formData.location.length > 100) {
      newErrors.location = 'Location must be between 2 and 100 characters'
    }

    if (!formData.job) {
      newErrors.job = 'Please select a job'
    }

    // Validate custom job role if "Other" is selected
    if (
      formData.job === '507f1f77bcf86cd799439121' &&
      !formData.customJobRole.trim()
    ) {
      newErrors.customJobRole = 'Please specify your desired job role'
    }

    if (!formData.skills.trim()) {
      newErrors.skills = 'Skills are required'
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
      const selectedJob = jobOptions.find((j) => j.id === formData.job)

      // Use custom job role if "Other" is selected, otherwise use selected job title
      const jobRole =
        formData.job === '507f1f77bcf86cd799439121'
          ? formData.customJobRole
          : selectedJob?.title || formData.jobRole

      console.log('=== APPLICATION SUBMISSION DEBUG ===')
      console.log('Form data:', formData)
      console.log('Selected job:', selectedJob)
      console.log('Job role to send:', jobRole)
      console.log(
        'Is Other selected:',
        formData.job === '507f1f77bcf86cd799439121'
      )

      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('location', formData.location)

      // Don't send job ID for our static jobs since they don't exist in database
      // Only send job ID if it's a real database job (not our static list)
      // For now, we'll skip sending job ID entirely

      formDataToSend.append('jobRole', jobRole)
      formDataToSend.append('experience', formData.experience)
      formDataToSend.append('skills', formData.skills)

      if (formData.resume) {
        formDataToSend.append('resume', formData.resume)
        console.log('Resume file:', formData.resume.name)
      }

      console.log('FormData contents:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value)
      }

      // Check if we have a token for authentication
      const token = localStorage.getItem('authToken')
      console.log('Auth token exists:', !!token)

      if (!token) {
        console.log('No auth token found, using public submission...')
      }

      // Try public submission first, fall back to authenticated if needed
      let response
      try {
        if (!token) {
          response =
            await applicationsAPI.submitPublicApplication(formDataToSend)
        } else {
          response = await applicationsAPI.createApplication(formDataToSend)
        }
      } catch (publicError) {
        console.log('Public submission failed, trying authenticated...')
        if (!token && publicError.response?.status === 404) {
          // If public endpoint doesn't exist, try the regular one
          response = await applicationsAPI.createApplication(formDataToSend)
        } else {
          throw publicError
        }
      }

      console.log('Application submission response:', response)

      setSuccessMessage('Application submitted successfully!')

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        job: '',
        jobRole: '',
        customJobRole: '',
        experience: 'Entry Level',
        skills: '',
        resume: null,
      })
    } catch (error) {
      console.error('Error submitting application:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)

      let errorMessage = 'Failed to submit application. Please try again.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Apply for a Job</h2>
          <p className="mt-2 text-gray-600">
            Submit your application for your desired position
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Job
            </label>
            <select
              name="job"
              value={formData.job}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.job ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
            >
              <option value="">Select a job...</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
            {errors.job && (
              <p className="mt-1 text-sm text-red-600">{errors.job}</p>
            )}
          </div>

          {/* Show custom job role field when "Other" is selected */}
          {formData.job === '507f1f77bcf86cd799439121' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specify Job Role *
              </label>
              <input
                type="text"
                name="customJobRole"
                value={formData.customJobRole || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.customJobRole ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                placeholder="Enter your desired job role"
              />
              {errors.customJobRole && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customJobRole}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Please specify the job role you're interested in
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="City, State/Country"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Experience Level
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            >
              {experienceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Skills
            </label>
            <textarea
              name="skills"
              rows="3"
              value={formData.skills}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.skills ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
              placeholder="List your relevant skills (e.g., JavaScript, React, Node.js)"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resume (Optional)
            </label>
            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, DOC, DOCX
            </p>
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
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyJob

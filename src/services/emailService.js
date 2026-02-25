// Email Service for Maplorix Contact Form
import emailjs from '@emailjs/browser'

// EmailJS configuration (you'll need to set up an EmailJS account)
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your actual public key
  SERVICE_ID: 'service_maplorix', // Replace with your service ID
  TEMPLATE_ID: 'template_contact_form', // Replace with your template ID
}

// Email configuration
const EMAIL_CONFIG = {
  recipient: 'maplorixae@gmail.com',
  subject: 'New Contact Form Message from Maplorix Website',
}

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)

// Send email using EmailJS
export const sendContactEmail = async (formData) => {
  try {
    console.log('📧 Sending email to maplorixae@gmail.com...')

    // Prepare email template parameters
    const templateParams = {
      to_email: EMAIL_CONFIG.recipient,
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      reply_to: formData.email,
      sent_date: new Date().toLocaleString(),
    }

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    )

    console.log('✅ Email sent successfully:', response)
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('❌ Error sending email via EmailJS:', error)

    // Fallback 1: Try to send via mailto link
    try {
      const mailtoLink = `mailto:${EMAIL_CONFIG.recipient}?subject=${encodeURIComponent(`Contact Form: ${formData.subject}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}\n\n---\nSent from Maplorix Website\nDate: ${new Date().toLocaleString()}`)}`

      // Open email client
      window.location.href = mailtoLink

      return {
        success: true,
        message:
          'Email client opened as fallback. Please send the email manually.',
        fallback: true,
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)

      // Fallback 2: Show user the email address and instructions
      throw new Error(
        `Unable to send email automatically. Please email us directly at ${EMAIL_CONFIG.recipient} with your message.`
      )
    }
  }
}

// Alternative: Direct mailto approach (simpler, no setup required)
export const sendEmailViaMailto = (formData) => {
  const subject = encodeURIComponent(`Contact Form: ${formData.subject}`)
  const body = encodeURIComponent(
    `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Subject: ${formData.subject}\n\n` +
      `Message:\n${formData.message}\n\n` +
      `---\n` +
      `Sent from Maplorix Website\n` +
      `Date: ${new Date().toLocaleString()}`
  )

  const mailtoLink = `mailto:${EMAIL_CONFIG.recipient}?subject=${subject}&body=${body}`
  window.open(mailtoLink, '_blank')

  return {
    success: true,
    message:
      'Email client opened. Please send the email to complete your submission.',
  }
}

// For development/testing - log the email data
export const logEmailData = (formData) => {
  console.log('📧 Email data that would be sent:', {
    to: EMAIL_CONFIG.recipient,
    from: `${formData.name} <${formData.email}>`,
    subject: formData.subject,
    message: formData.message,
    timestamp: new Date().toISOString(),
  })
}

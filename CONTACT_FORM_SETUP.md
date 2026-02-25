# Contact Form Setup Guide

## Overview
The Maplorix contact form is configured to send messages to **maplorixae@gmail.com**. The current implementation uses a mailto link approach that works immediately without requiring backend setup.

## How It Works

### Current Implementation (mailto approach)
1. User fills out the contact form
2. Clicks "Send Message" button
3. Their default email client opens with the message pre-filled
4. User clicks "Send" in their email client to complete the submission
5. Email is sent directly to **maplorixae@gmail.com**

### Email Content
The email includes:
- Sender's name and email
- Subject line
- Message content
- Timestamp
- "Sent from Maplorix Website" identifier

## Future Enhancements

### Option 1: EmailJS Integration
To enable automatic email sending without user interaction:

1. **Sign up for EmailJS** (https://www.emailjs.com/)
2. **Create an email service**:
   - Connect your email provider (Gmail, Outlook, etc.)
   - Get your Service ID

3. **Create an email template**:
   - Template variables: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`
   - Recipient: `maplorixae@gmail.com`
   - Get your Template ID

4. **Update configuration** in `src/services/emailService.js`:
   ```javascript
   const EMAILJS_CONFIG = {
     PUBLIC_KEY: 'YOUR_ACTUAL_PUBLIC_KEY',
     SERVICE_ID: 'YOUR_SERVICE_ID',
     TEMPLATE_ID: 'YOUR_TEMPLATE_ID'
   }
   ```

5. **Update ContactPage.jsx** to use `sendContactEmail` instead of `sendEmailViaMailto`

### Option 2: Backend API
For production environments, consider implementing a backend API endpoint:

1. Create `/api/send-email` endpoint
2. Use services like:
   - SendGrid
   - Mailgun
   - AWS SES
   - Nodemailer with SMTP

### Option 3: Firebase Functions
Use Firebase Cloud Functions to handle email sending without a traditional backend.

## Current Configuration

### Email Recipient
- **Primary**: `maplorixae@gmail.com`
- **Reply-to**: User's email address

### Contact Information Displayed
- Email: `maplorixae@gmail.com`
- Phone: `044538999, +971581929900`
- Address: `A5 Block, Office No:45, Xavier Business Center, Burj Nahar Mall, Al Muteena, Dubai`

## Testing the Contact Form

1. Navigate to `/contact` on the website
2. Fill in all required fields:
   - Name (minimum 2 characters)
   - Email (valid email format)
   - Subject (minimum 3 characters)
   - Message (minimum 10 characters)
3. Click "Send Message"
4. Your email client should open with the pre-filled message
5. Send the email to complete the submission

## Troubleshooting

### Email Client Doesn't Open
- Check if you have a default email client configured
- Try copying the email address and sending manually
- Ensure pop-up blockers are not blocking the mailto link

### Form Validation Errors
- All fields are required
- Minimum character limits apply
- Email must be in valid format

### No Response Received
- Check spam/junk folders
- Verify the email was sent to `maplorixae@gmail.com`
- Allow 24 hours for response as mentioned on the contact page

## Security Considerations

- Current implementation is client-side only
- No sensitive data is stored on the server
- Email is sent directly through user's email client
- Consider CSRF protection for backend implementations
- Implement rate limiting for API endpoints

## Files Modified

- `src/services/emailService.js` - Email sending functionality
- `src/pages/ContactPage.jsx` - Contact form component
- Updated contact email to `maplorixae@gmail.com`

## Dependencies Added

- `@emailjs/browser` - For future EmailJS integration (currently not required)

## Support

For questions about the contact form setup or to report issues, please contact the development team or email directly at `maplorixae@gmail.com`.

# reCAPTCHA Integration Guide for Maplorix

This document explains the reCAPTCHA integration implemented in the Maplorix frontend application.

## Overview

The Maplorix frontend now includes Google reCAPTCHA v2 (checkbox) integration to protect forms from automated spam and abuse. The integration is implemented across all major forms:

- **Contact Form** (`/contact`)
- **Job Application Form** (`/apply`)
- **Job Posting Form** (`/post-job`)
## Implementation Details

### 1. Script Loading

The reCAPTCHA script is loaded in `index.html`:

```html
<!-- Google reCAPTCHA v2 -->
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
```

### 2. Environment Configuration

Add your reCAPTCHA site key to your environment:

```bash
# .env file
VITE_RECAPTCHA_SITE_KEY=your_actual_site_key_here
```

For development, the test key `6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y` is used automatically.

### 3. Component Integration

Each form includes:

- **reCAPTCHA widget**: Checkbox verification before submission
- **Token validation**: Ensures reCAPTCHA is completed before form submission
- **Error handling**: User-friendly error messages
- **Automatic reset**: Resets after successful submission or errors

### 4. API Integration

All form submissions include the reCAPTCHA token:

```javascript
const submissionData = {
  ...formData,
  recaptchaToken: token // Added to all submissions
}
```

## Forms Protected

### Contact Form (`/src/pages/ContactPage.jsx`)

- **Location**: Before the submit button
- **Validation**: Required before email client opens
- **Reset**: After successful email client opening

### Job Application Form (`/src/pages/ApplyJob.jsx`)

- **Location**: Before the submit button
- **Validation**: Required before file upload
- **Library**: Uses `react-google-recaptcha` component
- **Reset**: After successful submission or errors

### Job Posting Form (`/src/pages/JobPost.jsx`)

- **Location**: Before the submit button
- **Validation**: Required before job posting
- **Reset**: After successful job posting

## Styling

### Custom CSS (`/src/styles/recaptcha.css`)

Responsive styling with:
- Mobile scaling (0.9x on <480px, 0.85x on <380px)
- Hover effects and transitions
- Error state styling
- Accessibility focus states

### Utility Classes

```css
.g-recaptcha              /* Main widget styling */
.recaptcha-container      /* Centered container */
.recaptcha-error-message  /* Error message styling */
```

## Error Handling

### Common Error Messages

- `"Please complete the reCAPTCHA challenge"` - User hasn't completed verification
- `"reCAPTCHA verification failed. Please try again."` - Backend rejected token
- `"reCAPTCHA verification timed out. Please try again."` - Network timeout
- `"Network error during reCAPTCHA verification"` - Connection issues

### Error Handling Flow

1. **Frontend validation**: Checks if reCAPTCHA is completed
2. **Backend validation**: Verifies token with Google
3. **Error display**: Shows user-friendly message
4. **Widget reset**: Allows user to try again

## Development Testing

### Test Mode

In development mode, the Google test key is used automatically:
- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjQ5y3FkT_y`
- **Behavior**: Always passes verification
- **Purpose**: Testing without affecting production metrics

### Manual Testing

1. **Normal Flow**:
   - Fill form fields
   - Complete reCAPTCHA checkbox
   - Submit form successfully

2. **Error Testing**:
   - Try submitting without completing reCAPTCHA
   - Verify error message appears
   - Complete reCAPTCHA and retry

3. **Reset Testing**:
   - Submit successfully
   - Verify widget resets for next submission

## Utility Functions

### `/src/utils/recaptchaUtils.js`

Common reCAPTCHA utilities:

```javascript
import { 
  getRecaptchaToken, 
  validateRecaptcha, 
  handleRecaptchaError,
  resetRecaptcha 
} from '../utils/recaptchaUtils';
```

Key functions:
- `getRecaptchaToken(ref)` - Get token from widget
- `validateRecaptcha(ref)` - Validate completion
- `handleRecaptchaError(error)` - Convert errors to user messages
- `resetRecaptcha(ref)` - Reset widget

## Backend Integration

The backend should:

1. **Verify tokens** with Google reCAPTCHA API
2. **Check score** (for v3) or completion (for v2)
3. **Return appropriate errors** for invalid tokens
4. **Log verification attempts** for monitoring

### Expected Token Format

```javascript
{
  recaptchaToken: "string_from_google_recaptcha"
}
```

## Production Deployment

### Steps

1. **Get Production Keys**:
   - Visit [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin/create)
   - Register your production domain
   - Get production site key

2. **Update Environment**:
   ```bash
   VITE_RECAPTCHA_SITE_KEY=your_production_site_key
   ```

3. **Test Production**:
   - Verify widget loads with production key
   - Test form submissions
   - Monitor backend verification logs

### Domain Registration

Register these domains in Google reCAPTCHA console:
- `maplorix.com` (production)
- `localhost` (development)
- `www.maplorix.com` (www subdomain)

## Troubleshooting

### Common Issues

1. **"reCAPTCHA couldn't find user-provided function"**
   - Ensure script loads before components mount
   - Check script order in `index.html`

2. **"Invalid domain for site key"**
   - Add domain to reCAPTCHA admin console
   - Include localhost for development

3. **"reCAPTCHA token is missing"**
   - Verify widget is rendered
   - Check token extraction logic

4. **Widget not loading**
   - Check network connectivity
   - Verify script URL accessibility
   - Check browser console for errors

### Debug Mode

Enable debug mode in `index.html`:

```html
<script src="https://www.google.com/recaptcha/api.js?debug=true" async defer></script>
```

This shows detailed reCAPTCHA information in browser console.

## Security Considerations

### Token Validation

- **Always verify tokens on backend**
- **Check token expiration** (tokens expire in 2 minutes)
- **Verify request origin** matches expected domain
- **Rate limit verification attempts**

### Best Practices

- **Never trust frontend-only validation**
- **Log verification failures** for monitoring
- **Implement retry logic** for network issues
- **Use HTTPS in production** (required by reCAPTCHA)

## Monitoring

### Metrics to Track

- **Verification success rate**
- **Common error types**
- **Geographic distribution**
- **Time-based patterns**

### Alerts

Set up alerts for:
- **Sudden drop in success rate**
- **Increase in verification failures**
- **Backend API errors**
- **Unusual traffic patterns`

## Future Enhancements

### Potential Improvements

1. **reCAPTCHA v3**: Invisible verification for better UX
2. **Adaptive protection**: Dynamic difficulty based on risk
3. **Analytics dashboard**: Built-in verification metrics
4. **A/B testing**: Compare different verification methods

### Implementation Notes

- Current implementation uses reCAPTCHA v2 (checkbox)
- Easy to upgrade to v3 with minimal changes
- Utility functions support both versions
- Styling is responsive and accessible

## Support

For issues with reCAPTCHA integration:

1. Check [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
2. Review browser console for errors
3. Verify environment configuration
4. Test with different browsers and devices
5. Monitor backend verification logs

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Compatible**: React 19, Vite 6.2, Tailwind CSS 3.4





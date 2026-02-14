# Application 400 Error - DEBUG STEPS

## 🚨 Current Issue

**400 Bad Request error still occurring despite adding fullName field.**

## 🔍 Debug Steps

### **Step 1: Enhanced Error Logging**
✅ **Already Applied:**
```javascript
console.error('Full error object:', JSON.stringify(error.response?.data, null, 2))
```

### **Step 2: Updated Experience Levels**
✅ **Already Applied:**
```javascript
const experienceLevels = [
  'fresher', '1-3', '3-5', '5+', '10+',
  'Entry Level', 'Mid Level', 'Senior Level', 'Executive'
]
```

### **Step 3: Test Application Data**
📋 **Use this test data to debug:**
```javascript
{
  firstName: 'John',
  lastName: 'Doe', 
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  jobRole: 'Senior Frontend Developer',
  experience: '5+',
  expectedSalary: '$80,000 - $100,000',
  source: 'Website'
}
```

## 🧪 Debug Instructions

### **1. Navigate to Application Form**
```
http://localhost:5173/apply
```

### **2. Open Browser Console**
- Press F12 or right-click → Inspect
- Go to Console tab

### **3. Fill Form with Test Data**
- First Name: John
- Last Name: Doe
- Email: john.doe@example.com
- Phone: +1 (555) 123-4567
- Location: New York, NY
- Job Role: Senior Frontend Developer
- Experience: 5+
- Expected Salary: $80,000 - $100,000

### **4. Submit and Check Console**
Look for these console logs:
```
Application submitted successfully: [response]
Error response: [error object]
Error status: 400
Error details: Validation Error
Error message: [specific error message]
Full error object: [complete error details]
```

## 🔧 Common Validation Issues

### **Backend Validation Rules:**
```javascript
fullName: {
  required: true,
  minLength: 2,
  maxLength: 100
}

email: {
  required: true,
  format: email
}

phone: {
  required: true,
  minLength: 10,
  maxLength: 20
}

location: {
  required: true,
  minLength: 2,
  maxLength: 100
}

jobRole: {
  required: true,
  minLength: 2,
  maxLength: 100
}

experience: {
  required: true,
  enum: ['fresher', '1-3', '3-5', '5+', '10+', 'Entry Level', 'Mid Level', 'Senior Level', 'Executive']
}
```

## 🚨 Possible Issues to Check

### **1. Field Names Mismatch**
- ✅ **fullName** - Added
- ❓ **Other fields** - Check exact names

### **2. Field Values**
- ❓ **Empty fields** - Check all required fields are filled
- ❓ **Invalid formats** - Check email, phone formats
- ❓ **Length validation** - Check field lengths

### **3. Backend Validation**
- ❓ **Missing fields** - Check if backend expects additional fields
- ❓ **Field types** - Check if backend expects different data types

### **4. FormData Issues**
- ❓ **File upload** - Check if resume upload is causing issues
- ❓ **Content-Type** - Check if FormData is properly formatted

## 📋 Debug Checklist

### **Before Submitting:**
- [ ] All required fields are filled
- [ ] Email format is valid
- [ ] Phone length is 10-20 characters
- [ ] Location length is 2-100 characters
- [ ] Job role length is 2-100 characters
- [ ] Full name length is 2-100 characters
- [ ] Experience level is one of the valid options

### **After Submitting:**
- [ ] Check console for error messages
- [ ] Look at "Full error object" in console
- [ ] Identify specific validation error
- [ ] Fix the identified issue

## 🎯 Next Steps

### **If Error Persists:**
1. **Check console** for "Full error object" message
2. **Identify** the specific validation error
3. **Fix** the identified field or validation issue
4. **Test again** with corrected data

### **Common Solutions:**
- **Add missing fields** that backend expects
- **Fix field formats** (email, phone, etc.)
- **Adjust field lengths** to meet validation requirements
- **Update field names** to match backend expectations

## 📞 Support Information

### **Error Messages to Look For:**
- "Full name is required" → Check fullName field
- "Email is invalid" → Check email format
- "Phone number must be between 10 and 20 characters" → Check phone length
- "Location must be between 2 and 100 characters" → Check location length
- "Job role must be between 2 and 100 characters" → Check job role length
- "Invalid experience level" → Check experience option

### **Debug Tools:**
- **Browser Console** - For client-side errors
- **Network Tab** - For request/response details
- **Backend Logs** - For server-side validation errors

**Follow these steps to identify and fix the specific validation error causing the 400 Bad Request.**

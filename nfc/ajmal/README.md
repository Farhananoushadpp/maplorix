# Maplorix Card

A modern, interactive digital business card built with HTML, CSS, and JavaScript. Features a beautiful gradient design, smooth animations, dark mode support, and full customization capabilities.

## ✨ Features

### 🎨 **Modern Design**
- Beautiful gradient header with animated background effects
- Smooth hover animations and micro-interactions
- Responsive layout that works on all devices
- Dark/light theme toggle with system preference detection
- Professional typography using Inter font

### 🔧 **Interactive Features**
- **Connect/Disconnect** functionality with persistent state
- **Share modal** with multiple sharing options (copy link, email, vCard download)
- **Edit mode** for real-time card customization
- **Profile image** upload and management
- **QR code** placeholder for future implementation
- **Keyboard shortcuts** for power users

### 📱 **Contact & Social Integration**
- Click-to-call and click-to-email functionality
- Social media links with platform-specific styling
- Skill tags with hover effects
- Location display with map integration potential

### 💾 **Data Persistence**
- LocalStorage integration for saving user preferences
- Custom profile data persistence
- Theme preference memory
- Connection state saving

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + S` - Save edits (when in edit mode)
- `Ctrl/Cmd + D` - Toggle dark/light theme
- `Ctrl/Cmd + E` - Toggle edit mode
- `Ctrl/Cmd + P` - Print card
- `Escape` - Close modal or exit edit mode

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Open `index.html`** in your web browser
3. **Start using** your digital card immediately!

No build process or dependencies required - it's pure HTML/CSS/JavaScript!

## 📁 Project Structure

```
maplorixcard/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with animations
├── script.js           # Interactive JavaScript functionality
└── README.md           # This documentation
```

## 🎯 Usage Guide

### Basic Navigation
- **Connect Button**: Click to connect/disconnect with the card owner
- **Share Button**: Opens sharing modal with multiple options
- **Theme Toggle**: Switch between dark and light modes
- **Edit Button**: Enable edit mode to customize card content

### Customization
1. Click the **Edit button** (pencil icon) to enter edit mode
2. Click on any text element to edit it directly
3. Click **Save button** (checkmark) to save changes
4. All changes are automatically saved to browser storage

### Profile Image
- Click on the profile image to upload a new one
- Images are saved locally and persist between sessions

### Sharing Options
- **Copy Link**: Copy the card URL to clipboard
- **Email**: Share via email client
- **Download vCard**: Download contact information as .vcf file

## 🎨 Customization Guide

### Colors and Theme
The card uses CSS custom properties for easy theming:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... more variables */
}
```

### Adding New Skills
Edit the `skills` array in `script.js`:

```javascript
this.cardData = {
    skills: ['JavaScript', 'React', 'Node.js', 'Your New Skill'],
    // ... other properties
};
```

### Modifying Contact Information
Update the contact details in the `cardData` object:

```javascript
this.cardData = {
    email: 'your-email@example.com',
    phone: '+1 (555) 123-4567',
    website: 'yourwebsite.com',
    // ... other properties
};
```

## 🔧 Advanced Features

### Print Support
The card includes optimized print styles:
- Removes floating buttons and modals
- Simplified layout for physical printing
- Maintains professional appearance

### Responsive Design
- **Mobile-first approach** with breakpoints at 640px and 480px
- **Touch-friendly** interface elements
- **Adaptive layout** for different screen sizes

### Performance Optimizations
- **Intersection Observer** for lazy animations
- **CSS animations** for smooth 60fps interactions
- **LocalStorage** for instant data access
- **Event delegation** for efficient event handling

## 🌐 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 6+)

## 🔮 Future Enhancements

- [ ] QR code generation for mobile sharing
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Export to PDF functionality
- [ ] Backend API integration
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom domain support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

If you have any questions or need help with customization, feel free to open an issue or reach out to the project maintainers.

---

**Built with ❤️ using modern web technologies**

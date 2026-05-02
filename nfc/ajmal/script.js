// Maplorix NFC Card - Simplified Digital Business Card
class MaplorixCard {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupAnalytics();
    }

    init() {
        this.card = document.querySelector('.business-card');
        this.actionButtons = document.querySelectorAll('.action-button');
        
        this.cardData = {
            name: 'Maplorix Developer',
            title: 'Full Stack Creator & Digital Solutions Expert',
            tagline: 'We build digital experiences',
            subtitle: 'that transform your business',
            email: 'hello@maplorix.com',
            phone: '+1 (234) 567-890',
            location: 'San Francisco, CA',
            website: 'https://maplorix.com'
        };
    }

    setupEventListeners() {
        // Action button clicks
        this.actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const href = e.currentTarget.href;
                const text = e.currentTarget.textContent.trim();
                
                // Track interaction
                this.trackInteraction(text, href);
                
                // Handle special actions
                if (href.includes('contact.vcf')) {
                    e.preventDefault();
                    this.downloadVCard();
                } else if (href.includes('profile.pdf')) {
                    e.preventDefault();
                    this.downloadProfile();
                }
            });
        });

        // Contact item clicks
        document.querySelectorAll('.contact-item a').forEach(link => {
            link.addEventListener('click', (e) => {
                const text = e.currentTarget.textContent;
                this.trackInteraction(`Contact: ${text}`, e.currentTarget.href);
            });
        });

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add entrance animations
        this.animateOnScroll();
    }

    setupAnalytics() {
        // Simple interaction tracking
        this.interactions = [];
    }

    trackInteraction(action, target) {
        const interaction = {
            action: action,
            target: target,
            timestamp: new Date().toISOString()
        };
        
        this.interactions.push(interaction);
        console.log('Interaction tracked:', interaction);
        
        // In a real implementation, this would send to analytics service
        // this.sendToAnalytics(interaction);
    }

    downloadVCard() {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${this.cardData.name}
ORG:${this.cardData.title}
TEL:${this.cardData.phone}
EMAIL:${this.cardData.email}
URL:${this.cardData.website}
END:VCARD`;
        
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.cardData.name.replace(' ', '_')}.vcf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Contact saved to your device!', 'success');
    }

    downloadProfile() {
        // Create a simple profile PDF placeholder
        const profileContent = `
${this.cardData.name}
${this.cardData.title}

${this.cardData.tagline}
${this.cardData.subtitle}

Contact Information:
Email: ${this.cardData.email}
Phone: ${this.cardData.phone}
Location: ${this.cardData.location}
Website: ${this.cardData.website}

About:
Professional digital solutions expert specializing in modern web technologies,
creative design, and business transformation through innovative digital experiences.
        `;
        
        const blob = new Blob([profileContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.cardData.name.replace(' ', '_')}_profile.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Profile downloaded!', 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#2563EB'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideUp 0.6s ease-out forwards';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.tagline-section, .actions-section, .contact-section').forEach(section => {
            observer.observe(section);
        });
    }

    // Public methods for external access
    getInteractionData() {
        return this.interactions;
    }

    updateCardData(newData) {
        this.cardData = { ...this.cardData, ...newData };
        this.updateCardDisplay();
    }

    updateCardDisplay() {
        document.querySelector('.name').textContent = this.cardData.name;
        document.querySelector('.title').textContent = this.cardData.title;
        document.querySelector('.tagline').textContent = this.cardData.tagline;
        document.querySelector('.tagline-subtitle').textContent = this.cardData.subtitle;
        
        // Update contact info
        const emailLink = document.querySelector('a[href^="mailto:"]');
        if (emailLink) {
            emailLink.href = `mailto:${this.cardData.email}`;
            emailLink.textContent = this.cardData.email;
        }
        
        const phoneLink = document.querySelector('a[href^="tel:"]');
        if (phoneLink) {
            phoneLink.href = `tel:${this.cardData.phone}`;
            phoneLink.textContent = this.cardData.phone;
        }
        
        // Update location
        const locationSpan = document.querySelector('.contact-item:last-child span');
        if (locationSpan) {
            locationSpan.textContent = this.cardData.location;
        }
    }
}

// Add custom animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new MaplorixCard();
    
    // Add loading animation
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Make app globally accessible for debugging
    window.MaplorixCard = app;
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaplorixCard;
}

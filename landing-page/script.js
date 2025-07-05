// PayMaster Landing Page JavaScript

// Smooth scrolling and navigation
function scrollToPricing() {
    document.getElementById('pricing').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
}

// FAQ accordion functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // If this item wasn't active, open it
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Demo video functionality
function watchDemo() {
    // You can replace this with actual video modal or redirect to demo video
    alert('Demo video coming soon! For now, you can download PayMaster to see it in action.');
}

// Purchase functionality
function purchaseNow() {
    // Your actual Stripe Payment Link
    const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/aFa28tgIGd3FbsLe8jao800';
    
    // Track the purchase attempt
    trackEvent('purchase_attempt', {
        product: 'PayMaster Professional',
        price: 149,
        currency: 'USD'
    });
    
    // Show loading state on button
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
    button.disabled = true;
    
    // Show notification
    showNotification('Redirecting to secure Stripe checkout...', 'info');
    
    // Small delay for better UX, then redirect
    setTimeout(() => {
        // Redirect to Stripe payment page
        window.location.href = STRIPE_PAYMENT_LINK;
    }, 800);
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .benefit-item, .testimonial-card, .problem-item').forEach(el => {
        observer.observe(el);
    });
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Form validation (if you add contact forms later)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Newsletter signup (if you add this feature)
function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate API call
    showNotification('Thank you for subscribing! We\'ll keep you updated on PayMaster news.', 'success');
    emailInput.value = '';
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Analytics tracking (replace with your analytics code)
function trackEvent(eventName, properties = {}) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // You can also add other analytics services here
    console.log('Event tracked:', eventName, properties);
}

// Track button clicks
function trackButtonClick(buttonName) {
    trackEvent('button_click', {
        button_name: buttonName,
        page_location: window.location.href
    });
}

// Add click tracking to important buttons
function initClickTracking() {
    // Track CTA buttons
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', () => {
            trackButtonClick(button.textContent.trim());
        });
    });
    
    // Track navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('navigation_click', {
                link_text: link.textContent.trim(),
                link_url: link.href
            });
        });
    });
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard.', 'error');
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavbarScroll();
    initClickTracking();
    
    // Add some entrance animations
    setTimeout(() => {
        document.querySelector('.hero-content').classList.add('loaded');
    }, 100);
    
    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
});

// Add scroll-to-top functionality
function addScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollButton.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    document.body.appendChild(scrollButton);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });
}

// Initialize scroll to top when page loads
document.addEventListener('DOMContentLoaded', addScrollToTop);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // ESC key closes any open modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Form enhancement (for future forms)
function enhanceForms() {
    document.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(e);
    
    // Basic validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required.');
        return false;
    }
    
    if (field.type === 'email' && value && !validateEmail(value)) {
        showFieldError(field, 'Please enter a valid email address.');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Initialize form enhancements
document.addEventListener('DOMContentLoaded', enhanceForms);

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        trackEvent('page_load_time', {
            load_time_ms: Math.round(loadTime),
            user_agent: navigator.userAgent
        });
    });
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);

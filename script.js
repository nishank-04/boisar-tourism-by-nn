
// Authentication State Management
let currentUser = null;

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            showUserNav();
        } catch (error) {
            console.error('Error parsing user data:', error);
            clearAuth();
        }
    } else {
        showAuthNav();
    }
}

// Show authentication navigation (login/register buttons)
function showAuthNav() {
    document.getElementById('navAuth').style.display = 'flex';
    document.getElementById('navUser').style.display = 'none';
}

// Show user navigation (user dropdown)
function showUserNav() {
    document.getElementById('navAuth').style.display = 'none';
    document.getElementById('navUser').style.display = 'flex';
    
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'User';
    }
}

// Clear authentication data
function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    currentUser = null;
    showAuthNav();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearAuth();
        window.location.href = 'index.html';
    }
}

// User dropdown toggle
function toggleUserDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdownMenu');
    const userBtn = document.getElementById('userBtn');
    
    if (dropdown && userBtn && !userBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Mobile Navigation Toggle with backdrop
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
let navBackdrop = document.querySelector('.nav-backdrop');

if (!navBackdrop) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    document.body.appendChild(navBackdrop);
}

function toggleMobileNav(forceState) {
    const willOpen = forceState !== undefined ? forceState : !hamburger.classList.contains('active');
    hamburger.classList.toggle('active', willOpen);
    navMenu.classList.toggle('active', willOpen);
    navBackdrop.classList.toggle('active', willOpen);
}

hamburger.addEventListener('click', () => toggleMobileNav());
navBackdrop.addEventListener('click', () => toggleMobileNav(false));

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(false));
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        // Set active link state
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active-link'));
        if (this.closest('.nav-menu')) {
            this.classList.add('active-link');
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Interactive Map Regions
document.querySelectorAll('.region').forEach(region => {
    region.addEventListener('click', function() {
        const regionName = this.dataset.region;
        showRegionInfo(regionName);
    });
});

function showRegionInfo(region) {
    const regionInfo = {
        'beach': {
            title: 'Beaches',
            destinations: ['Kelva Beach', 'Dahanu Beach'],
            description: 'Beautiful coastal beaches with serene environments and beach activities.'
        },
        'heritage': {
            title: 'Heritage Sites',
            destinations: ['Kaldurg Fort', 'Tarapur Fort'],
            description: 'Historic forts offering scenic views and glimpses into the past.'
        },
        'nature': {
            title: 'Nature & Waterfalls',
            destinations: ['Dabhosa Waterfall'],
            description: 'Stunning waterfalls surrounded by dense forests.'
        },
        'eco-tourism': {
            title: 'Eco Tourism',
            destinations: ['Kohoj Hill'],
            description: 'Scenic trekking spots with lush greenery and panoramic views.'
        }
    };

    const info = regionInfo[region];
    if (info) {
        alert(`${info.title}\n\n${info.description}\n\nKey Destinations:\n• ${info.destinations.join('\n• ')}`);
    }
}

// Card hover effects
document.querySelectorAll('.destination-card, .cultural-card, .tool-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Button click animations
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-card, .btn-tool').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect CSS
const style = document.createElement('style');
style.textContent = `
    .btn-primary, .btn-secondary, .btn-card, .btn-tool {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Form submission handling
document.querySelector('.contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject') || 'General Inquiry',
        message: formData.get('message'),
        phone: formData.get('phone') || ''
    };
    
    // Simple validation
    if (!contactData.name || !contactData.email || !contactData.message) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Thank you for your message! We will get back to you soon.', 'success');
            this.reset();
        } else {
            showMessage(result.message || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error sending contact message:', error);
        showMessage('Failed to send message. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Show message function
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        ${type === 'success' ? 
            'background: #d4edda; color: #155724;' : 
            'background: #f8d7da; color: #721c24;'
        }
    `;
    messageDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" 
               style="color: ${type === 'success' ? '#28a745' : '#dc3545'};"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Create booking function
async function createBooking(destinationName) {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            showMessage('Please login to make a booking', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Create booking data
        const bookingData = {
            destination: destinationName,
            type: 'accommodation',
            guests: {
                adults: 2,
                children: 0
            },
            checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'confirmed'
        };

        // Call backend API
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage(`Booking created successfully for ${destinationName}!`, 'success');
            
            // Add to dashboard if addBooking function exists
            if (window.addBooking) {
                window.addBooking({
                    destination: destinationName,
                    status: 'confirmed'
                });
            }
        } else {
            showMessage(result.message || 'Failed to create booking', 'error');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        showMessage('Failed to create booking. Please try again.', 'error');
    }
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.destination-card, .cultural-card, .tool-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Hero section parallax effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    // If Maps API didn't invoke initMap after a grace period, show fallback
    setTimeout(() => {
        if (!window.google || !window.google.maps || !document.getElementById('map')) return;
        // If map container is empty (no inline style from Maps), we assume init didn't run
        const mapEl = document.getElementById('map');
        if (!mapEl.firstChild) {
            mapsLoadError();
        }
    }, 4000);
});

// Map search integration with google-maps.js
let mapSearchDebounce;
function searchMapDestinations() {
    const input = document.getElementById('mapSearch');
    const resultsBox = document.getElementById('mapSearchResults');
    if (!input || !resultsBox) return;

    clearTimeout(mapSearchDebounce);
    mapSearchDebounce = setTimeout(() => {
        const query = input.value.trim();
        const results = window.searchDestinations ? window.searchDestinations(query) : [];

        if (!query || results.length === 0) {
            resultsBox.style.display = 'none';
            resultsBox.innerHTML = '';
            return;
        }

        resultsBox.innerHTML = results
            .map(r => `<div class=\"result-item\" data-name=\"${r.name}\"><strong>${r.name}</strong><br><small>${r.description}</small></div>`)
            .join('');
        resultsBox.style.display = 'block';

        Array.from(resultsBox.querySelectorAll('.result-item')).forEach(item => {
            item.addEventListener('click', () => {
                const name = item.getAttribute('data-name');
                if (window.tourismMap && typeof window.tourismMap.focusDestinationByName === 'function') {
                    window.tourismMap.focusDestinationByName(name);
                }
                resultsBox.style.display = 'none';
            });
        });
    }, 200);
}

// Close results on outside click
document.addEventListener('click', (e) => {
    const resultsBox = document.getElementById('mapSearchResults');
    const searchBar = document.querySelector('.map-search-container');
    if (resultsBox && searchBar && !searchBar.contains(e.target)) {
        resultsBox.style.display = 'none';
    }
});

// Live search typing + Enter key behavior
document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'mapSearch') {
        searchMapDestinations();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('mapSearch');
        const resultsBox = document.getElementById('mapSearchResults');
        if (document.activeElement === input && resultsBox && resultsBox.firstChild) {
            const first = resultsBox.querySelector('.result-item');
            if (first) first.click();
        }
    }
});

// Maps load error fallback
function mapsLoadError() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    mapEl.outerHTML = `
        <div class="map-fallback">
            <div class="fallback-content">
                <i class="fas fa-map-marker-alt"></i>
                <h3>Map Unavailable</h3>
                <p>We couldn't load Google Maps. Please check your internet and API key configuration.</p>
                <div class="setup-instructions">
                    <h5>How to fix</h5>
                    <ol>
                        <li>Replace YOUR_GOOGLE_MAPS_API_KEY in index.html with your key.</li>
                        <li>Enable Maps JavaScript API (and optionally Places, Directions).</li>
                        <li>Set HTTP referrer restrictions for your domain.</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

// Interactive features for destination cards
document.querySelectorAll('.destination-card .btn-card').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.destination-card');
        const title = card.querySelector('h3').textContent;
        
        // Create modal for destination details
        showDestinationModal(title);
    });
});

function showDestinationModal(title) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;

    modalContent.innerHTML = `
        <h2 style="color: #2d5a27; margin-bottom: 1rem;">${title}</h2>
        <p style="color: #666; margin-bottom: 1.5rem;">Discover more about this amazing destination in Boísar. Plan your visit and experience the natural beauty and cultural richness.</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="this.closest('.modal').remove()" style="background: #2d5a27; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">Close</button>
            <button onclick="createBooking('${destination.name}')" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">Book Now</button>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Animate modal
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add some interactive statistics
function updateStats() {
    const stats = [
        { selector: '.stat-number', value: '25+', suffix: ' Destinations' },
        { selector: '.stat-number', value: '50+', suffix: ' Activities' },
        { selector: '.stat-number', value: '1000+', suffix: ' Happy Visitors' }
    ];
    
    // This would be implemented with actual data in a real application
    console.log('Statistics would be updated here with real data');
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe all elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Parallax scrolling effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Add floating animation to elements
function initFloatingAnimations() {
    const floatingElements = document.querySelectorAll('.floating-icon');
    
    floatingElements.forEach((element, index) => {
        // Add random delay and duration
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;
        
        element.style.animationDelay = `${delay}s`;
        element.style.animationDuration = `${duration}s`;
    });
}

// Add hover effects to cards
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.destination-card, .feature-card, .testimonial-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add typing animation to text
function initTypingAnimation() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing animation when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    });
}

// Add pulse animation to buttons
function initButtonAnimations() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-card');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS for ripple effect
function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .btn-primary, .btn-secondary, .btn-card {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Boísar Tourism Platform Loaded Successfully!');
    checkAuthStatus();
    updateStats();
    
    // Add event listeners for user dropdown
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', toggleUserDropdown);
    }
    
    // Initialize animations
    initScrollAnimations();
    initParallax();
    initFloatingAnimations();
    initCardHoverEffects();
    initTypingAnimation();
    initButtonAnimations();
    addRippleStyles();
    
    // Add some dynamic content loading simulation
    setTimeout(() => {
        console.log('All interactive features are now active!');
    }, 1000);
});

// ===== Global Variables =====
let currentUser = null;
let cart = [];
const API_BASE_URL = getApiBaseUrl();

function getApiBaseUrl() {
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }

    if (window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port !== '5000')) {
        return 'http://localhost:5000/api/v1';
    }

    return '/api/v1';
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeCarousel();
    initializeTestimonials();
    loadCart();
    checkAuthStatus();
    loadFeaturedProducts();
});

// ===== Theme Toggle =====
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// ===== Navigation =====
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        }
    });
}

// ===== Hero Carousel =====
function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });
        
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto-advance slides
    setInterval(nextSlide, 5000);
}

// ===== Testimonials Slider =====
function initializeTestimonials() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });
        
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 6000);
}

// ===== Authentication Status =====
function checkAuthStatus() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

function updateAuthUI(isLoggedIn) {
    const authLink = document.getElementById('authLink');
    if (authLink) {
        if (isLoggedIn) {
            const isAdmin = currentUser?.role === 'admin';
            authLink.textContent = isAdmin ? 'Admin Dashboard' : 'Dashboard';
            authLink.href = isAdmin ? 'admin.html' : 'dashboard.html';
        } else {
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
        }
    }
}

// ===== Featured Products =====
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    try {
        const fallbackProducts = typeof window.getCatalogProducts === 'function'
            ? window.getCatalogProducts().slice(0, 4)
            : [];

        let products = fallbackProducts;

        if (products.length === 0) {
            const response = await fetch(`${API_BASE_URL}/products/featured?limit=4`);
            const result = await response.json().catch(() => null);
            products = response.ok && result?.success && Array.isArray(result.data)
                ? result.data.map(product => ({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    theme: product.theme || product.category,
                    price: product.price,
                    size: product.sizes?.[0]?.size || 'Standard',
                    image: product.image,
                    badge: product.isFeatured ? 'Featured' : null
                }))
                : [];
        }
        
        container.innerHTML = products.map(product => `
            <article class="product-card ${window.getProductThemeClass ? window.getProductThemeClass(product) : ''}" data-id="${product.id}">
                <div class="product-image" onclick="viewProduct(${product.id})" style="cursor:pointer;" role="button" tabindex="0">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <div class="overlay-copy">
                            <strong>Tap to explore</strong>
                            <span>Click then add the right size to cart</span>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description-snippet">${product.description || 'Premium skincare crafted for everyday use.'}</p>
                    <div class="product-price">${window.getProductPriceSummary ? window.getProductPriceSummary(product) : `Ksh ${product.price}/=`}</div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="showSizeOptions(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <a href="product-details.html?id=${product.id}" class="btn-view">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="text-center">Featured products are temporarily unavailable.</p>';
    }
}

// ===== Newsletter Form =====
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input').value;
        
        try {
            // In production: await fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
            showNotification('Thank you for subscribing!', 'success');
            e.target.reset();
        } catch (error) {
            showNotification('Failed to subscribe. Please try again.', 'error');
        }
    });
}

// ===== Utility Functions =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ===== Export Functions =====
window.addToCart = function(productId) {
    // This will be implemented in cart.js
    console.log('Add to cart:', productId);
};

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    currentUser = null;
    updateAuthUI(false);
    window.location.href = 'index.html';
};
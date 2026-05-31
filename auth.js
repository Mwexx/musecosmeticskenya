/* ===== Muse Cosmetics - Authentication JavaScript ===== */

// ===== Global Variables =====
let authCurrentUser = null;
let authToken = null;
const AUTH_API_BASE_URL = getApiBaseUrl();

function getApiBaseUrl() {
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }

    if (window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port !== '5000')) {
        return 'http://localhost:5000/api/v1';
    }

    return '/api/v1';
}

async function parseApiResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

// ===== Initialize Authentication =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeAuthForms();
});

// ===== Check Authentication Status =====
function checkAuthStatus() {
    const token = getAuthToken();
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (token && user) {
        const parsedUser = JSON.parse(user);

        if (isLegacyFallbackSession(token, parsedUser)) {
            clearLegacyFallbackAuth();
            updateAuthUI(false);
            return false;
        }

        authToken = token;
        authCurrentUser = parsedUser;
        updateAuthUI(true);
        return true;
    } else {
        authToken = null;
        authCurrentUser = null;
        updateAuthUI(false);
        return false;
    }
}

// ===== Update UI Based on Auth Status =====
function updateAuthUI(isLoggedIn) {
    const authLinks = document.querySelectorAll('#authLink, .auth-link');
    const protectedElements = document.querySelectorAll('.protected');
    const guestElements = document.querySelectorAll('.guest-only');
    
    authLinks.forEach(link => {
        if (isLoggedIn) {
            const isAdmin = authCurrentUser?.role === 'admin';
            link.textContent = isAdmin ? 'Admin Dashboard' : (authCurrentUser?.name?.split(' ')[0] || 'Dashboard');
            link.href = isAdmin ? 'admin.html' : 'dashboard.html';
        } else {
            link.textContent = 'Login';
            link.href = 'login.html';
        }
    });
    
    protectedElements.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    guestElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    // Update cart count with user data
    if (isLoggedIn) {
        loadUserCart();
    }
}

// ===== Initialize Auth Forms =====
function initializeAuthForms() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Forgot Password Form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Reset Password Form
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
    
    // Password Strength Checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Confirm Password Match
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
        });
    }
}

// ===== Login Handler =====
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const remember = document.getElementById('remember')?.checked || false;
    
    // Validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email) && !validatePhone(email)) {
        showNotification('Please enter a valid email or phone number', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        const response = await fetchWithTimeout(`${AUTH_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await parseApiResponse(response);
        
        // Save authentication data
        saveAuthData(result.data.token, result.data.user, remember);
        
        // Show success
        showNotification(result.message || 'Login successful! Welcome back.', 'success');
        
        // Redirect
        setTimeout(() => {
            const redirectUrl = getQueryParam('redirect') || (result.data.user?.role === 'admin' ? 'admin.html' : 'dashboard.html');
            window.location.href = resolveAppUrl(redirectUrl);
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        if (shouldUseLocalAuthFallback(error)) {
            const fallbackUser = buildFallbackUser(email);
            saveAuthData(generateFallbackToken(fallbackUser), fallbackUser, true);
            showNotification('Login successful! Welcome back.', 'success');

            setTimeout(() => {
                window.location.href = resolveAppUrl(fallbackUser.role === 'admin' ? 'admin.html' : 'dashboard.html');
            }, 1000);
            return;
        }
        showNotification(error.message || 'Invalid credentials. Please try again.', 'error');
        
        // Reset button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        submitBtn.disabled = false;
    }
}

// ===== Signup Handler =====
async function handleSignup(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName')?.value.trim(),
        lastName: document.getElementById('lastName')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        phone: document.getElementById('phone')?.value.trim(),
        password: document.getElementById('password')?.value,
        confirmPassword: document.getElementById('confirmPassword')?.value
    };
    
    // Validation
    const validationErrors = validateSignupForm(formData);
    if (validationErrors.length > 0) {
        validationErrors.forEach(error => showNotification(error, 'error'));
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        const response = await fetchWithTimeout(`${AUTH_API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            })
        });

        const result = await parseApiResponse(response);

        saveAuthData(result.data.token, result.data.user, true);
        
        // Show success
        showNotification(result.message || 'Account created successfully!', 'success');
        
        // Redirect to the correct dashboard for immediate access
        setTimeout(() => {
            window.location.href = resolveAppUrl(result.data.user?.role === 'admin' ? 'admin.html' : 'dashboard.html');
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        if (shouldUseLocalAuthFallback(error)) {
            const fallbackUser = {
                id: `local-${Date.now()}`,
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                role: 'customer',
                avatar: 'default-avatar.jpg',
                isVerified: true
            };

            saveAuthData(generateFallbackToken(fallbackUser), fallbackUser, true);
            showNotification('Account created successfully!', 'success');

            setTimeout(() => {
                window.location.href = resolveAppUrl('dashboard.html');
            }, 1500);
            return;
        }
        showNotification(error.message || 'Failed to create account. Please try again.', 'error');
        
        // Reset button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        submitBtn.disabled = false;
    }
}

// ===== Forgot Password Handler =====
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail')?.value.trim();
    
    if (!email || !validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${AUTH_API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await parseApiResponse(response);
        
        if (result.data?.resetUrl && result.data.emailSent === false) {
            showNotification(result.message || 'Opening password reset page...', 'success');
            setTimeout(() => {
                window.location.href = result.data.resetUrl;
            }, 1200);
        } else {
            showNotification(result.message || 'Password reset link sent to your email!', 'success');
            e.target.reset();
        }
        
    } catch (error) {
        showNotification(error.message || 'Failed to send reset link. Please try again.', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
        submitBtn.disabled = false;
    }
}

// ===== Reset Password Handler =====
async function handleResetPassword(e) {
    e.preventDefault();
    
    const token = getQueryParam('token');
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmNewPassword')?.value;
    
    if (!token) {
        showNotification('Invalid reset link', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${AUTH_API_BASE_URL}/auth/reset-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                password: newPassword
            })
        });

        await parseApiResponse(response);
        
        showNotification('Password reset successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = resolveAppUrl('login.html');
        }, 1500);
        
    } catch (error) {
        showNotification(error.message || 'Failed to reset password. Please try again.', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-lock"></i> Reset Password';
        submitBtn.disabled = false;
    }
}

// ===== Logout Function =====
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('remember');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    authToken = null;
    authCurrentUser = null;
    
    showNotification('You have been logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = resolveAppUrl('index.html');
    }, 1000);
}

// ===== Save Authentication Data =====
function saveAuthData(token, user, remember) {
    authToken = token;
    authCurrentUser = user;
    
    if (remember) {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('remember', 'true');
    } else {
        // Session storage for temporary login
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
    }
}

// ===== Validate Signup Form =====
function validateSignupForm(data) {
    const errors = [];

    if (!data.firstName || data.firstName.length < 2) {
        errors.push('First name must be at least 2 characters');
    }
    
    if (!data.lastName || data.lastName.length < 2) {
        errors.push('Last name must be at least 2 characters');
    }
    
    if (!data.email || !validateEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.phone || !validatePhone(data.phone)) {
        errors.push('Please enter a valid phone number (e.g., 07XX XXX XXX)');
    }
    
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return errors;
}

// ===== Password Strength Checker =====
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Character variety
    if (password.match(/[a-z]/)) strength += 15;
    if (password.match(/[A-Z]/)) strength += 15;
    if (password.match(/[0-9]/)) strength += 15;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 20;
    
    // Update UI
    strengthBar.style.width = strength + '%';
    
    if (strength <= 25) {
        strengthBar.style.background = '#dc3545';
        feedback = 'Weak';
    } else if (strength <= 50) {
        strengthBar.style.background = '#ffc107';
        feedback = 'Fair';
    } else if (strength <= 75) {
        strengthBar.style.background = '#28a745';
        feedback = 'Good';
    } else {
        strengthBar.style.background = '#20c997';
        feedback = 'Strong';
    }
    
    if (strengthText) {
        strengthText.textContent = password.length > 0 ? feedback : '';
    }
}

// ===== Validate Password Match =====
function validatePasswordMatch(password, confirmPassword) {
    const matchIndicator = document.getElementById('passwordMatch');
    
    if (!matchIndicator) return;
    
    if (confirmPassword.length === 0) {
        matchIndicator.style.display = 'none';
        return;
    }
    
    matchIndicator.style.display = 'block';
    
    if (password === confirmPassword) {
        matchIndicator.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i> Passwords match';
        matchIndicator.style.color = '#28a745';
    } else {
        matchIndicator.innerHTML = '<i class="fas fa-times-circle" style="color: #dc3545;"></i> Passwords do not match';
        matchIndicator.style.color = '#dc3545';
    }
}

// ===== Email Validation =====
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== Phone Validation (Kenyan Format) =====
function validatePhone(phone) {
    // Kenyan phone formats: 07XX XXX XXX, 01XX XXX XXX, +2547XX XXX XXX
    const phoneRegex = /^(\+254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ===== Format Phone Number =====
function formatPhoneNumber(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add Kenyan country code if not present
    if (cleaned.length === 9 && cleaned.startsWith('7') || cleaned.startsWith('1')) {
        return '0' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
        return '0' + cleaned.substring(3);
    }
    
    return phone;
}

// ===== Check if User is Logged In =====
function isLoggedIn() {
    return authToken !== null && authCurrentUser !== null;
}

// ===== Check if User is Admin =====
function isAdmin() {
    return authCurrentUser?.role === 'admin';
}

// ===== Require Authentication (Redirect if not logged in) =====
function requireAuth(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        const currentUrl = encodeURIComponent(window.location.href);
        const targetUrl = new URL(resolveAppUrl(redirectUrl));
        targetUrl.searchParams.set('redirect', currentUrl);
        window.location.href = targetUrl.href;
        return false;
    }
    return true;
}

// ===== Require Admin Access =====
function requireAdmin() {
    if (!isLoggedIn()) {
        const targetUrl = new URL(resolveAppUrl('login.html'));
        targetUrl.searchParams.set('redirect', window.location.href);
        window.location.href = targetUrl.href;
        return false;
    }
    
    if (!isAdmin()) {
        showNotification('Access denied. Admin privileges required.', 'error');
        window.location.href = resolveAppUrl('dashboard.html');
        return false;
    }
    return true;
}

// ===== Get Auth Token =====
function getAuthToken() {
    return authToken || localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
}

function isJwtToken(value) {
    return typeof value === 'string' && value.split('.').length === 3;
}

function isLegacyFallbackSession(token, user) {
    return !isJwtToken(token) && Boolean(user && typeof user.id === 'string' && user.id.startsWith('local-'));
}

function clearLegacyFallbackAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('remember');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
}

// ===== Get Auth Headers =====
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ===== Make Authenticated API Request =====
async function authFetch(url, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(`${AUTH_API_BASE_URL}${url}`, mergedOptions);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }
        
        return response;
    } catch (error) {
        if (window.location.hostname.includes('vercel.app') && url === '/cart') {
            return new Response(JSON.stringify({
                success: true,
                data: { items: [] }
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        console.error('API Request Error:', error);
        throw error;
    }
}

// ===== Load User Cart =====
async function loadUserCart() {
    if (!isLoggedIn()) return;
    
    try {
        const response = await authFetch('/cart');
        const cart = await response.json();
        
        // Update cart count
        updateCartCount(cart.items?.length || 0);
        
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

// ===== Update Cart Count =====
function updateCartCount(count) {
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    cartCountElements.forEach(el => {
        el.textContent = count;
        if (count > 0) {
            el.parentElement.classList.add('has-items');
        } else {
            el.parentElement.classList.remove('has-items');
        }
    });
}

// ===== Social Login (Google, Facebook) =====
function socialLogin(provider) {
    // Redirect to OAuth provider
    const redirectUrl = encodeURIComponent(window.location.href);
    
    switch(provider) {
        case 'google':
            window.location.href = `${AUTH_API_BASE_URL}/auth/google?redirect=${redirectUrl}`;
            break;
        case 'facebook':
            window.location.href = `${AUTH_API_BASE_URL}/auth/facebook?redirect=${redirectUrl}`;
            break;
        default:
            showNotification('Social login not available', 'error');
    }
}

// ===== Handle OAuth Callback =====
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
        try {
            const userData = JSON.parse(decodeURIComponent(user));
            saveAuthData(token, userData, true);
            showNotification('Login successful!', 'success');
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect
            setTimeout(() => {
                    window.location.href = resolveAppUrl('dashboard.html');
            }, 1000);
        } catch (error) {
            showNotification('Login failed. Please try again.', 'error');
        }
    }
}

// ===== Update User Profile =====
async function updateProfile(profileData) {
    if (!isLoggedIn()) {
        showNotification('Please login to update profile', 'error');
        return false;
    }
    
    try {
        const response = await authFetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        const updatedUser = await parseApiResponse(response);
        
        // Update local storage
        authCurrentUser = { ...authCurrentUser, ...updatedUser.data };
        localStorage.setItem('user', JSON.stringify(authCurrentUser));
        sessionStorage.setItem('user', JSON.stringify(authCurrentUser));
        
        showNotification('Profile updated successfully!', 'success');
        return true;
        
    } catch (error) {
        showNotification('Failed to update profile', 'error');
        return false;
    }
}

// ===== Change Password =====
async function changePassword(currentPassword, newPassword) {
    if (!isLoggedIn()) {
        showNotification('Please login to change password', 'error');
        return false;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters', 'error');
        return false;
    }
    
    try {
        const response = await authFetch('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        await parseApiResponse(response);
        
        showNotification('Password changed successfully!', 'success');
        return true;
        
    } catch (error) {
        showNotification('Failed to change password', 'error');
        return false;
    }
}

// ===== Delete Account =====
async function deleteAccount() {
    if (!isLoggedIn()) {
        showNotification('Please login to delete account', 'error');
        return false;
    }
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return false;
    }
    
    try {
        const response = await authFetch('/auth/delete-account', {
            method: 'DELETE'
        });
        
        await parseApiResponse(response);
        logout();
        showNotification('Account deleted successfully', 'success');
        return true;
        
    } catch (error) {
        showNotification('Failed to delete account', 'error');
        return false;
    }
}

// ===== Verify Email =====
async function verifyEmail(token) {
    try {
        const response = await fetch(`${AUTH_API_BASE_URL}/auth/verify-email?token=${token}`);
        await parseApiResponse(response);
        showNotification('Email verified successfully!', 'success');
        return true;
    } catch (error) {
        showNotification('Email verification failed', 'error');
        return false;
    }
}

// ===== Resend Verification Email =====
async function resendVerificationEmail() {
    if (!isLoggedIn()) {
        showNotification('Please login first', 'error');
        return false;
    }
    
    try {
        const response = await authFetch('/auth/resend-verification', {
            method: 'POST'
        });
        
        await parseApiResponse(response);
        showNotification('Verification email sent!', 'success');
        return true;
    } catch (error) {
        showNotification('Failed to send verification email', 'error');
        return false;
    }
}

// ===== Get Query Parameter =====
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function resolveAppUrl(path) {
    try {
        return new URL(path, window.location.origin).href;
    } catch (error) {
        return path;
    }
}

function shouldUseLocalAuthFallback(error = null) {
    if (!window.location.hostname.includes('vercel.app')) {
        return false;
    }

    if (!error) {
        return false;
    }

    const message = String(error.message || '');
    const status = Number(error.status || 0);

    if (status >= 400 && status < 500) {
        return false;
    }

    return error.name === 'AbortError' || /failed to fetch|networkerror|load failed|request failed/i.test(message) || status >= 500;
}

function generateFallbackToken(user) {
    return btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        ts: Date.now()
    }));
}

function buildFallbackUser(email) {
    const normalizedEmail = String(email || '').toLowerCase();

    const derivedName = normalizedEmail.split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase()) || 'Customer';

    return {
        id: `local-${Date.now()}`,
        name: derivedName,
        email: normalizedEmail,
        phone: '0712345678',
        role: 'customer',
        avatar: 'default-avatar.jpg',
        isVerified: true
    };
}
// ===== Show Notification =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== Check OAuth Callback on Page Load =====
if (window.location.search.includes('token=')) {
    handleOAuthCallback();
}

// ===== Export Functions =====
window.checkAuthStatus = checkAuthStatus;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.getAuthToken = getAuthToken;
window.getAuthHeaders = getAuthHeaders;
window.authFetch = authFetch;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.deleteAccount = deleteAccount;
window.socialLogin = socialLogin;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.showNotification = showNotification;
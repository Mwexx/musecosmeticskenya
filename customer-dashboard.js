const DASHBOARD_API_BASE_URL = getApiBaseUrl();

// Check Authentication
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.refreshAuthStatus === 'function') {
        await window.refreshAuthStatus();
    }

    const user = getCurrentUser();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update User Info
    document.getElementById('userName').textContent = `Welcome, ${user.name || 'User'}`;
    document.getElementById('userEmail').textContent = user.email || 'user@example.com';
    if (typeof loadCart === 'function') {
        loadCart();
    }
    
    // Initialize Dashboard
    await loadDashboardData();
    initializeSidebar();
    initializeProfileForm(user);
});

function getApiBaseUrl() {
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }

    if (window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port !== '5000')) {
        return 'http://localhost:5000/api/v1';
    }

    return '/api/v1';
}

function getAuthToken() {
    return null;
}

function getCurrentUser() {
    return typeof window.getCurrentUser === 'function' ? window.getCurrentUser() || {} : {};
}

function formatCurrency(value) {
    return `Ksh ${Number(value || 0).toLocaleString()}/=`;
}

function getCurrentCart() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
        return [];
    }
}

function renderCartPreview(cartItems) {
    const container = document.getElementById('cartPreviewList');
    const cartItemCount = document.getElementById('cartItemCount');
    const cartTotalSummary = document.getElementById('cartTotalSummary');

    if (!container) return;

    const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);

    if (cartItemCount) cartItemCount.textContent = String(totalItems);
    if (cartTotalSummary) cartTotalSummary.textContent = formatCurrency(totalAmount);

    if (cartItems.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">Your cart is empty. Browse products and add sizes to see them here.</p>';
        return;
    }

    container.innerHTML = cartItems.map(item => `
        <div class="cart-preview-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h5>${item.name}</h5>
                <p>${item.size} x ${item.quantity}</p>
            </div>
            <div class="line-total">${formatCurrency(item.price * item.quantity)}</div>
        </div>
    `).join('');
}

// Sidebar Navigation
function initializeSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.dashboard-section');
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const pageTitle = document.getElementById('pageTitle');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked
            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            // Update Title
            pageTitle.textContent = link.textContent.trim();
            
            // Mobile close
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
    
    // Mobile Toggle
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
}

function switchSection(sectionId) {
    const link = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
    if (link) link.click();
}

async function loadDashboardData() {
    const cartItems = getCurrentCart();
    renderCartPreview(cartItems);

    let orders = [];

    try {
        const response = typeof window.apiFetch === 'function'
            ? await window.apiFetch(`${DASHBOARD_API_BASE_URL}/orders/my-orders`, { method: 'GET' })
            : await fetch(`${DASHBOARD_API_BASE_URL}/orders/my-orders`, {
                method: 'GET',
                credentials: 'include'
            });

        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success && Array.isArray(result.data)) {
            orders = result.data;
        }
    } catch (error) {
        console.warn('Unable to load live orders:', error);
    }

    document.getElementById('totalOrders').textContent = String(orders.length);
    document.getElementById('pendingOrders').textContent = String(orders.filter(order => order.status === 'pending').length);
    document.getElementById('totalSpent').textContent = formatCurrency(orders.reduce((sum, order) => sum + Number(order.total || 0), 0));

    const recentTable = document.getElementById('recentOrdersTable');
    const allTable = document.getElementById('allOrdersTable');

    const renderRows = (data) => data.map(order => `
        <tr>
            <td>${order.orderNumber || order.id || ''}</td>
            <td>${new Date(order.createdAt || Date.now()).toISOString().slice(0, 10)}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>${formatCurrency(order.total)}</td>
            <td><button class="action-btn btn-view">View</button></td>
        </tr>
    `).join('');

    if (recentTable) recentTable.innerHTML = orders.length > 0 ? renderRows(orders.slice(0, 3)) : '<tr><td colspan="5">No orders yet.</td></tr>';
    if (allTable) allTable.innerHTML = orders.length > 0 ? renderRows(orders) : '<tr><td colspan="6">No orders yet.</td></tr>';

    const addressesList = document.getElementById('addressesList');
    if (addressesList) {
        const user = getCurrentUser();
        addressesList.innerHTML = `
            <div class="stat-card" style="margin-bottom: 15px;">
                <div>
                    <h4>${user.name || 'Saved Address'}</h4>
                    <p>${user.address || 'Kiamunyi, Nakuru County, Kenya'}</p>
                    <p>Phone: ${user.phone || '+254 104 081 145'}</p>
                </div>
                <button class="action-btn btn-edit">Edit</button>
            </div>
        `;
    }
}

// Profile Form
function initializeProfileForm(user) {
    const form = document.getElementById('profileForm');
    if (!form) return;
    
    document.getElementById('profileFirstName').value = user.name?.split(' ')[0] || '';
    document.getElementById('profileLastName').value = user.name?.split(' ')[1] || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Profile updated successfully!', 'success');
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}
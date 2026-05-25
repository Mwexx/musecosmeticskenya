// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update User Info
    document.getElementById('userName').textContent = `Welcome, ${user.name || 'User'}`;
    document.getElementById('userEmail').textContent = user.email || 'user@example.com';
    
    // Initialize Dashboard
    loadDashboardData();
    initializeSidebar();
    initializeProfileForm(user);
});

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

// Load Mock Data
function loadDashboardData() {
    // Mock Orders
    const orders = [
        { id: '#ORD-001', date: '2026-03-01', status: 'completed', total: 300, items: 3 },
        { id: '#ORD-002', date: '2026-03-05', status: 'processing', total: 150, items: 2 },
        { id: '#ORD-003', date: '2026-03-10', status: 'pending', total: 500, items: 5 }
    ];
    
    // Update Stats
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('totalSpent').textContent = `Ksh ${orders.reduce((sum, o) => sum + o.total, 0)}/=`;
    
    // Render Recent Orders
    const recentTable = document.getElementById('recentOrdersTable');
    const allTable = document.getElementById('allOrdersTable');
    
    const renderRows = (data) => {
        return data.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.date}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>Ksh ${order.total}/=</td>
                <td><button class="action-btn btn-view">View</button></td>
            </tr>
        `).join('');
    };
    
    if (recentTable) recentTable.innerHTML = renderRows(orders.slice(0, 3));
    if (allTable) allTable.innerHTML = renderRows(orders);
    
    // Render Addresses
    const addressesList = document.getElementById('addressesList');
    if (addressesList) {
        addressesList.innerHTML = `
            <div class="stat-card" style="margin-bottom: 15px;">
                <div>
                    <h4>Home</h4>
                    <p>Kiamunyi, Nakuru County, Kenya</p>
                    <p>Phone: +254 104 081 145</p>
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
        // In production: API call to update profile
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
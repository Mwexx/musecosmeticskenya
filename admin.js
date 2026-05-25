// Check Admin Authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Simple check (In production, check role from backend)
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Simulate Admin Check
    // For demo, we allow access. In production, check user.role === 'admin'
    
    initializeSidebar();
    loadAdminData();
});

function initializeSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.dashboard-section');
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const pageTitle = document.getElementById('pageTitle');
    const addProductBtn = document.getElementById('addProductBtn');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            pageTitle.textContent = link.textContent.trim();
            
            // Show Add Product button only on Products section
            if (sectionId === 'admin-products') {
                addProductBtn.style.display = 'block';
            } else {
                addProductBtn.style.display = 'none';
            }
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
    
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

// Load Admin Data
function loadAdminData() {
    // Mock Stats
    document.getElementById('adminTotalSales').textContent = 'Ksh 45,000';
    document.getElementById('adminTotalOrders').textContent = '156';
    document.getElementById('adminTotalProducts').textContent = '10';
    document.getElementById('adminNewCustomers').textContent = '23';
    
    // Mock Products
    const products = [
        { id: 1, name: 'Cocoa Butter Lotion', category: 'Lotions', price: 100, stock: 50, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100' },
        { id: 2, name: 'Carrot Light Lotion', category: 'Lotions', price: 100, stock: 30, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=100' },
        { id: 3, name: 'Strawberry Shampoo', category: 'Shampoo', price: 100, stock: 20, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=100' }
    ];
    
    const productsTable = document.getElementById('adminProductsTable');
    if (productsTable) {
        productsTable.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image}" class="product-img-thumb"></td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>Ksh ${p.price}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="action-btn btn-edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    // Mock Orders
    const orders = [
        { id: '#ORD-101', customer: 'Jane Doe', items: 3, total: 500, status: 'pending' },
        { id: '#ORD-102', customer: 'John Smith', items: 1, total: 200, status: 'completed' },
        { id: '#ORD-103', customer: 'Mary Wanjiku', items: 5, total: 1000, status: 'processing' }
    ];
    
    const ordersTable = document.getElementById('adminAllOrders');
    const recentOrdersTable = document.getElementById('adminRecentOrders');
    
    const renderOrders = (data, includeItems = false) => {
        return data.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customer}</td>
                ${includeItems ? `<td>${o.items}</td>` : ''}
                ${!includeItems ? `<td>Ksh ${o.total}</td><td>${o.status}</td>` : ''}
                ${includeItems ? `<td>Ksh ${o.total}</td><td><span class="status-badge status-${o.status}">${o.status}</span></td>` : ''}
                <td>
                    <select onchange="updateOrderStatus(this, '${o.id}')" style="padding: 5px;">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
            </tr>
        `).join('');
    };
    
    if (ordersTable) ordersTable.innerHTML = renderOrders(orders, true);
    if (recentOrdersTable) {
        recentOrdersTable.innerHTML = orders.slice(0, 3).map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customer}</td>
                <td>Ksh ${o.total}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                <td>2026-03-10</td>
            </tr>
        `).join('');
    }
    
    // Mock Customers
    const customers = [
        { name: 'Jane Doe', email: 'jane@example.com', phone: '0712345678', orders: 5, joined: '2026-01-15' },
        { name: 'John Smith', email: 'john@example.com', phone: '0723456789', orders: 2, joined: '2026-02-20' }
    ];
    
    const customersTable = document.getElementById('adminCustomersTable');
    if (customersTable) {
        customersTable.innerHTML = customers.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.orders}</td>
                <td>${c.joined}</td>
            </tr>
        `).join('');
    }
    
    // Mock Reviews
    const reviews = [
        { product: 'Cocoa Butter Lotion', customer: 'Sarah M.', rating: 5, comment: 'Excellent product!' },
        { product: 'Carrot Light', customer: 'Peter K.', rating: 4, comment: 'Good value for money.' }
    ];
    
    const reviewsTable = document.getElementById('adminReviewsTable');
    if (reviewsTable) {
        reviewsTable.innerHTML = reviews.map(r => `
            <tr>
                <td>${r.product}</td>
                <td>${r.customer}</td>
                <td>${'★'.repeat(r.rating)}</td>
                <td>${r.comment}</td>
                <td><button class="action-btn btn-delete">Delete</button></td>
            </tr>
        `).join('');
    }
}

// Modal Functions
function openProductModal() {
    document.getElementById('productModal').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Update Order Status (Mock)
function updateOrderStatus(select, orderId) {
    showNotification(`Order ${orderId} status updated to ${select.value}`, 'success');
    // In production: API call to update order status
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}
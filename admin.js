const API_BASE_URL = getApiBaseUrl();
let adminProductsCache = [];
let adminOrdersCache = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (!user || user.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    initializeSidebar();
    initializeProductForm();
    initializeEditProductForm();
    loadAdminData();
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
    return localStorage.getItem('token')
        || localStorage.getItem('authToken')
        || sessionStorage.getItem('token')
        || sessionStorage.getItem('authToken');
}

function getCurrentUser() {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
}

async function fetchApi(path, options = {}) {
    const token = getAuthToken();
    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

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
            links.forEach(item => item.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }

            if (pageTitle) {
                pageTitle.textContent = link.textContent.trim();
            }

            if (addProductBtn) {
                addProductBtn.style.display = sectionId === 'admin-products' ? 'block' : 'none';
            }

            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    });

    if (toggle && sidebar && overlay) {
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

function initializeProductForm() {
    const form = document.getElementById('addProductForm');
    if (!form) return;

    form.addEventListener('submit', handleAddProduct);
}

function initializeEditProductForm() {
    const form = document.getElementById('editProductForm');
    if (!form) return;

    form.addEventListener('submit', handleEditProduct);
}

async function handleAddProduct(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('productName')?.value.trim();
    const category = document.getElementById('productCategory')?.value;
    const description = document.getElementById('productDescription')?.value.trim();
    const price = document.getElementById('productPrice')?.value;
    const stock = document.getElementById('productStock')?.value;
    const imageFile = document.getElementById('productImage')?.files?.[0];
    const imageBack = document.getElementById('productImageBack')?.value.trim();
    const isFeatured = document.getElementById('productFeatured')?.checked || false;

    if (!name || !category || !description || !price || !stock) {
        showNotification('Please complete all required product fields.', 'error');
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('isFeatured', String(isFeatured));
        if (imageBack) {
            formData.append('imageBack', imageBack);
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        await fetchApi('/products', {
            method: 'POST',
            body: formData
        });

        showNotification('Product saved to the database.', 'success');
        e.target.reset();
        closeProductModal();
        await loadAdminData();
    } catch (error) {
        showNotification(error.message || 'Failed to save product.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Save Product';
    }
}

function openEditProductModal(productId) {
    const product = adminProductsCache.find(item => String(item._id || item.id) === String(productId));

    if (!product) {
        showNotification('Product not found.', 'error');
        return;
    }

    document.getElementById('editProductId').value = product._id || product.id || '';
    document.getElementById('editProductName').value = product.name || '';
    document.getElementById('editProductCategory').value = product.category || 'lotions';
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductPrice').value = product.price ?? 0;
    document.getElementById('editProductStock').value = product.stock ?? 0;
    document.getElementById('editProductImageBack').value = product.imageBack || '';
    document.getElementById('editProductFeatured').checked = Boolean(product.isFeatured);

    const modal = document.getElementById('editProductModal');
    if (modal) modal.style.display = 'block';
}

function closeEditProductModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) modal.style.display = 'none';
}

async function handleEditProduct(e) {
    e.preventDefault();

    const productId = document.getElementById('editProductId')?.value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('editProductName')?.value.trim();
    const category = document.getElementById('editProductCategory')?.value;
    const description = document.getElementById('editProductDescription')?.value.trim();
    const price = document.getElementById('editProductPrice')?.value;
    const stock = document.getElementById('editProductStock')?.value;
    const imageFile = document.getElementById('editProductImage')?.files?.[0];
    const imageBack = document.getElementById('editProductImageBack')?.value.trim();
    const isFeatured = document.getElementById('editProductFeatured')?.checked || false;

    if (!productId || !name || !category || !description || !price || !stock) {
        showNotification('Please complete all required product fields.', 'error');
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('isFeatured', String(isFeatured));

        if (imageBack) {
            formData.append('imageBack', imageBack);
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        await fetchApi(`/products/${productId}`, {
            method: 'PUT',
            body: formData
        });

        showNotification('Product updated successfully.', 'success');
        closeEditProductModal();
        await loadAdminData();
    } catch (error) {
        showNotification(error.message || 'Failed to update product.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Product';
    }
}

async function loadAdminData() {
    const productsTable = document.getElementById('adminProductsTable');
    const ordersTable = document.getElementById('adminAllOrders');
    const recentOrdersTable = document.getElementById('adminRecentOrders');
    const customersTable = document.getElementById('adminCustomersTable');
    const reviewsTable = document.getElementById('adminReviewsTable');

    try {
        const [productStats, orderStats, products, orders, users] = await Promise.all([
            fetchApi('/products/stats'),
            fetchApi('/orders/stats'),
            fetchApi('/products?limit=100'),
            fetchApi('/orders?limit=100'),
            fetchApi('/users?limit=100')
        ]);

        document.getElementById('adminTotalSales').textContent = `Ksh ${Number(orderStats.data?.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('adminTotalOrders').textContent = String(orderStats.data?.totalOrders || 0);
        document.getElementById('adminTotalProducts').textContent = String(productStats.data?.totalProducts || 0);

        adminProductsCache = Array.isArray(products.data) ? products.data : [];
        adminOrdersCache = Array.isArray(orders.data) ? orders.data : [];

        const customerUsers = Array.isArray(users.data) ? users.data.filter(item => item.role !== 'admin') : [];
        document.getElementById('adminNewCustomers').textContent = String(customerUsers.length);

        renderProducts(productsTable, adminProductsCache);
        renderOrders(ordersTable, recentOrdersTable, adminOrdersCache);
        renderCustomers(customersTable, customerUsers, adminOrdersCache);
        renderReviews(reviewsTable);
    } catch (error) {
        console.error('Admin dashboard load error:', error);
        showNotification(error.message || 'Failed to load admin data.', 'error');
        adminProductsCache = [];
        adminOrdersCache = [];
        renderProducts(productsTable, []);
        renderOrders(ordersTable, recentOrdersTable, []);
        renderCustomers(customersTable, [], []);
        renderReviews(reviewsTable);
    }
}

function renderProducts(container, products) {
    if (!container) return;

    if (!products.length) {
        container.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
        return;
    }

    container.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image || product.imageBack || 'default-product.jpg'}" class="product-img-thumb" alt="${product.name || 'Product'}"></td>
            <td>${product.name || ''}</td>
            <td>${product.category || ''}</td>
            <td>Ksh ${Number(product.price || 0).toLocaleString()}</td>
            <td>${product.stock ?? 0}</td>
            <td>
                <button class="action-btn btn-edit" type="button" onclick="openEditProductModal('${product._id || ''}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn btn-delete" type="button" onclick="deleteProduct('${product._id || ''}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderOrders(allOrdersContainer, recentOrdersContainer, orders) {
    if (allOrdersContainer) {
        if (!orders.length) {
            allOrdersContainer.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
        } else {
            allOrdersContainer.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.orderNumber || order.id || ''}</td>
                    <td>${order.user?.name || order.customer || 'Guest'}</td>
                    <td>${order.items?.length || 0}</td>
                    <td>Ksh ${Number(order.total || 0).toLocaleString()}</td>
                    <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                    <td>
                        <button type="button" class="btn btn-primary" onclick="approveOrder('${order._id || order.orderNumber || ''}')" ${order.status === 'completed' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> ${order.status === 'completed' ? 'Approved' : 'Approve'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    if (recentOrdersContainer) {
        if (!orders.length) {
            recentOrdersContainer.innerHTML = '<tr><td colspan="5">No recent orders.</td></tr>';
        } else {
            recentOrdersContainer.innerHTML = orders.slice(0, 3).map(order => `
                <tr>
                    <td>${order.orderNumber || order.id || ''}</td>
                    <td>${order.user?.name || order.customer || 'Guest'}</td>
                    <td>Ksh ${Number(order.total || 0).toLocaleString()}</td>
                    <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                    <td>${new Date(order.createdAt || Date.now()).toISOString().slice(0, 10)}</td>
                </tr>
            `).join('');
        }
    }
}

function renderCustomers(container, users, orders) {
    if (!container) return;

    if (!users.length) {
        container.innerHTML = '<tr><td colspan="5">No customers found.</td></tr>';
        return;
    }

    const orderCounts = orders.reduce((counts, order) => {
        const userId = order.user?._id || order.user;
        if (userId) {
            counts[userId] = (counts[userId] || 0) + 1;
        }
        return counts;
    }, {});

    container.innerHTML = users.map(user => `
        <tr>
            <td>${user.name || ''}</td>
            <td>${user.email || ''}</td>
            <td>${user.phone || ''}</td>
            <td>${orderCounts[user._id] || 0}</td>
            <td>${new Date(user.createdAt || Date.now()).toISOString().slice(0, 10)}</td>
        </tr>
    `).join('');
}

function renderReviews(container) {
    if (!container) return;

    container.innerHTML = `
        <tr>
            <td colspan="5">Review moderation is handled from individual product pages.</td>
        </tr>
    `;
}

function openProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'block';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
}

function approveOrder(orderId) {
    updateOrderStatus(orderId, 'completed');
}

window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const editProductModal = document.getElementById('editProductModal');
    if (event.target === productModal) {
        productModal.style.display = 'none';
    }
    if (event.target === editProductModal) {
        editProductModal.style.display = 'none';
    }
};

function updateOrderStatus(orderId, status) {
    if (!orderId) {
        showNotification('Unable to update order without an order ID.', 'error');
        return;
    }

    fetchApi(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    })
        .then(() => {
            showNotification(`Order ${orderId} approved as ${status}.`, 'success');
            loadAdminData();
        })
        .catch(error => {
            showNotification(error.message || 'Failed to update order status.', 'error');
            loadAdminData();
        });
}

async function deleteProduct(productId) {
    if (!productId) {
        showNotification('Unable to delete product without an ID.', 'error');
        return;
    }

    if (!confirm('Delete this product?')) {
        return;
    }

    try {
        await fetchApi(`/products/${productId}`, {
            method: 'DELETE'
        });

        showNotification('Product deleted successfully.', 'success');
        await loadAdminData();
    } catch (error) {
        showNotification(error.message || 'Failed to delete product.', 'error');
    }
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
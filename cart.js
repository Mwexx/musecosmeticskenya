// ===== Cart Management =====
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

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in navbar
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Add item to cart
function addToCart(productId, quantity = 1, size = null) {
    // Check if user is logged in
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (!token) {
        showNotification('Please login to add items to cart', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    // Get product details (in production, fetch from API)
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    const cartItemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (cartItemIndex > -1) {
        cart[cartItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size: size || product.sizes[0],
            quantity: quantity,
            image: product.image
        });
    }
    
    saveCart();
    showNotification('Added to cart successfully!', 'success');
    
    // Animate cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

// Update item quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        renderCart();
    }
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
}

// Get product by ID (mock function - replace with API call)
function getProductById(id) {
    // Mock products data
    const products = [
        {
            id: 1,
            name: 'Cocoa Butter Lotion',
            price: 100,
            sizes: ['100ml', '200ml', '400ml'],
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
        },
        {
            id: 2,
            name: 'Carrot Light Lotion',
            price: 100,
            sizes: ['100ml', '200ml', '400ml'],
            image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400'
        }
        // Add more products...
    ];
    
    return products.find(p => p.id === id);
}

// Render cart page
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartEmpty = document.getElementById('cartEmpty');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (cartEmpty) cartEmpty.classList.remove('hidden');
        if (cartTotal) cartTotal.textContent = '0';
        return;
    }
    
    if (cartEmpty) cartEmpty.classList.add('hidden');
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Size: ${item.size}</p>
                <p class="cart-item-price">Ksh ${item.price}/=</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${index}, -1)" class="qty-btn">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)" class="qty-btn">+</button>
            </div>
            <div class="cart-item-total">
                Ksh ${item.price * item.quantity}/=
            </div>
            <button onclick="removeFromCart(${index})" class="remove-item">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    if (cartTotal) {
        cartTotal.textContent = getCartTotal();
    }
}

// Checkout function
async function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (!token) {
        showNotification('Please login to checkout', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const orderData = {
            items: cart,
            total: getCartTotal(),
            deliveryAddress: document.getElementById('deliveryAddress')?.value || '',
            phoneNumber: document.getElementById('phoneNumber')?.value || ''
        };
        
        // In production: const response = await fetch('/api/orders', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(orderData) })
        
        showNotification('Order placed successfully!', 'success');
        clearCart();
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        showNotification('Failed to place order. Please try again.', 'error');
    }
}
// Export functions
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;
window.getCartTotal = getCartTotal;
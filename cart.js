// ===== Cart Management =====
let cartItems = [];
let productCatalog = [];
const CART_API_BASE_URL = getApiBaseUrl();

function syncLegacyCartState() {
    try {
        cart = cartItems;
    } catch (error) {
        // Ignore pages that do not define the legacy cart global.
    }
}

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
        cartItems = JSON.parse(savedCart).map(item => normalizeStoredCartItem(item));
        updateCartCount();
    }

    syncLegacyCartState();
    backfillCartProductIds();
}

function getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
}

function normalizeCatalogProduct(product) {
    return {
        id: product.id ?? product._id,
        apiId: product._id || product.apiId || product.id || null,
        name: product.name,
        category: product.category,
        description: product.description || '',
        ingredients: product.ingredients || '',
        benefits: Array.isArray(product.benefits) ? product.benefits : [],
        image: product.image,
        imageBack: product.imageBack || product.image,
        sizes: Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes
            : [{ size: 'Standard', price: product.price || 0 }],
        price: product.price || 0
    };
}

function isMongoObjectId(value) {
    return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

function normalizeStoredCartItem(item) {
    const normalized = { ...item };

    if (!normalized.id && normalized.productId) {
        normalized.id = normalized.productId;
    }

    if (!normalized.productId) {
        normalized.productId = normalized.apiId || normalized.mongoId || normalized.id || null;
    }

    return normalized;
}

async function loadProductCatalog() {
    try {
        const response = await fetch(`${CART_API_BASE_URL}/products?limit=100`);
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success && Array.isArray(result.data)) {
            productCatalog = result.data.map(normalizeCatalogProduct);
            return productCatalog;
        }
    } catch (error) {
        console.warn('Unable to load product catalog:', error);
    }

    if (window.getCatalogProducts) {
        const sharedCatalog = window.getCatalogProducts();
        if (Array.isArray(sharedCatalog) && sharedCatalog.length > 0) {
            productCatalog = sharedCatalog.map(normalizeCatalogProduct);
            return productCatalog;
        }
    }

    return productCatalog;
}

function resolveProductFromCatalog(productId) {
    const normalizedId = String(productId);

    if (window.getCatalogProductById) {
        const product = window.getCatalogProductById(normalizedId);
        if (product) {
            return normalizeCatalogProduct(product);
        }
    }

    const cached = productCatalog.find(product => String(product.id) === normalizedId);
    return cached || null;
}

async function backfillCartProductIds() {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return;
    }

    const catalog = await loadProductCatalog();
    let changed = false;

    cartItems = cartItems.map(item => {
        const normalized = normalizeStoredCartItem(item);
        const catalogMatch = catalog.find(product =>
            String(product.id) === String(normalized.id) ||
            String(product.apiId || '') === String(normalized.id) ||
            (normalized.name && product.name && product.name.trim().toLowerCase() === normalized.name.trim().toLowerCase())
        );

        if (catalogMatch) {
            const mongoProductId = catalogMatch.apiId || catalogMatch.id;
            if (mongoProductId && normalized.productId !== mongoProductId) {
                normalized.productId = mongoProductId;
                changed = true;
            }

            if (!normalized.id) {
                normalized.id = catalogMatch.id;
                changed = true;
            }
        }

        return normalized;
    });

    if (changed) {
        saveCart();
    } else {
        syncLegacyCartState();
    }
}

function resolvePrice(product, size, explicitPrice) {
    if (typeof explicitPrice === 'number') {
        return explicitPrice;
    }

    const sizeEntry = Array.isArray(product.sizes)
        ? product.sizes.find(entry => entry.size === size)
        : null;

    if (sizeEntry) {
        return sizeEntry.price;
    }

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        return product.sizes[0].price;
    }

    return product.price || 0;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    syncLegacyCartState();
    updateCartCount();
}

// Update cart count in navbar
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Add item to cart
function addToCart(productId, quantity = 1, size = null, price = null) {
    // Check if user is logged in
    const token = getAuthToken();
    if (!token) {
        showNotification('Please login to add items to cart', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const product = resolveProductFromCatalog(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    const selectedSize = size || product.sizes?.[0]?.size || 'Standard';
    const selectedPrice = resolvePrice(product, selectedSize, price);
    
    const cartItemIndex = cartItems.findIndex(item => 
        String(item.productId || item.id) === String(product.apiId || product.id) && item.size === selectedSize
    );
    
    if (cartItemIndex > -1) {
        cartItems[cartItemIndex].quantity += quantity;
    } else {
        cartItems.push({
            id: product.id,
            productId: product.apiId || product.id,
            name: product.name,
            price: selectedPrice,
            size: selectedSize,
            quantity: quantity,
            image: product.image,
            imageBack: product.imageBack,
            category: product.category
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
    cartItems.splice(index, 1);
    saveCart();
    renderCart();
}

// Update item quantity
function updateQuantity(index, change) {
    cartItems[index].quantity += change;
    
    if (cartItems[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        renderCart();
    }
}

// Get cart total
function getCartTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Clear cart
function clearCart() {
    cartItems = [];
    saveCart();
}

// Render cart page
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartEmpty = document.getElementById('cartEmpty');
    
    if (!cartItemsContainer) return;
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (cartEmpty) cartEmpty.classList.remove('hidden');
        if (cartTotal) cartTotal.textContent = '0';
        return;
    }
    
    if (cartEmpty) cartEmpty.classList.add('hidden');
    
    cartItemsContainer.innerHTML = cartItems.map((item, index) => `
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
    if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const token = getAuthToken();
    if (!token) {
        showNotification('Please login to checkout', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${CART_API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                items: cartItems.map(item => ({
                    product: item.productId || item.id,
                    name: item.name,
                    quantity: item.quantity,
                    size: item.size,
                    price: item.price
                })),
                deliveryAddress: document.getElementById('deliveryAddress')?.value || '',
                town: document.getElementById('town')?.value || 'Nakuru',
                county: document.getElementById('county')?.value || 'Nakuru',
                phone: document.getElementById('phoneNumber')?.value || '',
                paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || 'mpesa',
                deliveryInstructions: document.getElementById('deliveryInstructions')?.value || ''
            })
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false) {
            throw new Error(result.message || 'Failed to place order');
        }

        showNotification(result.message || 'Order placed successfully!', 'success');
        clearCart();
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        showNotification(error.message || 'Failed to place order. Please try again.', 'error');
    }
}

window.loadCart = loadCart;
window.saveCart = saveCart;
window.renderCart = renderCart;
window.loadProductCatalog = loadProductCatalog;
window.getAuthToken = getAuthToken;
// Export functions
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;
window.getCartTotal = getCartTotal;
window.ensureCartProductIds = backfillCartProductIds;
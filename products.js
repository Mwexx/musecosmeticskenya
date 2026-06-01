// ===== Products Data =====
const productsData = [
    {
        id: 1,
        name: 'Carrot Glow Lotion',
        category: 'lotions',
        theme: 'carrot',
        description: 'A brightening carrot lotion with a soft pink glow for daily skin care.',
        ingredients: 'Carrot extract, vitamin E, natural oils, moisture lock blend',
        benefits: ['Brightens the skin', 'Smooth daily moisture', 'Soft pink finish', 'Lightweight absorption'],
        image: 'assets/carrot.jpg',
        imageBack: 'assets/corrotlightglycerine.jpg',
        sizes: [
            { size: '100ml', price: 60 },
            { size: '200ml', price: 120 },
            { size: '400ml', price: 180 }
        ],
        rating: 4.9,
        reviews: 142,
        badge: 'Pink Glow'
    },
    {
        id: 2,
        name: 'Aloe Vera Calm Lotion',
        category: 'lotions',
        theme: 'aloe',
        description: 'A soothing aloe vera lotion with a cool blue finish for sensitive skin.',
        ingredients: 'Aloe vera extract, chamomile, vitamin E, soothing oils',
        benefits: ['Soothes irritation', 'Calms dry skin', 'Fresh blue look', 'Everyday hydration'],
        image: 'assets/aloevera.jpg',
        imageBack: 'assets/200mlaloevera.jpg',
        sizes: [
            { size: '100ml', price: 60 },
            { size: '200ml', price: 120 },
            { size: '400ml', price: 180 }
        ],
        rating: 4.8,
        reviews: 126,
        badge: 'Blue Care'
    },
    {
        id: 3,
        name: 'Muse Collection Lotion',
        category: 'lotions',
        theme: 'ocean',
        description: 'The signature Muse Collection lotion with an ocean-inspired premium finish.',
        ingredients: 'Cocoa butter, botanical oils, vitamin E, nourishing minerals',
        benefits: ['Premium skin feel', 'Elegant ocean tone', 'Rich moisture', 'All-day softness'],
        image: 'assets/musecolection.jpg',
        imageBack: 'assets/cocobatter.jpg',
        sizes: [
            { size: '100ml', price: 60 },
            { size: '200ml', price: 120 },
            { size: '400ml', price: 180 }
        ],
        rating: 4.9,
        reviews: 88,
        badge: 'Ocean Luxe'
    },
    {
        id: 4,
        name: 'Carrot Light Glycerin',
        category: 'glycerin',
        theme: 'carrot',
        description: 'A clear, light glycerin blend for smooth skin and a clean finish.',
        ingredients: 'Glycerin, carrot extract, vitamin E',
        benefits: ['Softens rough skin', 'Locks in moisture', 'Lightweight texture', 'Gentle daily care'],
        image: 'assets/carrotlightglycerine.jpg',
        imageBack: 'assets/carrot.jpg',
        sizes: [
            { size: '50ml', price: 50 }
        ],
        rating: 4.7,
        reviews: 61,
        badge: 'Light Glycerin'
    },
    {
        id: 5,
        name: 'Pure Glycerin',
        category: 'glycerin',
        theme: 'glycerin',
        description: 'Pure glycerin in a compact 50ml bottle for simple, effective moisture.',
        ingredients: 'Pure glycerin, moisture retention blend',
        benefits: ['Deep hydration', 'Non-greasy finish', 'Everyday skin support', 'Clean formula'],
        image: 'assets/pureglycerine.jpg',
        imageBack: 'assets/carrotlightglycerine.jpg',
        sizes: [
            { size: '50ml', price: 50 }
        ],
        rating: 4.8,
        reviews: 79,
        badge: 'Pure Care'
    },
    {
        id: 6,
        name: 'Milking Jelly',
        category: 'milking',
        theme: 'milking',
        description: 'A soft milking jelly for smooth, protected, and radiant skin.',
        ingredients: 'Milk extract, glycerin, vitamin E, softening blend',
        benefits: ['Smooth texture', 'Locks in moisture', 'Gentle on skin', 'Compact size'],
        image: 'assets/milkingjelly.jpg',
        imageBack: 'assets/pureglycerine.jpg',
        sizes: [
            { size: '50ml', price: 40 }
        ],
        rating: 4.6,
        reviews: 54,
        badge: 'Customer Favorite'
    }
];

let activeProducts = [...productsData];

const PRODUCTS_API_BASE_URL = window.API_BASE_URL || ((window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port !== '5000')) ? 'http://localhost:5000/api/v1' : '/api/v1');

function normalizeApiProduct(product) {
    return {
        id: product.id ?? product._id,
        apiId: product._id || product.apiId || product.id || null,
        name: product.name,
        category: product.category,
        theme: product.theme,
        description: product.description || '',
        ingredients: product.ingredients || '',
        benefits: Array.isArray(product.benefits) ? product.benefits : [],
        image: product.image,
        imageBack: product.imageBack || product.image,
        sizes: Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes
            : [{ size: 'Standard', price: product.price || 0 }],
        rating: product.averageRating ?? product.rating ?? 0,
        reviews: product.reviewCount ?? 0,
        badge: product.badge || ''
    };
}

function getProductThemeClass(product) {
    const theme = product.theme || product.category || 'neutral';
    return `theme-${theme}`;
}

function getProductPriceSummary(product) {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
        return 'Price on request';
    }

    if (product.sizes.length === 1) {
        const size = product.sizes[0];
        return `${size.size} Ksh ${size.price}/=`;
    }

    const lowest = Math.min(...product.sizes.map(size => size.price));
    const highest = Math.max(...product.sizes.map(size => size.price));
    return `From Ksh ${lowest}/= to Ksh ${highest}/=`;
}

function mergeCatalogData(apiProducts = []) {
    if (!Array.isArray(apiProducts) || apiProducts.length === 0) {
        return [...productsData];
    }

    const matchedApiIndexes = new Set();

    const mergedLocalProducts = productsData.map(localProduct => {
        const remoteIndex = apiProducts.findIndex(apiProduct =>
            apiProduct.name?.trim().toLowerCase() === localProduct.name.trim().toLowerCase()
        );
        const remoteProduct = remoteIndex >= 0 ? apiProducts[remoteIndex] : null;

        if (!remoteProduct) {
            return { ...localProduct };
        }

        matchedApiIndexes.add(remoteIndex);

        return {
            ...localProduct,
            ...remoteProduct,
            id: localProduct.id,
            apiId: remoteProduct.apiId || remoteProduct._id || localProduct.apiId || null,
            image: localProduct.image,
            imageBack: localProduct.imageBack,
            sizes: localProduct.sizes,
            theme: localProduct.theme,
            badge: localProduct.badge
        };
    });

    const remoteOnlyProducts = apiProducts
        .filter((_, index) => !matchedApiIndexes.has(index))
        .map(remoteProduct => {
            const remoteId = remoteProduct.id ?? remoteProduct.apiId ?? remoteProduct._id;
            return {
                ...remoteProduct,
                id: remoteId,
                apiId: remoteProduct.apiId || remoteProduct._id || remoteId,
                theme: remoteProduct.theme || remoteProduct.category || 'neutral',
                badge: remoteProduct.badge || (remoteProduct.isFeatured ? 'Featured' : '')
            };
        });

    return [...mergedLocalProducts, ...remoteOnlyProducts];
}

function getCatalogProducts() {
    return activeProducts.length > 0 ? activeProducts : productsData;
}

function getCatalogProductById(productId) {
    const normalizedId = String(productId);
    return getCatalogProducts().find(product => String(product.id) === normalizedId || String(product.apiId || '') === normalizedId) || null;
}

async function loadProductsFromApi() {
    try {
        const response = await fetch(`${PRODUCTS_API_BASE_URL}/products?limit=100`);
        const result = await response.json().catch(() => null);

        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
            return mergeCatalogData(result.data.map(normalizeApiProduct));
        }
    } catch (error) {
        console.warn('Falling back to local product data:', error);
    }

    return productsData;
}

// ===== Filter and Search =====
function filterProducts(category, searchTerm = '', source = activeProducts) {
    let filtered = source;
    
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return filtered;
}

// ===== Render Products =====
function renderProducts(products, containerId = 'productsGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        const safeProductId = JSON.stringify(String(product.id));
        const productDetailsUrl = `product-details.html?id=${encodeURIComponent(String(product.id))}`;
        return `
        <article class="product-card ${getProductThemeClass(product)}" data-id="${String(product.id)}">
            <a class="product-image" href="${productDetailsUrl}" aria-label="View details for ${product.name}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    <div class="overlay-copy">
                        <strong>Tap to view</strong>
                        <span>Add to cart from product details</span>
                    </div>
                </div>
            </a>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description-snippet">${product.description}</p>
                <div class="product-rating">
                    ${renderStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-price">
                    ${getProductPriceSummary(product)}
                </div>
                <button class="btn-add-cart" onclick="showSizeOptions(${safeProductId})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </article>
    `;
    }).join('');
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// ===== Product Details =====
function loadProductDetails(productId) {
    const product = getCatalogProductById(productId);
    if (!product) return null;
    
    return product;
}

function showSizeOptions(productId) {
    const product = getCatalogProductById(productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            <h3>Choose a size for ${product.name}</h3>
            <div class="size-options">
                ${product.sizes.map(s => `
                    <div class="size-option" onclick="selectSize(${JSON.stringify(String(product.id))}, ${JSON.stringify(String(s.size))}, ${s.price})">
                        <span>${s.size}</span>
                        <span>Ksh ${s.price}/=</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function selectSize(productId, size, price) {
    closeModal();
    addToCart(productId, 1, size, price);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function viewProduct(productId) {
    window.location.href = `product-details.html?id=${encodeURIComponent(String(productId))}`;
}

// ===== Initialize Product Pages =====
document.addEventListener('DOMContentLoaded', async () => {
    // Products page
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        const filterSelect = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');

        const renderCurrentCatalog = () => {
            const category = filterSelect?.value || 'all';
            const searchTerm = searchInput?.value || '';
            renderProducts(filterProducts(category, searchTerm, activeProducts));
        };

        renderCurrentCatalog();

        loadProductsFromApi().then((catalog) => {
            activeProducts = catalog;
            window.activeProducts = activeProducts;
            renderCurrentCatalog();
        });
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const filtered = filterProducts(e.target.value, searchInput?.value || '', activeProducts);
                renderProducts(filtered);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const filtered = filterProducts(filterSelect?.value || 'all', e.target.value, activeProducts);
                renderProducts(filtered);
            });
        }
    }
    
    // Product details page
    const productDetailsContainer = document.getElementById('productDetails');
    if (productDetailsContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const localProduct = loadProductDetails(productId);
        
        if (localProduct) {
            renderProductDetails(localProduct);
        } else {
            productDetailsContainer.innerHTML = '<p>Product not found</p>';
        }

        loadProductsFromApi().then((catalog) => {
            activeProducts = catalog;
            window.activeProducts = activeProducts;
            const product = loadProductDetails(productId);
            if (product) {
                renderProductDetails(product);
            }
        });
    }
});

// Export functions
window.showSizeOptions = showSizeOptions;
window.selectSize = selectSize;
window.closeModal = closeModal;
window.viewProduct = viewProduct;
window.filterProducts = filterProducts;
window.renderProducts = renderProducts;
window.loadProductsFromApi = loadProductsFromApi;
window.getCatalogProducts = getCatalogProducts;
window.getCatalogProductById = getCatalogProductById;
window.getProductThemeClass = getProductThemeClass;
window.getProductPriceSummary = getProductPriceSummary;
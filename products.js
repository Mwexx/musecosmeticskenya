// ===== Products Data =====
const productsData = [
    // Lotions
    {
        id: 1,
        name: 'Cocoa Butter Lotion',
        category: 'lotions',
        description: 'Rich and nourishing cocoa butter lotion for deep moisturization',
        ingredients: 'Cocoa Butter, Shea Butter, Vitamin E, Natural Oils',
        benefits: ['Deep moisturization', 'Improves skin elasticity', 'Reduces stretch marks', 'Natural glow'],
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        imageBack: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600',
        sizes: [
            { size: '100ml', price: 50 },
            { size: '200ml', price: 100 },
            { size: '400ml', price: 200 }
        ],
        rating: 4.8,
        reviews: 124
    },
    {
        id: 2,
        name: 'Carrot Light Lotion',
        category: 'lotions',
        description: 'Brightening lotion with carrot extract for even skin tone',
        ingredients: 'Carrot Extract, Vitamin C, Niacinamide, Natural Oils',
        benefits: ['Skin brightening', 'Even skin tone', 'Reduces dark spots', 'Hydrates deeply'],
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        imageBack: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        sizes: [
            { size: '100ml', price: 50 },
            { size: '200ml', price: 100 },
            { size: '400ml', price: 200 }
        ],
        rating: 4.7,
        reviews: 98
    },
    {
        id: 3,
        name: "Men's Lotion",
        category: 'lotions',
        description: 'Specially formulated lotion for men\'s skin care needs',
        ingredients: 'Aloe Vera, Tea Tree Oil, Vitamin E, Natural Extracts',
        benefits: ['Non-greasy formula', 'Quick absorption', 'Fresh scent', 'All-day moisture'],
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
        imageBack: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        sizes: [
            { size: '100ml', price: 50 },
            { size: '200ml', price: 100 },
            { size: '400ml', price: 200 }
        ],
        rating: 4.6,
        reviews: 76
    },
    {
        id: 4,
        name: 'Serum',
        category: 'lotions',
        description: 'Intensive serum for targeted skin treatment',
        ingredients: 'Hyaluronic Acid, Vitamin C, Peptides, Natural Extracts',
        benefits: ['Anti-aging', 'Deep hydration', 'Skin repair', 'Brightening'],
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600',
        imageBack: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        sizes: [
            { size: '100ml', price: 50 },
            { size: '200ml', price: 100 },
            { size: '400ml', price: 200 }
        ],
        rating: 4.9,
        reviews: 156
    },
    {
        id: 5,
        name: 'Aloe Vera Lotion',
        category: 'lotions',
        description: 'Soothing aloe vera lotion for sensitive skin',
        ingredients: 'Aloe Vera Extract, Chamomile, Vitamin E, Natural Oils',
        benefits: ['Soothes irritation', 'Heals sunburn', 'Lightweight', 'Natural healing'],
        image: 'https://images.unsplash.com/photo-1556228578-8d88d7c1e49f?w=600',
        imageBack: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
        sizes: [
            { size: '100ml', price: 50 },
            { size: '200ml', price: 100 },
            { size: '400ml', price: 200 }
        ],
        rating: 4.7,
        reviews: 112
    },
    
    // Jelly Products
    {
        id: 6,
        name: 'Cocoa Butter Jelly',
        category: 'jelly',
        description: 'Luxurious cocoa butter jelly for intense moisture',
        ingredients: 'Cocoa Butter, Petroleum Jelly, Vitamin E, Natural Fragrance',
        benefits: ['Long-lasting moisture', 'Protects skin barrier', 'Soft and smooth skin', 'Rich texture'],
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600',
        imageBack: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        sizes: [
            { size: '200ml', price: 200 }
        ],
        rating: 4.8,
        reviews: 89
    },
    {
        id: 7,
        name: 'Pure Petroleum Jelly',
        category: 'jelly',
        description: '100% pure petroleum jelly for all-purpose skin protection',
        ingredients: '100% Pure Petroleum Jelly',
        benefits: ['Multi-purpose', 'Protects skin', 'Heals dry patches', 'Locks in moisture'],
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        imageBack: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600',
        sizes: [
            { size: '200ml', price: 200 }
        ],
        rating: 4.9,
        reviews: 203
    },
    
    // Milking Jelly
    {
        id: 8,
        name: 'Scented Milking Jelly',
        category: 'milking',
        description: 'Fragrant milking jelly for smooth and soft skin',
        ingredients: 'Petroleum Jelly, Natural Fragrance, Vitamin E, Milk Extract',
        benefits: ['Pleasant fragrance', 'Silky smooth skin', 'Lightweight', 'Long-lasting'],
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
        imageBack: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        sizes: [
            { size: '50ml', price: 30 }
        ],
        rating: 4.6,
        reviews: 67
    },
    {
        id: 9,
        name: 'Pure Milking Jelly',
        category: 'milking',
        description: 'Unscented milking jelly for sensitive skin',
        ingredients: 'Petroleum Jelly, Milk Extract, Vitamin E',
        benefits: ['Fragrance-free', 'Gentle on skin', 'Deep moisture', 'Hypoallergenic'],
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        imageBack: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600',
        sizes: [
            { size: '50ml', price: 27 }
        ],
        rating: 4.7,
        reviews: 54
    },
    
    // Shampoo
    {
        id: 10,
        name: 'Strawberry Shampoo',
        category: 'shampoo',
        description: 'Refreshing strawberry scented shampoo for healthy hair',
        ingredients: 'Strawberry Extract, Natural Oils, Vitamins, Gentle Cleansers',
        benefits: ['Fresh strawberry scent', 'Cleanses gently', 'Adds shine', 'Strengthens hair'],
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600',
        imageBack: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        sizes: [
            { size: '1L', price: 100 }
        ],
        rating: 4.5,
        reviews: 43
    },
    {
        id: 11,
        name: 'Shea Glow Lotion',
        category: 'lotions',
        description: 'Hydrating lotion with shea butter and botanical oils for a soft glow',
        ingredients: 'Shea Butter, Argan Oil, Aloe Vera, Vitamin E',
        benefits: ['Deep moisture', 'Softens rough skin', 'Non-greasy finish', 'Healthy glow'],
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        imageBack: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
        sizes: [
            { size: '100ml', price: 120 },
            { size: '250ml', price: 220 }
        ],
        rating: 4.8,
        reviews: 61
    },
    {
        id: 12,
        name: 'Honey Silk Jelly',
        category: 'jelly',
        description: 'Silky jelly blend with honey extract for long-lasting protection',
        ingredients: 'Honey Extract, Petroleum Jelly, Vitamin E',
        benefits: ['Locks moisture', 'Soothes dryness', 'Soft silky finish', 'Gentle fragrance'],
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        imageBack: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600',
        sizes: [
            { size: '200ml', price: 210 }
        ],
        rating: 4.6,
        reviews: 38
    },
    {
        id: 13,
        name: 'Coconut Repair Shampoo',
        category: 'shampoo',
        description: 'Nourishing coconut shampoo designed for damaged and dry hair',
        ingredients: 'Coconut Oil, Keratin, Aloe Vera, Gentle Cleansers',
        benefits: ['Repairs dry hair', 'Adds shine', 'Strengthens strands', 'Fresh coconut scent'],
        image: 'https://images.unsplash.com/photo-1527799820374-dcdfb3d8979f?w=600',
        imageBack: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600',
        sizes: [
            { size: '1L', price: 150 }
        ],
        rating: 4.7,
        reviews: 49
    }
];

let activeProducts = [...productsData];

const API_BASE_URL = window.API_BASE_URL || ((window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port !== '5000')) ? 'http://localhost:5000/api/v1' : '/api/v1');

function normalizeApiProduct(product) {
    return {
        id: product.id,
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
        rating: product.averageRating ?? product.rating ?? 0,
        reviews: product.reviewCount ?? 0
    };
}

async function loadProductsFromApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=100`);
        const result = await response.json().catch(() => null);

        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
            return result.data.map(normalizeApiProduct);
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
    
    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image" onclick="viewProduct(${product.id})">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="btn-quick-view">Quick View</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${renderStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-price">
                    From Ksh ${Math.min(...product.sizes.map(s => s.price))}/=
                </div>
                <button class="btn-add-cart" onclick="showSizeOptions(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
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
    const product = activeProducts.find(p => p.id === productId);
    if (!product) return null;
    
    return product;
}

function showSizeOptions(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            <h3>Select Size - ${product.name}</h3>
            <div class="size-options">
                ${product.sizes.map(s => `
                    <div class="size-option" onclick="selectSize(${product.id}, '${s.size}', ${s.price})">
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
    addToCart(productId, 1, size);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// ===== Initialize Product Pages =====
document.addEventListener('DOMContentLoaded', async () => {
    // Products page
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        activeProducts = await loadProductsFromApi();
        renderProducts(activeProducts);
        
        // Filter functionality
        const filterSelect = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        
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
        const productId = parseInt(urlParams.get('id'));
        const product = loadProductDetails(productId);
        
        if (product) {
            renderProductDetails(product);
        } else {
            productDetailsContainer.innerHTML = '<p>Product not found</p>';
        }
    }
});

// Export functions
window.showSizeOptions = showSizeOptions;
window.selectSize = selectSize;
window.closeModal = closeModal;
window.viewProduct = viewProduct;
window.filterProducts = filterProducts;
window.renderProducts = renderProducts;
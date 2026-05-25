require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { connectDB } = require('../config/database');

const products = [
    {
        name: 'Cocoa Butter Lotion',
        description: 'Rich and nourishing cocoa butter lotion for deep moisturization',
        category: 'lotions',
        price: 100,
        stock: 100,
        image: '/uploads/cocoa-butter-lotion.jpg',
        ingredients: 'Cocoa Butter, Shea Butter, Vitamin E, Natural Oils',
        benefits: ['Deep moisturization', 'Improves skin elasticity', 'Reduces stretch marks', 'Natural glow'],
        isFeatured: true
    },
    {
        name: 'Carrot Light Lotion',
        description: 'Brightening lotion with carrot extract for even skin tone',
        category: 'lotions',
        price: 100,
        stock: 100,
        image: '/uploads/carrot-light-lotion.jpg',
        ingredients: 'Carrot Extract, Vitamin C, Niacinamide, Natural Oils',
        benefits: ['Skin brightening', 'Even skin tone', 'Reduces dark spots', 'Hydrates deeply'],
        isFeatured: true
    },
    {
        name: "Men's Lotion",
        description: 'Specially formulated lotion for men\'s skin care needs',
        category: 'lotions',
        price: 100,
        stock: 100,
        image: '/uploads/mens-lotion.jpg',
        ingredients: 'Aloe Vera, Tea Tree Oil, Vitamin E, Natural Extracts',
        benefits: ['Non-greasy formula', 'Quick absorption', 'Fresh scent', 'All-day moisture'],
        isFeatured: false
    },
    {
        name: 'Serum',
        description: 'Intensive serum for targeted skin treatment',
        category: 'lotions',
        price: 100,
        stock: 100,
        image: '/uploads/serum.jpg',
        ingredients: 'Hyaluronic Acid, Vitamin C, Peptides, Natural Extracts',
        benefits: ['Anti-aging', 'Deep hydration', 'Skin repair', 'Brightening'],
        isFeatured: true
    },
    {
        name: 'Aloe Vera Lotion',
        description: 'Soothing aloe vera lotion for sensitive skin',
        category: 'lotions',
        price: 100,
        stock: 100,
        image: '/uploads/aloe-vera-lotion.jpg',
        ingredients: 'Aloe Vera Extract, Chamomile, Vitamin E, Natural Oils',
        benefits: ['Soothes irritation', 'Heals sunburn', 'Lightweight', 'Natural healing'],
        isFeatured: false
    },
    {
        name: 'Cocoa Butter Jelly',
        description: 'Luxurious cocoa butter jelly for intense moisture',
        category: 'jelly',
        price: 200,
        stock: 50,
        image: '/uploads/cocoa-butter-jelly.jpg',
        ingredients: 'Cocoa Butter, Petroleum Jelly, Vitamin E, Natural Fragrance',
        benefits: ['Long-lasting moisture', 'Protects skin barrier', 'Soft and smooth skin', 'Rich texture'],
        isFeatured: true
    },
    {
        name: 'Pure Petroleum Jelly',
        description: '100% pure petroleum jelly for all-purpose skin protection',
        category: 'jelly',
        price: 200,
        stock: 50,
        image: '/uploads/petroleum-jelly.jpg',
        ingredients: '100% Pure Petroleum Jelly',
        benefits: ['Multi-purpose', 'Protects skin', 'Heals dry patches', 'Locks in moisture'],
        isFeatured: false
    },
    {
        name: 'Scented Milking Jelly',
        description: 'Fragrant milking jelly for smooth and soft skin',
        category: 'milking',
        price: 30,
        stock: 150,
        image: '/uploads/scented-milking-jelly.jpg',
        ingredients: 'Petroleum Jelly, Natural Fragrance, Vitamin E, Milk Extract',
        benefits: ['Pleasant fragrance', 'Silky smooth skin', 'Lightweight', 'Long-lasting'],
        isFeatured: false
    },
    {
        name: 'Pure Milking Jelly',
        description: 'Unscented milking jelly for sensitive skin',
        category: 'milking',
        price: 27,
        stock: 150,
        image: '/uploads/pure-milking-jelly.jpg',
        ingredients: 'Petroleum Jelly, Milk Extract, Vitamin E',
        benefits: ['Fragrance-free', 'Gentle on skin', 'Deep moisture', 'Hypoallergenic'],
        isFeatured: false
    },
    {
        name: 'Strawberry Shampoo',
        description: 'Refreshing strawberry scented shampoo for healthy hair',
        category: 'shampoo',
        price: 100,
        stock: 75,
        image: '/uploads/strawberry-shampoo.jpg',
        ingredients: 'Strawberry Extract, Natural Oils, Vitamins, Gentle Cleansers',
        benefits: ['Fresh strawberry scent', 'Cleanses gently', 'Adds shine', 'Strengthens hair'],
        isFeatured: true
    }
];

async function seedDatabase() {
    try {
        await connectDB();
        
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Existing data cleared');
        
        // Create admin user
        const adminPassword = await bcrypt.hash('Admin@123', 10);
        await User.create({
            name: 'Admin',
            email: 'admin@musecosmetics.co.ke',
            phone: '0700000000',
            password: adminPassword,
            role: 'admin',
            isVerified: true
        });
        console.log('✅ Admin user created');
        
        // Create sample customer
        const customerPassword = await bcrypt.hash('Customer@123', 10);
        await User.create({
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '0712345678',
            password: customerPassword,
            role: 'customer',
            isVerified: true
        });
        console.log('✅ Sample customer created');
        
        // Create products
        await Product.insertMany(products);
        console.log('✅ Products created');
        
        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('   Admin: admin@musecosmetics.co.ke / Admin@123');
        console.log('   Customer: customer@example.com / Customer@123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
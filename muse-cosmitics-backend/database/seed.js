require('dotenv').config();
const User = require('../models/User');
const Product = require('../models/Product');
const { connectDB } = require('../config/database');

const products = [
    {
        name: 'Carrot Glow Lotion',
        description: 'A brightening carrot lotion with a soft pink glow for daily skin care.',
        category: 'lotions',
        price: 60,
        stock: 100,
        image: '/uploads/carrot.jpg',
        imageBack: '/uploads/corrotlightglycerine.jpg',
        ingredients: 'Carrot extract, vitamin E, natural oils, moisture lock blend',
        benefits: ['Brightens the skin', 'Smooth daily moisture', 'Soft pink finish', 'Lightweight absorption'],
        sizes: [
            { size: '100ml', price: 60 },
            { size: '200ml', price: 120 },
            { size: '400ml', price: 180 }
        ],
        isFeatured: true
    },
    {
        name: 'Aloe Vera Calm Lotion',
        description: 'A soothing aloe vera lotion with a cool blue finish for sensitive skin.',
        category: 'lotions',
        price: 60,
        stock: 100,
        image: '/uploads/aloevera.jpg',
        imageBack: '/uploads/200mlaloevera.jpg',
        ingredients: 'Aloe vera extract, chamomile, vitamin E, soothing oils',
        benefits: ['Soothes irritation', 'Calms dry skin', 'Fresh blue look', 'Everyday hydration'],
        sizes: [
            { size: '100ml', price: 60 },
            { size: '200ml', price: 120 },
            { size: '400ml', price: 180 }
        ],
        isFeatured: true
    },
    {
        name: 'Muse Collection Lotion',
        description: 'The signature Muse Collection lotion with an ocean-inspired premium finish.',
        category: 'lotions',
        price: 60,
        stock: 100,
        image: '/uploads/musecolection.jpg',
        imageBack: '/uploads/cocobatter.jpg',
        ingredients: 'Cocoa butter, botanical oils, vitamin E, nourishing minerals',
        benefits: ['Premium skin feel', 'Elegant ocean tone', 'Rich moisture', 'All-day softness'],
        sizes: [
            { size: '100ml', price: 60 },
            { size: '200ml', price: 120 },
            { size: '400ml', price: 180 }
        ],
        isFeatured: true
    },
    {
        name: 'Carrot Light Glycerin',
        description: 'A clear, light glycerin blend for smooth skin and a clean finish.',
        category: 'glycerin',
        price: 50,
        stock: 100,
        image: '/uploads/corrotlightglycerine.jpg',
        imageBack: '/uploads/carrot.jpg',
        ingredients: 'Glycerin, carrot extract, vitamin E',
        benefits: ['Softens rough skin', 'Locks in moisture', 'Lightweight texture', 'Gentle daily care'],
        sizes: [
            { size: '50ml', price: 50 }
        ],
        isFeatured: true
    },
    {
        name: 'Pure Glycerin',
        description: 'Pure glycerin in a compact 50ml bottle for simple, effective moisture.',
        category: 'glycerin',
        price: 50,
        stock: 100,
        image: '/uploads/pureglycerine.jpg',
        imageBack: '/uploads/corrotlightglycerine.jpg',
        ingredients: 'Pure glycerin, moisture retention blend',
        benefits: ['Deep hydration', 'Non-greasy finish', 'Everyday skin support', 'Clean formula'],
        sizes: [
            { size: '50ml', price: 50 }
        ],
        isFeatured: false
    },
    {
        name: 'Milking Jelly',
        description: 'A soft milking jelly for smooth, protected, and radiant skin.',
        category: 'milking',
        price: 40,
        stock: 150,
        image: '/uploads/milkingjelly.jpg',
        imageBack: '/uploads/pureglycerine.jpg',
        ingredients: 'Milk extract, glycerin, vitamin E, softening blend',
        benefits: ['Smooth texture', 'Locks in moisture', 'Gentle on skin', 'Compact size'],
        sizes: [
            { size: '50ml', price: 40 }
        ],
        isFeatured: false
    }
];

async function seedDatabase() {
    try {
        await connectDB();

        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Existing data cleared');

        await User.create({
            name: 'Admin',
            email: 'admin@musecosmetics.co.ke',
            phone: '0700000000',
            password: 'Admin@123',
            role: 'admin',
            isVerified: true
        });
        console.log('✅ Admin user created');

        await User.create({
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '0712345678',
            password: 'Customer@123',
            role: 'customer',
            isVerified: true
        });
        console.log('✅ Sample customer created');

        await Product.insertMany(products);
        console.log('✅ Products created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Demo accounts were created. Check the seed file or environment variables for the credentials used in this environment.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
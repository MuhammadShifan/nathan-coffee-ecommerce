import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';
import Order from '../models/Order.js';
import Message from '../models/Message.js';
import { defaultProductsData } from '../routes/productRoutes.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nadhan_coffee';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});
    await Order.deleteMany({});
    await Message.deleteMany({});
    console.log('🧹 Cleared old collections');

    // Seed Products
    const createdProducts = await Product.insertMany(defaultProductsData);
    console.log(`✅ Seeded ${createdProducts.length} Products`);

    // Seed Master Admin
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nadhancoffee.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Nadhan@2026';

    const admin = await Admin.create({
      name: 'Nadhan Master Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`✅ Seeded Master Admin: ${admin.email}`);

    // Seed Sample Realistic Orders
    const sampleOrders = [
      {
        orderId: 'NC-2026-881920',
        customer: {
          name: 'Senthil Kumar',
          email: 'senthil.k@gmail.com',
          phone: '9842155670',
          address: {
            doorNo: '14/B',
            street: 'R.S. Puram West',
            landmark: 'Near DB Road',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641002',
          },
        },
        items: [
          {
            productId: createdProducts[0]._id.toString(),
            title: 'Pure Filter Coffee Powder (250g)',
            weight: '250g',
            price: 299,
            quantity: 2,
            image: '/images/250g front.png',
          },
        ],
        pricing: {
          subtotal: 598,
          shippingFee: 0,
          discount: 0,
          totalAmount: 598,
        },
        payment: {
          status: 'paid',
          method: 'razorpay',
          razorpayOrderId: 'order_Nxk92Hsd0982',
          razorpayPaymentId: 'pay_Nzk881920Lks',
          razorpaySignature: 'sample_verified_signature_1',
          paidAt: new Date(Date.now() - 3600 * 1000 * 4),
        },
        orderStatus: 'dispatched',
        trackingNumber: 'STC-TN-98127391',
        courierPartner: 'ST Couriers',
      },
      {
        orderId: 'NC-2026-773412',
        customer: {
          name: 'Ananya Raghavan',
          email: 'ananya.raghavan@outlook.com',
          phone: '9443218765',
          address: {
            doorNo: '88',
            street: 'South Main Street',
            landmark: 'Opp. Big Temple',
            city: 'Thanjavur',
            state: 'Tamil Nadu',
            pincode: '613001',
          },
        },
        items: [
          {
            productId: createdProducts[1]._id.toString(),
            title: 'Pure Filter Coffee Powder (500g)',
            weight: '500g',
            price: 580,
            quantity: 1,
            image: '/images/500g fornt.png',
          },
          {
            productId: createdProducts[2]._id.toString(),
            title: 'Traditional Chicory Blended Coffee Powder',
            weight: '250g',
            price: 240,
            quantity: 1,
            image: '/images/chicory powder.jpg',
          },
        ],
        pricing: {
          subtotal: 820,
          shippingFee: 0,
          discount: 0,
          totalAmount: 820,
        },
        payment: {
          status: 'paid',
          method: 'razorpay',
          razorpayOrderId: 'order_Nmj817362Kls',
          razorpayPaymentId: 'pay_Pqw773412Xmp',
          razorpaySignature: 'sample_verified_signature_2',
          paidAt: new Date(Date.now() - 3600 * 1000 * 12),
        },
        orderStatus: 'delivered',
        trackingNumber: 'PROF-CB-78192837',
        courierPartner: 'Professional Couriers',
      },
      {
        orderId: 'NC-2026-654921',
        customer: {
          name: 'Muthukumar Natarajan',
          email: 'muthu.tn@gmail.com',
          phone: '9789012345',
          address: {
            doorNo: '42',
            street: 'Avinashi Road, Peelamedu',
            landmark: 'Near PSG Tech',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641004',
          },
        },
        items: [
          {
            productId: createdProducts[0]._id.toString(),
            title: 'Pure Filter Coffee Powder (250g)',
            weight: '250g',
            price: 299,
            quantity: 1,
            image: '/images/250g front.png',
          },
        ],
        pricing: {
          subtotal: 299,
          shippingFee: 40,
          discount: 0,
          totalAmount: 339,
        },
        payment: {
          status: 'paid',
          method: 'razorpay',
          razorpayOrderId: 'order_Pkl881924Jkl',
          razorpayPaymentId: 'pay_Rty654921Bnm',
          razorpaySignature: 'sample_verified_signature_3',
          paidAt: new Date(Date.now() - 3600 * 1000 * 2),
        },
        orderStatus: 'processing',
        trackingNumber: 'STC-TN-48192801',
        courierPartner: 'ST Couriers',
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log(`✅ Seeded ${sampleOrders.length} Sample Orders`);

    // Seed Sample Messages
    await Message.create({
      name: 'Karthik Raja',
      email: 'karthik@southcafes.in',
      phone: '9840192837',
      subject: 'Bulk Monthly Supply for Cafe Chain in Chennai',
      message: 'HelloNathan Coffee team, We run 4 traditional South Indian breakfast cafes in Chennai. We want 50kg monthly fresh roast 80:20 blend. Please send wholesale quote.',
    });
    console.log('✅ Seeded Sample Contact Message');

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const defaultUsers = [
  {
    name: 'Admin User',
    email: 'admin@admin.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Cashier User',
    email: 'cashier@admin.com',
    password: 'cashier123',
    role: 'cashier',
  },
];

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const defaultUser of defaultUsers) {
      const existingUser = await User.findOne({ email: defaultUser.email });

      if (existingUser) {
        console.log(`${defaultUser.role} user already exists`);
        console.log(`Email: ${defaultUser.email}`);
        console.log(`Password: ${defaultUser.password}`);
        continue;
      }

      console.log(`Creating ${defaultUser.role} user...`);
      const user = new User(defaultUser);
      await user.save();
      console.log(`Default ${defaultUser.role} user created`);
      console.log(`Email: ${defaultUser.email}`);
      console.log(`Password: ${defaultUser.password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();

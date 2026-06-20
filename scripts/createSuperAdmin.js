import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: '12345678',
      passwordConfirm: '12345678',
      role: 'superAdmin',
    });

    console.log('Super Admin created:', superAdmin.email);
  } catch (err) {
    console.log(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createSuperAdmin();

export default createSuperAdmin;

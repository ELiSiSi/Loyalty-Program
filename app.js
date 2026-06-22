import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

// import CreateSuperAdmin from './scripts/createSuperAdmin.js';
// CreateSuperAdmin();

import connectDB from './config/db.js';
import HandleError from './controller/handleError.js';
import admin from './routes/admin.js';
import auth from './routes/auth.js';
import categoryAdmin from './routes/categoryAdmin.js';
import categorySuperAdmin from './routes/categorySuperAdmin.js';
import companyAdmin from './routes/companyAdmin.js';
import companySuperAdmin from './routes/companySuperAdmin.js';
import point from './routes/pointAdmin.js';
import productUser from './routes/productUser.js';
import productAdmin from './routes/productAdmin.js';
import productSuperAdmin from './routes/productSuperAdmin.js';
import superAdmin from './routes/superAdmin.js';
import user from './routes/user.js';
import AppError from './utils/appError.js';
import OfferUser from './routes/offerUser.js';
import OfferAdmin from './routes/offerAdmin.js';
import SuperAdminOffer from './routes/offerSuperAdmin.js';
import GiftAdmin from './routes/giftAdmin.js';
import GiftSuperAdmin from './routes/giftSuperAdmin.js';
import CouponAdmin from './routes/couponAdmin.js';
import CouponSuperAdmin from './routes/couponSuperAdmin.js';
import Booking from './routes/bookingUser.js';
import BookingAdmin from './routes/bookingAdmin.js';
import BookingSuperAdmin from './routes/bookingSuperAdmin.js';
import './jobs/bookingAutoCancel.job.js';
import payment from './routes/paymentUser.js';
import paymentAdmin from './routes/paymentAdmin.js';
import paymentSuperAdmin from './routes/paymentSuperAdmin.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// app.use(
//   hpp({
//     whitelist: ['status', 'roles', 'sort'],
//   })
// );

app.use(compression());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.set('trust proxy', 1);
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    reason: 'TOO_MANY_REQUESTS',
    message_en: 'Too many requests from this IP, please try again later.',
  },
});

// ═══════════════════════════════════════════════════════════════════════
//---------------------------   ROUTES    --------------------------------
// ═══════════════════════════════════════════════════════════════════════
app.use('/api/v1', globalLimiter);



app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);
app.use('/api/v1/admin', admin);
app.use('/api/v1/super-admin', superAdmin);
app.use('/api/v1/company', companyAdmin);
app.use('/api/v1/company/super-admin', companySuperAdmin);
app.use('/api/v1/category/admin', categoryAdmin);
app.use('/api/v1/category/super-admin', categorySuperAdmin);
app.use('/api/v1/product', productUser);
app.use('/api/v1/admin/product', productAdmin);
app.use('/api/v1/offer', OfferUser);
app.use('/api/v1/admin/offer', OfferAdmin);
app.use('/api/v1/super-admin/offer', SuperAdminOffer);
app.use('/api/v1/point', point);
app.use('/api/v1/admin/gift', GiftAdmin);
app.use('/api/v1/super-admin/gift', GiftSuperAdmin);
app.use('/api/v1/coupon', CouponAdmin);
app.use('/api/v1/super-admin/coupon', CouponSuperAdmin);
app.use('/api/v1/booking', Booking);
app.use('/api/v1/admin/booking', BookingAdmin);
app.use('/api/v1/super-admin/booking', BookingSuperAdmin);
app.use('/api/v1/payment', payment);
app.use('/api/v1/admin/payment', paymentAdmin);
app.use('/api/v1/super-admin/payment', paymentSuperAdmin);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(HandleError);

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

connectDB();
app.listen(port, () => {
  console.log(`Server Running On ${port}`);
});

export default app;

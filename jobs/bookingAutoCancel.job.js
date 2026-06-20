import cron from 'node-cron';
import Booking from '../models/booking.js';

cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();

    const expiredTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await Booking.updateMany(
      {
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        createdAt: { $lte: expiredTime },
      },
      {
        $set: { bookingStatus: 'cancelled' },
      }
    );
  } catch (err) {
    console.log('Auto cancel error:', err.message);
  }
});

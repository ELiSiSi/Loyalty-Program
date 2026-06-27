import cron from 'node-cron';
import Booking from '../models/booking.js';
import User from '../models/user.js';
import Point from '../models/point.js';

cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();

    const expiredTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await Booking.updateMany(
      {
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        createdAt: { $lte: expiredTime },
      },
      {
        $set: {
          bookingStatus: 'cancelled',
        },
      }
    );

    const expiredUsers = await User.find({
      otpConfirmEmailExpires: { $lt: now },
    });

    for (const user of expiredUsers) {
      await Point.create({
        userId: user._id,
        lostPoints: 200,
        due: 'signup',
      });
    }

    await User.deleteMany({
      _id: {
        $in: expiredUsers.map((user) => user._id),
      },
    });

  } catch (err) {
    console.log('Cron error:', err.message);
  }
});

import cron from 'node-cron';
import { BookingService } from '../modules/booking/booking.service.js';
import { PointsService } from '../modules/points/points.service.js';

export class JobScheduler {
  private static tasks: any[] = [];

  static startJobs(): void {
    console.log('⏰ [Scheduler] Initializing automated background workers...');

    // 1. Auto-cancel expired reservation holds every 5 minutes
    const bookingCancelTask = cron.schedule('*/5 * * * *', async () => {
      try {
        const cancelledCount = await BookingService.autoCancelExpiredBookings();
        if (cancelledCount > 0) {
          console.log(`[Job:BookingAutoCancel] Cancelled ${cancelledCount} expired reservation holds.`);
        }
      } catch (err: any) {
        console.error('❌ [Job:BookingAutoCancel Error]:', err.message);
      }
    });
    this.tasks.push(bookingCancelTask);

    // 2. Process expired loyalty points daily at 02:00 AM
    const pointsExpiryTask = cron.schedule('0 2 * * *', async () => {
      try {
        const expiredCount = await PointsService.processExpiredPoints();
        if (expiredCount > 0) {
          console.log(`[Job:PointsExpiry] Processed and deducted ${expiredCount} expired point batches.`);
        }
      } catch (err: any) {
        console.error('❌ [Job:PointsExpiry Error]:', err.message);
      }
    });
    this.tasks.push(pointsExpiryTask);

    console.log('✅ [Scheduler] All background cron jobs active.');
  }

  static stopJobs(): void {
    console.log('🛑 [Scheduler] Stopping all background cron jobs...');
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
  }
}

import mongoose from 'mongoose';
import { UserModel } from '../user/user.model.js';
import { PointsLedgerModel } from '../points/points.model.js';
import { BookingModel } from '../booking/booking.model.js';
import { CampaignModel } from '../campaign/campaign.model.js';
import { VoucherModel } from '../reward/reward.model.js';

export class AnalyticsService {
  static async getTenantDashboardMetrics(tenantId: string) {
    const objectId = new mongoose.Types.ObjectId(tenantId);

    const [
      membersCount,
      membersByTier,
      pointsAgg,
      bookingsAgg,
      activeCampaignsCount,
      vouchersCount,
    ] = await Promise.all([
      // Total members
      UserModel.countDocuments({ $or: [{ tenantId: objectId }, { company: objectId }] }),

      // Members breakdown by tier
      UserModel.aggregate([
        { $match: { $or: [{ tenantId: objectId }, { company: objectId }] } },
        { $group: { _id: '$vipTier', count: { $sum: 1 } } },
      ]),

      // Total points issued vs redeemed vs outstanding
      PointsLedgerModel.aggregate([
        { $match: { tenantId: objectId, status: 'CONFIRMED' } },
        {
          $group: {
            _id: '$type',
            totalPoints: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Bookings aggregate
      BookingModel.aggregate([
        { $match: { tenantId: objectId } },
        {
          $group: {
            _id: '$bookingStatus',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$finalPrice' },
          },
        },
      ]),

      // Active campaigns
      CampaignModel.countDocuments({
        tenantId: objectId,
        isActive: true,
        endsAt: { $gte: new Date() },
      }),

      // Total vouchers issued
      VoucherModel.countDocuments({ tenantId: objectId }),
    ]);

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;
    let totalPointsExpired = 0;

    pointsAgg.forEach((item) => {
      if (item._id === 'EARN' || item._id === 'BONUS') {
        totalPointsIssued += item.totalPoints;
      } else if (item._id === 'REDEEM') {
        totalPointsRedeemed += Math.abs(item.totalPoints);
      } else if (item._id === 'EXPIRY') {
        totalPointsExpired += Math.abs(item.totalPoints);
      }
    });

    const outstandingLiability = Math.max(0, totalPointsIssued - totalPointsRedeemed - totalPointsExpired);
    const redemptionRate = totalPointsIssued > 0 ? ((totalPointsRedeemed / totalPointsIssued) * 100).toFixed(2) : '0.00';

    const tierMap: Record<string, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    membersByTier.forEach((t) => {
      if (t._id) tierMap[t._id.toLowerCase()] = t.count;
    });

    return {
      overview: {
        totalMembers: membersCount,
        activeCampaigns: activeCampaignsCount,
        totalVouchersIssued: vouchersCount,
      },
      pointsMetrics: {
        totalIssued: totalPointsIssued,
        totalRedeemed: totalPointsRedeemed,
        totalExpired: totalPointsExpired,
        outstandingBalanceLiability: outstandingLiability,
        redemptionRatePercent: `${redemptionRate}%`,
      },
      tierBreakdown: tierMap,
      bookingsSummary: bookingsAgg,
    };
  }
}

export const VIP_TIERS = {
  BRONZE: {
    code: 'bronze',
    name: 'Bronze Member',
    minPoints: 0,
    multiplier: 1.0,
    benefits: ['Standard earn rate', 'Seasonal promotions'],
  },
  SILVER: {
    code: 'silver',
    name: 'Silver VIP',
    minPoints: 2000,
    multiplier: 1.25,
    benefits: ['1.25x point multiplier', 'Birthday bonus', 'Priority support'],
  },
  GOLD: {
    code: 'gold',
    name: 'Gold VIP',
    minPoints: 10000,
    multiplier: 1.5,
    benefits: ['1.5x point multiplier', 'Free reservation holds', 'Exclusive rewards access'],
  },
  PLATINUM: {
    code: 'platinum',
    name: 'Platinum Elite',
    minPoints: 25000,
    multiplier: 2.0,
    benefits: ['2.0x point multiplier', 'Zero point expiry', 'VIP concierge', 'Instant redemption'],
  },
} as const;

export type VipTierCode = keyof typeof VIP_TIERS;

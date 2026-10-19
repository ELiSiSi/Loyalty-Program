export const SAAS_PLANS = {
  FREE: {
    name: 'free',
    displayName: 'Free Tier',
    maxUsers: 500,
    maxCampaigns: 2,
    monthlyTransactionLimit: 2000,
    features: ['basic_loyalty', 'simple_rewards'],
  },
  STARTER: {
    name: 'starter',
    displayName: 'Starter Growth',
    maxUsers: 5000,
    maxCampaigns: 10,
    monthlyTransactionLimit: 25000,
    features: ['basic_loyalty', 'simple_rewards', 'coupons', 'custom_rules'],
  },
  GROWTH: {
    name: 'growth',
    displayName: 'Professional Scale',
    maxUsers: 50000,
    maxCampaigns: 50,
    monthlyTransactionLimit: 200000,
    features: ['basic_loyalty', 'simple_rewards', 'coupons', 'custom_rules', 'tiers', 'webhooks', 'analytics'],
  },
  ENTERPRISE: {
    name: 'enterprise',
    displayName: 'Enterprise Omnichannel',
    maxUsers: 1000000,
    maxCampaigns: 1000,
    monthlyTransactionLimit: 5000000,
    features: ['all_features', 'dedicated_support', 'audit_logs', 'custom_domain'],
  },
} as const;

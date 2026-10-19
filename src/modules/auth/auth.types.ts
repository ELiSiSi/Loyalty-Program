export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId?: string;
    vipTier?: string;
    availablePoints: number;
  };
  tokens: IAuthTokens;
}

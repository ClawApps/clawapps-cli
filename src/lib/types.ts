export type AuthProvider = 'google' | 'apple';

export interface ODTokens {
  access_token: string;
  refresh_token: string;
}

export interface ClawTokens {
  access_token: string;
  refresh_token: string;
}

export interface Credentials {
  provider: AuthProvider;
  access_token: string;
  refresh_token: string;
  od_token?: string;
  od_refresh_token?: string;
  logged_in_at: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  [key: string]: unknown;
}

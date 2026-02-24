export const CONFIG = {
  GOOGLE_CLIENT_ID: '89883978473-52rsbijnbti2lr3imsg9odjc04ulq1ds.apps.googleusercontent.com',

  OD_API_BASE: 'https://api.opendigits.ai/api/v1',
  CLAW_API_BASE: 'https://api.clawapps.ai/api/v1',

  // OD endpoints
  OD_GOOGLE_AUTH: 'https://api.opendigits.ai/api/v1/auth/oauth/google',
  OD_APPLE_AUTHORIZE: 'https://api.opendigits.ai/api/v1/auth/oauth/apple/authorize',

  // ClawApps endpoints
  CLAW_EXCHANGE: 'https://api.clawapps.ai/api/v1/auth/exchange',
  CLAW_ME: 'https://api.clawapps.ai/api/v1/auth/me',
  CLAW_REFRESH: 'https://api.clawapps.ai/api/v1/auth/refresh',
  CLAW_LOGOUT: 'https://api.clawapps.ai/api/v1/auth/logout',

  // Web
  CLAW_WEB_BASE: 'https://www.clawapps.ai',

  // Timeouts
  AUTH_TIMEOUT_MS: 2 * 60 * 1000, // 2 minutes

  // Credentials
  CREDENTIALS_DIR: '.clawapps',
  CREDENTIALS_FILE: 'credentials.json',
} as const;

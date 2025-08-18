// src/lib/types/auth.ts
export type CurrentUser = {
    isAuthenticated: boolean;
    sub?: string;
    username?: string;
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
    phoneNumberVerified?: boolean;
    givenName?: string;
    familyName?: string;
    name?: string;
    preferredUsername?: string;
    pictureUrl?: string;
    groups?: string[];
    tenantId?: string;
    locale?: string;
    timezone?: string;
    amr?: string[];
    exp?: number;
    iat?: number;
  };
  
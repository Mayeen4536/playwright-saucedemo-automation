import type { AuthRequest } from '../types/auth';

// restful-booker publishes admin/password123 as the only credential that can
// obtain a token from its public demo API — it is a published demo account,
// not a real secret, the same way SauceDemo's standard_user/secret_sauce is
// committed in tests/test-data/loginData.ts. What must never be committed is
// a *generated* token itself; none is persisted to disk by this suite.
export const adminCredentials: AuthRequest = {
  username: 'admin',
  password: 'password123',
};

export const invalidCredentials: AuthRequest = {
  username: 'admin',
  password: 'wrong_password',
};

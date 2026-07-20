export type AuthRequest = {
  username: string;
  password: string;
};

// restful-booker returns 200 for both outcomes below — the body shape is the
// only real signal of success or failure (verified empirically; see
// tests/api/auth.api.spec.ts).
export type AuthSuccessResponse = {
  token: string;
};

export type AuthFailureResponse = {
  reason: string;
};

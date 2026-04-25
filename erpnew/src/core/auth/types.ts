export type AuthUser = {
  email: string;
  username: string;
  role: string;
  normalized_role?: string;
  store_code?: string;
  organization_level?: string;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};
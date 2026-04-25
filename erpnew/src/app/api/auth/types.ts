export type AuthUser = {
  email: string;
  username: string;
  role: string;
  store_code: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};
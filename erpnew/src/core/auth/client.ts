import type { LoginRequestBody, LoginResponse } from "./types";
import { saveAuthSession } from "./session";
import { getRoleHomePath } from "./role-dashboard";
import { normalizeRole } from "./roles";

export async function loginUser(
  payload: LoginRequestBody
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Login failed");
  }

  saveAuthSession(data);

  const normalizedRole = normalizeRole(
    data?.user?.normalized_role || data?.user?.role
  );

  if (typeof window !== "undefined") {
    window.location.replace(getRoleHomePath(normalizedRole));
  }

  return data as LoginResponse;
}
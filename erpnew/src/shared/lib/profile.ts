export type UserProfile = {
  id?: string;
  name: string;
  email: string;
  username?: string;
  phone_number?: string;
  role?: string;
  organization_id?: string;
  store_code?: string;
  store_name?: string;
  district_code?: string;
  state_code?: string;
  organization_level?: string;
  user_code?: string;
  is_police_verified?: boolean;
  police_doc_url?: string;
  aadhaar_url?: string;
  pan_url?: string;
  is_active?: boolean;
};

export async function getProfile() {
  const res = await fetch("/profile/GetMy", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to fetch profile");
  }

  return json.data as UserProfile;
}

export async function updateProfile(payload: Partial<UserProfile>) {
  const res = await fetch("/profile/GetMy", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to update profile");
  }

  return json.data as UserProfile;
}
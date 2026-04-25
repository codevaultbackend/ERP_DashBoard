export const saveAuthSession = (data: any) => {
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("token", data.token);

  document.cookie = `token=${data.token}; path=/`;
};

export const getRoleHomePath = (role: string, level?: string) => {
  const routes: any = {
    "super_admin": "/head-office/dashboard",
    "state_manager": "/state/dashboard",
    "district_manager": "/district/dashboard",
    "retail_manager": "/retail/dashboard",
  };

  return routes[role] || "/unauthorized";
};
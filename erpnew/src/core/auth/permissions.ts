export const isHeadOfficeUser = (): boolean => {
  if (typeof window === "undefined") return false;

  const level =
    localStorage.getItem("level") ||
    sessionStorage.getItem("level") ||
    "";

  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role") ||
    "";

  return (
    level === "head_office" ||
    role === "head_manager"
  );
};

export const getUserLevel = (): string => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("level") ||
    sessionStorage.getItem("level") ||
    ""
  );
};

export const isDistrictUser = (): boolean => {
  return getUserLevel() === "district";
};

export const isRetailUser = (): boolean => {
  return getUserLevel() === "retail";
};

export const isStoreUser = (): boolean => {
  return ["district", "retail"].includes(
    getUserLevel()
  );
};
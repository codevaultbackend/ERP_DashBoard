export const isHeadOfficeUser = (): boolean => {
  if (typeof window === "undefined") return false;

  const level =
    localStorage.getItem("level") ||
    sessionStorage.getItem("level");

  return level === "head_office";
};
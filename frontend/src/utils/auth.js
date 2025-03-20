export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("tokenExpiry");
    if (!token || !expiry) return false;
  
    const now = new Date().getTime();
    if (now > expiry) {
      logout();
      return false;
    }
    return true;
  };
  
  export const getUserRole = () => {
    return localStorage.getItem("role");
  };
  
  export const setAuthToken = (token, role) => {
    const expiry = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 hours
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("tokenExpiry", expiry);
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("tokenExpiry");
    window.location.href = "/login";
  };
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("healthbot_user");
    const token = localStorage.getItem("healthbot_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("healthbot_user", JSON.stringify(userData));
    localStorage.setItem("healthbot_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("healthbot_user");
    localStorage.removeItem("healthbot_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}

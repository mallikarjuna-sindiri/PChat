import { createContext, useContext, useMemo, useState } from "react";
import { getToken, setToken, clearToken } from "../services/auth";

const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken());

  const login = (newToken) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
  };

  const value = useMemo(
    () => ({ isAuthenticated: Boolean(token), token, login, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

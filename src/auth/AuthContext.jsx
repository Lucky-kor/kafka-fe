import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // 컴포넌트가 마운트될 때 localStorage에서 accessToken과 username을 가져옴
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('username');  // 필요시 사용자 정보도 불러옴
    if (token) {
        setState({
            isAuthenticated: true,
            token: token,
            user: user,  // 또는 필요한 사용자 정보
        });
    }
}, []);
  const login = async (credentials) => {
    // 로그인 로직
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("username") === "admin@pingpong-works.com"; // 관리자 여부 확인

  return isAdmin ? children : <Navigate to="/" />; // 관리자가 아니면 메인 페이지로 리다이렉트
};

export default AdminRoute;

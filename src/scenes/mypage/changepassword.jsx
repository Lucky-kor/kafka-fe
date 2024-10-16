import React, { useState } from "react";
import { Box, Button, TextField, Typography, Snackbar, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

const ChangePassword = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
  
    setIsLoading(true);
    try {
      await axios.patch("http://localhost:8081/auth/employees/password", {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
  
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      
      // 2초 후 마이페이지로 이동
      setTimeout(() => {
        navigate("/mypage"); // 성공 후 마이 페이지로 이동
      }, 1000);
    } catch (error) {
      setErrorMessage("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box m="20px" display="flex" justifyContent="center">
      <Box
        sx={{
          width: "70%",
          maxWidth: "600px",
          backgroundColor: colors.primary[400],
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb="20px" color={colors.gray[100]} align="center">
          비밀번호 변경
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <TextField
            label="현재 비밀번호"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="새 비밀번호"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            fullWidth
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            variant="outlined"
          />

          {/* 버튼들 */}
          <Stack direction="row" justifyContent="center" spacing={2} mt="20px">
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
              disabled={isLoading}
              sx={{
                minWidth: "150px",  // 버튼 크기 통일
                backgroundColor: colors.blueAccent[600],  // 동일한 색상 적용
                "&:hover": {
                  backgroundColor: colors.blueAccent[700],  // 동일한 hover 색상
                },
              }}
            >
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/mypage")}
              sx={{
                minWidth: "150px",  // 버튼 크기 통일
              }}
            >
              취소
            </Button>
          </Stack>
        </Box>

        {/* 성공 및 오류 메시지 */}
        <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage("")}>
          <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: "100%" }}>
            {errorMessage}
          </Alert>
        </Snackbar>
        <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage("")}>
          <Alert onClose={() => setSuccessMessage("")} severity="success" sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ChangePassword;

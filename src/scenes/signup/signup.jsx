import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Grid, Snackbar, Alert, Stack, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    extensionNumber: "",
    departmentId: "",
    employeeRank: "",
  });

  const [departments, setDepartments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 직급 목록
  const ranks = [
    { value: "INTERN", label: "인턴" },
    { value: "STAFF", label: "사원" },
    { value: "SENIOR_STAFF", label: "주임" },
    { value: "ASSISTANT_MANAGER", label: "대리" },
    { value: "MANAGER", label: "과장" },
    { value: "SENIOR_MANAGER", label: "차장" },
    { value: "DIRECTOR", label: "부장" },
  ];

  // 부서 데이터 가져오기
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:8081/departments/all", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setDepartments(response.data); // 부서 데이터를 state에 저장
      } catch (error) {
        setErrorMessage("부서 데이터를 불러오는 데 실패했습니다.");
      }
    };

    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:8081/auth/employees", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("계정이 성공적으로 생성되었습니다.");
      setTimeout(() => {
        navigate("/mypage"); // 성공 후 마이페이지로 이동
      }, 2000);
    } catch (error) {
      setErrorMessage("계정 생성에 실패했습니다.");
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
          계정 생성
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <TextField
            label="이름"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="이메일"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="휴대폰 번호"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="내선 번호"
            name="extensionNumber"
            value={formData.extensionNumber}
            onChange={handleInputChange}
            fullWidth
          />

          {/* 부서 선택 */}
          <TextField
            select
            label="부서"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleInputChange}
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 직급 선택 */}
          <TextField
            select
            label="직급"
            name="employeeRank"
            value={formData.employeeRank}
            onChange={handleInputChange}
            fullWidth
          >
            {ranks.map((rank) => (
              <MenuItem key={rank.value} value={rank.value}>
                {rank.label}
              </MenuItem>
            ))}
          </TextField>

          {/* 버튼들 */}
          <Stack direction="row" justifyContent="center" spacing={2} mt="20px">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{
                minWidth: "150px",
                backgroundColor: colors.blueAccent[600],
                "&:hover": {
                  backgroundColor: colors.blueAccent[700],
                },
              }}
            >
              계정 생성
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/")}
              sx={{
                minWidth: "150px",
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

export default SignUp;

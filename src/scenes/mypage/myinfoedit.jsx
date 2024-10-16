import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, useTheme, Grid, Avatar, Snackbar, Alert, Stack } from "@mui/material";
import axios from "axios";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";

const MyInfoEdit = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "",
    phoneNumber: "",
    extensionNumber: "",
    emergencyNumber: "",
    address: "",
    vehicleNumber: "",
    profilePicture: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8081/auth/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const { name, phoneNumber, extensionNumber, emergencyNumber, address, vehicleNumber, profilePicture } = response.data.data;
        setUserInfo({ name, phoneNumber, extensionNumber, emergencyNumber, address, vehicleNumber, profilePicture });
        setProfileImage(profilePicture);
        setLoading(false);
      } catch (error) {
        setErrorMessage("사용자 정보를 불러오는 데 실패했습니다.");
      }
    };

    fetchUserInfo();
  }, []);

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 프로필 사진 변경 처리
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setUserInfo((prevState) => ({
          ...prevState,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 사용자 정보 수정 요청
  const handleSubmit = async () => {
    try {
      await axios.patch("http://localhost:8081/auth/employees", userInfo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setSuccessMessage("정보가 성공적으로 수정되었습니다.");
      navigate("/mypage", { replace: true });
    } catch (error) {
      setErrorMessage("정보 수정에 실패했습니다.");
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
          내 정보 수정
        </Typography>
        {!loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* 프로필 사진 및 변경 버튼 */}
            <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
              <Avatar alt={userInfo.name} src={profileImage || "/path-to-default-avatar.png"} sx={{ width: 120, height: 120, mb: 2 }} />
              <Button variant="contained" component="label" color="primary">
                프로필 사진 변경
                <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} />
              </Button>
            </Box>

            {/* 이름 수정 */}
            <TextField
              label="이름"
              name="name"
              value={userInfo.name}
              onChange={handleInputChange}
              fullWidth
            />

            {/* 연락 정보 */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="휴대폰 번호"
                  name="phoneNumber"
                  value={userInfo.phoneNumber}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="내선 번호"
                  name="extensionNumber"
                  value={userInfo.extensionNumber}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="비상 연락처"
                  name="emergencyNumber"
                  value={userInfo.emergencyNumber}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="차량 번호"
                  name="vehicleNumber"
                  value={userInfo.vehicleNumber}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* 추가 정보 */}
            <TextField
              label="주소"
              name="address"
              value={userInfo.address}
              onChange={handleInputChange}
              fullWidth
            />

            {/* 버튼들 */}
            <Stack direction="row" justifyContent="center" spacing={2} mt="20px">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{
                  minWidth: "150px",  // 버튼 크기 통일
                  backgroundColor: colors.blueAccent[600],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[700],
                  },
                }}
              >
                정보 수정
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

            {/* 성공/실패 알림 */}
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
        ) : (
          <Typography align="center">Loading...</Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyInfoEdit;

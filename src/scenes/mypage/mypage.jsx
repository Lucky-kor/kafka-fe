import {
  Box as MuiBox,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import { Header } from "../../components";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { tokens } from "../../theme";
import AttendanceStatistics from '../../components/AttendanceStatistics'; // 경로 확인 필요

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <MuiBox
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ width: '100%' }}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </MuiBox>
  );
}

const Mypage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmDevices = useMediaQuery(theme.breakpoints.down('md'));

  const [userInfo, setUserInfo] = useState({
    employeeId: "",
    name: "",
    email: "",
    profilePicture: "",
    departmentName: "",
    phoneNumber: "",
    extensionNumber: "",
    emergencyNumber: "",
    address: "",
    vehicleNumber: "",
    createdAt: "",
    employeeRank: "",
  });

  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // To handle button loading state
  const [errorMessage, setErrorMessage] = useState(""); // For Snackbar
  const [tabValue, setTabValue] = useState(0); // For managing tab selection

  const navigate = useNavigate();

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8081/auth/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUserInfo(response.data.data);
        // 사용자 정보를 가져온 후 출근/퇴근 데이터 불러오기
        fetchAttendanceData(Number(response.data.data.employeeId));
      } catch (error) {
        console.error("사용자 정보 가져오기 오류:", error);
        setErrorMessage("사용자 정보를 가져오는 데 실패했습니다.");
      }
    };

    fetchUserInfo();
  }, []);

  // 출근/퇴근 데이터 가져오기
  const fetchAttendanceData = async (employeeId) => {
    try {
      const response = await axios.get("http://localhost:8082/attendances/my-attendance", {
        params: { employeeId, page: 1, size: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });

      const events = response.data.data.map(attendance => {
        const checkIn = new Date(attendance.checkInTime);
        const checkOut = attendance.checkOutTime ? new Date(attendance.checkOutTime) : null;
        const workingHours = attendance.dailyWorkingTime || 'N/A';

        return {
          title: `출근: ${checkIn.toLocaleTimeString()} 퇴근: ${checkOut ? checkOut.toLocaleTimeString() : 'N/A'} 근무시간: ${workingHours} 시간`,
          start: checkIn,
          end: checkOut,
          extendedProps: {
            checkOutTime: checkOut ? checkOut.toLocaleTimeString() : 'N/A',
            workingHours: workingHours,
          }
        };
      });

      setAttendanceEvents(events);
    } catch (error) {
      console.error("출근/퇴근 데이터 가져오기 오류:", error);
    }
  };

  // 출근 수행
  const checkIn = async () => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8082/attendances/check-in", null, {
        params: {
          employeeId: Number(userInfo.employeeId)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      fetchAttendanceData(userInfo.employeeId);
    } catch (error) {
      console.error("출근 오류:", error.response?.data || error);
      setErrorMessage("출근에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 퇴근 수행
  const checkOut = async () => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8082/attendances/check-out", null, {
        params: {
          employeeId: Number(userInfo.employeeId)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      fetchAttendanceData(userInfo.employeeId);
    } catch (error) {
      console.error("퇴근 오류:", error.response?.data || error);
      setErrorMessage("퇴근에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이벤트 클릭 시 알림창 띄우기
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    alert(`출근 시간: ${event.start.toLocaleTimeString()}
퇴근 시간: ${event.extendedProps.checkOutTime}
총 근무 시간: ${event.extendedProps.workingHours} 시간`);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div style={{ whiteSpace: 'pre-line' }}>
        {`[출근] : ${eventInfo.event.start.toLocaleTimeString()}\n [퇴근] : ${eventInfo.event.extendedProps.checkOutTime}\n [근무시간] : ${eventInfo.event.extendedProps.workingHours} hr`}
      </div>
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box m="20px">
      <Header title="마이페이지" subtitle="My Page" />
      <Box component={Paper} p={3} mt={2} elevation={3} sx={{ backgroundColor: colors.gray[350] }}>
        <Grid container spacing={2} justifyContent="center">
          {/* 프로필 사진 및 이름 */}
          <Grid item xs={12} md={3} align="center">
            <Avatar
              alt={userInfo.name}
              src={userInfo.profilePicture || "/path-to-default-avatar.png"}
              sx={{ width: 120, height: 120 }}
            />
            <Typography variant="h5" mt={2}>
              {userInfo.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {userInfo.departmentName} | {userInfo.employeeRank}
            </Typography>

            {/* 버튼들 */}
            <Stack spacing={2} mt={3} direction="column">
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/my-info/edit")}
              >
                내 정보 수정
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/change-password")}
              >
                비밀번호 변경
              </Button>
            </Stack>
          </Grid>

          {/* 사용자 세부 정보 */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold">
                  연락 정보
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>이메일:</strong> {userInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>휴대폰 번호:</strong> {userInfo.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>내선 번호:</strong> {userInfo.extensionNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>비상 연락처:</strong> {userInfo.emergencyNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" mt={2}>
                  추가 정보
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>주소:</strong> {userInfo.address || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>차량 번호:</strong> {userInfo.vehicleNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>입사일:</strong> {new Date(userInfo.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* 출근/퇴근 버튼 */}
        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="success"
            onClick={checkIn}
            sx={{ width: "200px" }}
            disabled={isLoading}
          >
            출근
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={checkOut}
            sx={{ width: "200px" }}
            disabled={isLoading}
          >
            퇴근
          </Button>
        </Box>
      </Box>

      {/* 근태 기록 및 통계 탭 */}
      <Box mt={10}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { backgroundColor: colors.blueAccent[500] },
          }}
          sx={{
            '& .MuiTab-root': { color: colors.gray[200] },
            '& .Mui-selected': { color: colors.blueAccent[500] },
          }}
        >
          <Tab label="근무 기록" />
          <Tab label="근무 통계" />
        </Tabs>

        {/* 탭 패널 적용 */}
        <TabPanel value={tabValue} index={0}>
          <Box
            component={Paper}
            p={3}
            elevation={3}
            sx={{ backgroundColor: colors.gray[350] }}
          >
            <FullCalendar
              height="75vh"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              initialView="dayGridMonth"
              events={attendanceEvents}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {userInfo.employeeId ? (
            <AttendanceStatistics
              employeeId={userInfo.employeeId}
              year={new Date().getFullYear()}
            />
          ) : (
            <Typography>데이터를 불러오는 중입니다...</Typography>
          )}
        </TabPanel>
      </Box>

      {/* Snackbar for Error Messages */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
      >
        <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Mypage;

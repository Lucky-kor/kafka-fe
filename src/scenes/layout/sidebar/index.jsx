import React, { useContext, useEffect, useState } from "react";
import { Avatar, Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import {
  BarChartOutlined,
  CalendarTodayOutlined,
  ChatBubbleOutline,
  ContactsOutlined,
  DashboardOutlined,
  DonutLargeOutlined,
  HelpOutlineOutlined,
  MapOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  ReceiptOutlined,
  TimelineOutlined,
  WavesOutlined,
  MailOutline as MailOutlineIcon,
  Logout as LogoutIcon,
  Description,
} from "@mui/icons-material";
import Item from "./Item";
import { ToggledContext } from "../../../App";
import axios from "axios";
import defaultAvatar from "../../../assets/images/avatar.png"; // 기본 이미지 경로

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState({
    name: "",
    departmentName: "",
    employeeRank: "",
    profilePicture: "",  // 프로필 사진 추가
    email: "", // 이메일 추가
  });

  const [avatar, setAvatar] = useState(defaultAvatar);  // 기본 이미지

  // API 호출하여 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8081/auth/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const { name, departmentName, employeeRank, profilePicture, email } = response.data.data;
        setUserInfo({ name, departmentName, employeeRank, profilePicture, email });

        // 프로필 사진이 있으면 설정, 없으면 기본 이미지 사용
        if (profilePicture) {
          setAvatar(profilePicture);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // isAdmin 체크 시 userInfo.email이 존재할 때만
  const isAdmin = userInfo.email === "admin@pingpong-works.com";

  const handleLogout = async () => {
    try {
      await axios.patch(
        "http://localhost:8081/auth/employees/update-status",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getStyles = (mode) => ({
    menuButton: {
      backgroundColor: mode === "dark" ? colors.primary[400] : '#edf9ff',
      color: mode === "dark" ? colors.gray[100] : colors.gray[900],
      "&:hover": {
        backgroundColor: mode === "dark" ? "#0c2a40" : "#dbe8f2",
        color: mode === "dark" ? "#86ccff" : colors.primary[200],
      },
    },
    menuLabel: {
      color: mode === "dark" ? colors.gray[300] : colors.gray[600],
      "&:hover": {
        backgroundColor: mode === "dark" ? colors.primary[500] : colors.primary[200],
        color: mode === "dark" ? colors.blueAccent[400] : colors.blueAccent[600],
      },
    },
  });

  const styles = getStyles(theme.palette.mode);

  return (
    <Sidebar
      backgroundColor={theme.palette.mode === "dark" ? colors.primary[400] : "#edf9ff"}
      rootStyles={{
        border: 0,
        height: "100%",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: {
            ...styles.menuButton,
          },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                alignItems="center"
                gap="12px"
                sx={{ transition: ".3s ease" }}
              >
                <img
                  style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                  src="https://img.icons8.com/3d-fluency/94/ping-pong.png"
                  alt="PingPong"
                />
                <Typography
                  component="a"
                  href="/dashboard"
                  variant="h4"
                  fontWeight="bold"
                  textTransform="capitalize"
                  color={colors.blueAccent[450]}
                  style={{ textDecoration: 'none' }}
                >
                  PingPong
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>
      {!collapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            mb: "25px",
          }}
        >
          <Avatar
            alt="avatar"
            src={avatar}  // 프로필 사진 또는 기본 이미지
            sx={{ width: "100px", height: "100px" }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color={colors.gray[100]}>
              {userInfo.name}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="500"
              color={colors.blueAccent[450]}
            >
              {userInfo.departmentName} | {userInfo.employeeRank}
            </Typography>
            <IconButton onClick={handleLogout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      <Box pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <Item title="MainPage" path="/" icon={<DashboardOutlined />} />
        </Menu>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Communication" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <SubMenu
            title="메일"
            label="메일"
            icon={<MailOutlineIcon />}
            rootStyles={{
              ...styles.menuButton,
            }}
          >
            <Item
              title="메일 작성"
              path="/new"
              colors={colors}
              icon={<PersonOutlined />}
            />
            <Item
              title="전체 메일함"
              path="/mailbox/-1"
              colors={colors}
              icon={<BarChartOutlined />}
            />
            <Item
              title="받은 메일함"
              path="/mailbox/0"
              colors={colors}
              icon={<DonutLargeOutlined />}
            />
            <Item
              title="보낸 메일함"
              path="/mailbox/1"
              colors={colors}
              icon={<TimelineOutlined />}
            />
            <Item
              title="내게 쓴 메일함"
              path="/mailbox/3"
              colors={colors}
              icon={<WavesOutlined />}
            />
            <Item
              title="휴지통"
              path="/mailbox/2"
              colors={colors}
              icon={<MapOutlined />}
            />
          </SubMenu>
          <Item title="메신저" path="/chat" icon={<ChatBubbleOutline />} />
        </Menu>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Pages" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <Item title="전자결재" path="/elec" icon={<ContactsOutlined />} />
          <Item title="캘린더" path="/calendar" icon={<CalendarTodayOutlined />} />
          <Item title="게시판" path="/boards" icon={<ReceiptOutlined />} />
          <Item title="문의사항" path="/faq" icon={<HelpOutlineOutlined />} />
        </Menu>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Resource" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <Item title="주소록" path="/team" icon={<PeopleAltOutlined />} />
          {userInfo.email && isAdmin && ( // email이 있을 때만 렌더링
            <Item title="계정 생성" path="/signup" icon={<PersonOutlined />} />
          )}
          {userInfo.email && isAdmin && ( // email이 있을 때만 렌더링
            <Item title="결재 문서 관리" path="/document" icon={<Description />} />
          )}
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;

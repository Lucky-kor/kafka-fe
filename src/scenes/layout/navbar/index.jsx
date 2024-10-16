import { useNavigate } from "react-router-dom"; 
import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { tokens, ColorModeContext } from "../../../theme";
import { useContext, useState } from "react";
import {
  DarkModeOutlined,
  LightModeOutlined,
  MenuOutlined,
  NotificationsOutlined,
  PersonOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import { ToggledContext } from "../../../App";
import Notification from "../../notification/notification";

const Navbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { toggled, setToggled } = useContext(ToggledContext);
  const isMdDevices = useMediaQuery("(max-width:768px)");
  const navigate = useNavigate(); 

  // 알림 패널 열기/닫기
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);

  // 알림 패널 열기/닫기 핸들러
  const toggleNotificationPanel = () => {
    setNotificationPanelOpen(!isNotificationPanelOpen);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          sx={{ display: `${isMdDevices ? "flex" : "none"}` }}
          onClick={() => setToggled(!toggled)}
        >
          <MenuOutlined />
        </IconButton>
      </Box>

      <Box>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <LightModeOutlined />
          ) : (
            <DarkModeOutlined />
          )}
        </IconButton>
        <IconButton onClick={toggleNotificationPanel}>
          <NotificationsOutlined />
        </IconButton>
        <IconButton>
          <SettingsOutlined />
        </IconButton>
        {/* PersonOutlined 클릭 시 mypage로 이동 */}
        <IconButton onClick={() => navigate('/mypage')}>
          <PersonOutlined />
        </IconButton>
      </Box>

      {/* 알림 패널 컴포넌트 렌더링 */}
      {isNotificationPanelOpen && (
        <Notification onClose={toggleNotificationPanel} />
      )}
    </Box>
  );
};

export default Navbar;

import { Box, Button, IconButton, useTheme } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const blue = "#065ed1";
const blueHover = "#054ba0";
const buttonHeight = 40; // consistent height for all buttons

export default function HeaderActions({
  onThemeToggle,
  onLogout,
  onProfile,
  onDeposit,
  onTransfer,
}) {
  const theme = useTheme();
  const iconColor = theme.palette.mode === "dark" ? "#181a20" : "#fff";
  const buttonBg = blue;
  const buttonBgHover = blueHover;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Button
        variant="contained"
        onClick={onDeposit}
        sx={{
          borderRadius: 999,
          px: 2,
          fontWeight: 600,
          fontSize: "0.95rem",
          backgroundColor: buttonBg,
          "&:hover": { backgroundColor: buttonBgHover },
          height: buttonHeight,
          minWidth: 90,
        }}
      >
        Deposit
      </Button>
      <Button
        variant="contained"
        onClick={onTransfer}
        sx={{
          borderRadius: 999,
          px: 2,
          fontWeight: 600,
          fontSize: "0.95rem",
          backgroundColor: buttonBg,
          "&:hover": { backgroundColor: buttonBgHover },
          height: buttonHeight,
          minWidth: 90,
        }}
      >
        Transfer
      </Button>
      <IconButton sx={{ mx: 0.5, backgroundColor: buttonBg, "&:hover": { backgroundColor: buttonBgHover }, height: buttonHeight, width: buttonHeight }}>
        <NotificationsIcon sx={{ color: iconColor }} />
      </IconButton>
      <IconButton sx={{ mx: 0.5, backgroundColor: buttonBg, "&:hover": { backgroundColor: buttonBgHover }, height: buttonHeight, width: buttonHeight }}>
        <HelpOutlineIcon sx={{ color: iconColor }} />
      </IconButton>
      <IconButton onClick={onThemeToggle} sx={{ mx: 0.5, backgroundColor: buttonBg, "&:hover": { backgroundColor: buttonBgHover }, height: buttonHeight, width: buttonHeight }}>
        <Brightness4Icon sx={{ color: iconColor }} />
      </IconButton>
      <IconButton onClick={onProfile} sx={{ mx: 0.5, backgroundColor: buttonBg, "&:hover": { backgroundColor: buttonBgHover }, height: buttonHeight, width: buttonHeight }}>
        <AccountCircleIcon sx={{ color: iconColor }} />
      </IconButton>
      <IconButton onClick={onLogout} sx={{ mx: 0.5, backgroundColor: buttonBg, "&:hover": { backgroundColor: buttonBgHover }, height: buttonHeight, width: buttonHeight }}>
        <LogoutIcon sx={{ color: iconColor }} />
      </IconButton>
    </Box>
  );
}
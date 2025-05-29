import React from "react";
import { NavLink } from "react-router-dom";
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, useTheme } from "@mui/material";
import PieChartIcon from "@mui/icons-material/PieChart"; // Dashboard icon
import ListAltIcon from "@mui/icons-material/ListAlt"; // Market
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // History

const blue = "#065ed1";
const blueHover = "#054ba0";
const darkHover = "#0a1a3a";
const lightHover = "#f0f4fa";

function NavBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navBg = isDark ? "#181a20" : "#fff";
  const borderColor = isDark ? "#404153" : "#e0e0e0";
  const buttonHover = isDark ? darkHover : lightHover;

  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <PieChartIcon sx={{ fontSize: 28, mb: 0.5 }} />,
    },
    {
      to: "/market",
      label: "Market",
      icon: <ListAltIcon sx={{ fontSize: 28, mb: 0.5 }} />,
    },
    {
      to: "/history",
      label: "History",
      icon: <ReceiptLongIcon sx={{ fontSize: 28, mb: 0.5 }} />,
    },
  ];

  // square button to fit "Dashboard"
  const buttonSize = 120;

  return (
    <Box
      sx={{
        height: "100vh",
        background: navBg,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRight: `1.5px solid ${borderColor}`,
        minWidth: 220,
      }}
    >
      {/* CV Logo */}
      <Box sx={{ py: 4, width: "100%", textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: 2,
            color: blue,
            fontSize: "3rem",
            lineHeight: 1,
          }}
        >
          CV
        </Typography>
      </Box>
      {/* Navigation Links */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          mt: 6,
        }}
      >
        <List>
          {navLinks.map((link, idx) => (
            <ListItem
              key={link.label}
              disablePadding
              sx={{
                justifyContent: "center",
                mb: idx !== navLinks.length - 1 ? 4 : 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: buttonSize,
                  height: buttonSize,
                }}
              >
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 3,
                    width: buttonSize,
                    height: buttonSize,
                    background: navBg,
                    color: blue,
                    minWidth: 0,
                    minHeight: 0,
                    transition: "background 0.2s, color 0.2s",
                    p: 0,
                    "&.active": {
                      color: "#fff",
                      background: navBg,
                    },
                    "&:hover": {
                      background: buttonHover,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {link.icon}
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: 700,
                          fontSize: "1rem",
                          textAlign: "center",
                          color: "inherit",
                          lineHeight: 1.2,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>
                </ListItemButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default NavBar;
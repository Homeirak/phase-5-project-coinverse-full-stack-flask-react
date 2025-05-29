import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import Deposit from "./pages/Deposit";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider, UserContext } from "./context/UserContext";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { useContext } from "react";
import Header from "./components/Header";
import Withdraw from "./pages/Withdraw";
import { DataProvider } from "./context/DataContext";

const NAVBAR_WIDTH = 220;
const HEADER_HEIGHT = 56;

function AppContent() {
  const { theme, toggleTheme, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const muiTheme = createTheme({
    palette: {
      mode: theme, 
      ...(theme === "dark"
        ? {
            background: { default: "#181a20", paper: "#23272f" },
            text: { primary: "#fff" },
          }
        : {
            background: { default: "#f5f6fa", paper: "#fff" },
            text: { primary: "#181a20" },
          }),
    },
  });

  // Helper to get the header title based on route
  const getHeaderTitle = (pathname) => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/market") return ""; // No title for Market
    if (pathname === "/deposit") return "Deposit";
    if (pathname === "/history") return "History";
    if (pathname === "/profile") return "Profile";
    return "";
  };

  const headerTitle = getHeaderTitle(location.pathname);

  // Handler functions for header actions
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleDeposit = () => {
    navigate("/deposit");
  };

  const handleTransfer = () => {
    navigate("/withdraw"); // Make sure you add a Withdraw route/component!
  };

  const hideNavAndHeader = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {/* Layout container */}
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Only show NavBar if not on login/signup */}
        {!hideNavAndHeader && (
          <Box
            sx={{
              width: NAVBAR_WIDTH,
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              zIndex: 1300, // above content, below header
            }}
          >
            <NavBar />
          </Box>
        )}
        {/* Main area (header + content) */}
        <Box
          sx={{
            flex: 1,
            marginLeft: !hideNavAndHeader ? `${NAVBAR_WIDTH}px` : 0,
            minHeight: "100vh",
            background: "var(--background-color)",
          }}
        >
          {/* Only show Header if not on login/signup */}
          {!hideNavAndHeader && (
            <Header
              title={headerTitle}
              sx={{
                position: "fixed",
                left: `${NAVBAR_WIDTH}px`,
                width: `calc(100% - ${NAVBAR_WIDTH}px)`,
                top: 0,
                zIndex: 1201,
              }}
              onLogout={handleLogout}
              onThemeToggle={handleThemeToggle}
              onProfile={handleProfile}
              onDeposit={handleDeposit}
              onTransfer={handleTransfer}
            />
          )}
          {/* Main content area, below header */}
          <Box sx={{ pt: !hideNavAndHeader ? `${HEADER_HEIGHT}px` : 0, px: 4 }}>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/market"
                element={
                  <ProtectedRoute>
                    <Market />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deposit"
                element={
                  <ProtectedRoute>
                    <Deposit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/withdraw"
                element={
                  <ProtectedRoute>
                    <Withdraw />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </UserProvider>
    </Router>
  );
}

export default App;

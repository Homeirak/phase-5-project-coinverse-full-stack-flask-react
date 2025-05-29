import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

function Login() {
  const { login, loading } = useContext(UserContext);
  const [form, setForm] = useState({ user_name: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form);
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <Paper elevation={4} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" mb={2} align="center">
          Login to Coinverse
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="user_name"
            value={form.user_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            autoFocus
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </form>
        <Button
          onClick={() => navigate("/signup")}
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Don't have an account? Sign up
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

function Profile() {
  const { user, setUser, theme: appTheme } = useContext(UserContext);
  const muiTheme = useTheme();
  const isDark = (appTheme || muiTheme.palette.mode) === "dark";

  const [editField, setEditField] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [usdBalance, setUsdBalance] = useState(0);
  const [message, setMessage] = useState("");

  // Fetch latest profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setBillingAddress(data.billing_address || "");
        setPaymentInfo(data.payment_info || "");
        setUsdBalance(data.usd_balance || 0);
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // Update fields when user context changes (e.g. after PATCH)
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setBillingAddress(user?.billing_address || "");
    setPaymentInfo(user?.payment_info || "");
    setUsdBalance(user?.usd_balance || 0);
  }, [user]);

  const handleUpdate = async (field) => {
    let payload = {};
    if (field === "name") payload.name = name;
    if (field === "email") {
      if (!email.match(/^[\w\.-]+@[\w\.-]+\.\w+$/)) {
        setMessage("Please enter a valid email address.");
        return;
      }
      payload.email = email;
    }
    if (field === "billing_address") payload.billing_address = billingAddress;
    if (field === "payment_info") payload.payment_info = paymentInfo;

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setMessage("Profile updated.");
        setEditField(null);
      } else {
        setMessage(data.error || "Update failed.");
      }
    } catch {
      setMessage("Update failed.");
    }
  };

  const handleDelete = async (field) => {
    let payload = {};
    if (field === "billing_address") payload.billing_address = "";
    if (field === "payment_info") payload.payment_info = "";
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setMessage("Deleted.");
        if (field === "billing_address") setBillingAddress("");
        if (field === "payment_info") setPaymentInfo("");
        setEditField(null);
      } else {
        setMessage(data.error || "Delete failed.");
      }
    } catch {
      setMessage("Delete failed.");
    }
  };

  // Colors for dark/light mode
  const pageBg = isDark ? "#181b23" : "#f5f6fa";
  const boxBg = isDark ? "#23272f" : "#fff";
  const labelColor = isDark ? "#aaa" : "#444";
  const valueColor = isDark ? "#fff" : "#222";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        bgcolor: pageBg,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        py: 6,
      }}
    >
      <Paper
        sx={{
          bgcolor: boxBg,
          width: "90vw",
          maxWidth: 900,
          minHeight: 500,
          p: 5,
          borderRadius: 4,
          boxShadow: 4,
          ml: 8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, color: valueColor }}>
          Profile
        </Typography>

        {/* Name */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: labelColor }}>Name:</Typography>
            {editField === "name" ? (
              <TextField
                size="small"
                value={name}
                onChange={e => setName(e.target.value)}
                sx={{ mt: 0.5, bgcolor: isDark ? "#222" : "#f5f6fa", input: { color: valueColor }, width: "90%" }}
              />
            ) : (
              <Typography sx={{ fontWeight: 500, color: valueColor, mt: 0.5 }}>
                {name || "-"}
              </Typography>
            )}
          </Box>
          {editField === "name" ? (
            <>
              <IconButton color="success" onClick={() => handleUpdate("name")}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => { setEditField(null); setName(user.name || ""); }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setEditField("name")}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {/* Username */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: labelColor }}>Username:</Typography>
            <Typography sx={{ fontWeight: 500, color: valueColor, mt: 0.5 }}>
              {user?.user_name}
            </Typography>
          </Box>
        </Box>

        {/* Email */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: labelColor }}>Email:</Typography>
            {editField === "email" ? (
              <TextField
                size="small"
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mt: 0.5, bgcolor: isDark ? "#222" : "#f5f6fa", input: { color: valueColor }, width: "90%" }}
              />
            ) : (
              <Typography sx={{ fontWeight: 500, color: valueColor, mt: 0.5 }}>
                {email}
              </Typography>
            )}
          </Box>
          {editField === "email" ? (
            <>
              <IconButton color="success" onClick={() => handleUpdate("email")}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => { setEditField(null); setEmail(user.email || ""); }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setEditField("email")}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {/* USD Balance */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: labelColor }}>USD Balance:</Typography>
            <Typography sx={{ fontWeight: 500, color: valueColor, mt: 0.5 }}>
              ${user?.usd_balance_formatted || "0.00"}
            </Typography>
          </Box>
        </Box>

        {/* Billing Address */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: labelColor }}>Billing Address:</Typography>
            {editField === "billing_address" ? (
              <TextField
                size="small"
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
                sx={{ mt: 0.5, bgcolor: isDark ? "#222" : "#f5f6fa", input: { color: valueColor }, width: "90%" }}
              />
            ) : (
              <Typography sx={{ fontWeight: 500, color: valueColor, mt: 0.5 }}>
                {billingAddress || "-"}
              </Typography>
            )}
          </Box>
          {editField === "billing_address" ? (
            <>
              <IconButton color="success" onClick={() => handleUpdate("billing_address")}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => { setEditField(null); setBillingAddress(user.billing_address || ""); }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton onClick={() => setEditField("billing_address")}>
                <EditIcon />
              </IconButton>
              {billingAddress && (
                <IconButton color="error" onClick={() => handleDelete("billing_address")}>
                  <DeleteIcon />
                </IconButton>
              )}
            </>
          )}
        </Box>

        {/* Payment Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: labelColor }}>Payment Info:</Typography>
            {editField === "payment_info" ? (
              <TextField
                size="small"
                value={paymentInfo}
                onChange={e => setPaymentInfo(e.target.value)}
                sx={{ mt: 0.5, bgcolor: isDark ? "#222" : "#f5f6fa", input: { color: valueColor }, width: "90%" }}
              />
            ) : (
              <Typography sx={{ fontWeight: 500, color: valueColor, mt: 0.5 }}>
                {paymentInfo || "-"}
              </Typography>
            )}
          </Box>
          {editField === "payment_info" ? (
            <>
              <IconButton color="success" onClick={() => handleUpdate("payment_info")}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => { setEditField(null); setPaymentInfo(user.payment_info || ""); }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton onClick={() => setEditField("payment_info")}>
                <EditIcon />
              </IconButton>
              {paymentInfo && (
                <IconButton color="error" onClick={() => handleDelete("payment_info")}>
                  <DeleteIcon />
                </IconButton>
              )}
            </>
          )}
        </Box>

        {message && (
          <Typography sx={{ mt: 3, color: "#f44336", fontWeight: 500 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default Profile;
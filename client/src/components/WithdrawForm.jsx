import React, { useState } from "react";
import { Box, TextField, Button, Alert } from "@mui/material";

function WithdrawForm() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        const formattedBalance = Number(data.usd_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setStatus({ type: "success", message: `Withdrawal successful! New balance: $${formattedBalance}` });
        setAmount("");
      } else {
        setStatus({ type: "error", message: data.error || "Withdrawal failed." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error." });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mt: 4 }}>
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        fullWidth
        required
        inputProps={{ min: 0.01, step: 0.01 }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Withdraw
      </Button>
      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>
          {status.message}
        </Alert>
      )}
    </Box>
  );
}

export default WithdrawForm;
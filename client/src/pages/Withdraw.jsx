import React from "react";
import { Box, Typography } from "@mui/material";
import WithdrawForm from "../components/WithdrawForm";

function Withdraw() {
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Withdraw Funds
      </Typography>
        <WithdrawForm />
    </Box>
  );
}

export default Withdraw;
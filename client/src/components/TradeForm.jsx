import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  MenuItem,
  Paper,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { DataContext } from "../context/DataContext";
import { UserContext } from "../context/UserContext";

const ORDER_TYPES = ["Limit", "Market", "Stop-Limit"];
const TIME_IN_FORCE = [
  { value: "gtc", label: "Good til cancelled" },
  { value: "gtt", label: "Good til time" },
  { value: "ioc", label: "Immediate or cancel" },
];

export default function TradeForm({ coin }) {
  const { coins = [] } = useContext(DataContext);
  const { user } = useContext(UserContext);
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("Limit");
  const [amountType, setAmountType] = useState("crypto"); // "crypto" or "usd"
  const [limitPrice, setLimitPrice] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [marketAmount, setMarketAmount] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [stopLimitPrice, setStopLimitPrice] = useState("");
  const [stopAmount, setStopAmount] = useState("");
  const [timeInForce, setTimeInForce] = useState("gtc");
  const [usdBalance, setUsdBalance] = useState(1000); // Replace with real user balance
  const [cryptoBalance, setCryptoBalance] = useState(0); // Replace with real holding

  // Find coin info from DataContext if not passed as prop
  const coinData = coin || coins[0] || {};

  // Reset amount fields when order type changes
  React.useEffect(() => {
    setLimitAmount("");
    setMarketAmount("");
    setStopPrice("");
    setStopLimitPrice("");
    setStopAmount("");
  }, [orderType]);

  // Limit order calculations
  const limitOrderPrice = parseFloat(limitPrice) || 0;
  const limitOrderQty =
    amountType === "crypto"
      ? parseFloat(limitAmount) || 0
      : (parseFloat(limitAmount) || 0) / limitOrderPrice || 0;
  const limitSubtotal = limitOrderPrice * limitOrderQty || 0;
  const limitFee = limitSubtotal * 0.004;
  const limitTotal = side === "buy" ? limitSubtotal + limitFee : limitSubtotal - limitFee;

  // Market order calculations
  const marketPrice = coinData.current_price || 0;
  const marketQty =
    amountType === "crypto"
      ? parseFloat(marketAmount) || 0
      : (parseFloat(marketAmount) || 0) / marketPrice || 0;
  const marketSubtotal = marketPrice * marketQty || 0;
  const marketFee = marketSubtotal * 0.004;
  const marketTotal = side === "buy" ? marketSubtotal + marketFee : marketSubtotal - marketFee;

  // Stop-limit order calculations
  const stopLimitOrderPrice = parseFloat(stopLimitPrice) || 0;
  const stopOrderQty =
    amountType === "crypto"
      ? parseFloat(stopAmount) || 0
      : (parseFloat(stopAmount) || 0) / stopLimitOrderPrice || 0;
  const stopSubtotal = stopLimitOrderPrice * stopOrderQty || 0;
  const stopFee = stopSubtotal * 0.004;
  const stopTotal = side === "buy" ? stopSubtotal + stopFee : stopSubtotal - stopFee;

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here (POST to /api/market/trade/...)
    // Reset form or show confirmation as needed
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", boxShadow: 2 }}>
      {/* Balances */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
          Available to trade
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography>{coinData?.symbol?.toUpperCase() || "--"}</Typography>
          <Typography>{cryptoBalance}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography>USD</Typography>
          <Typography>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
        </Box>
        <Typography sx={{ mb: 1 }}>
          USD Balance: <b>${user?.usd_balance_formatted || "0.00"}</b>
        </Typography>
      </Box>

      {/* Buy/Sell Tabs */}
      <Tabs
        value={side}
        onChange={(_, v) => setSide(v)}
        sx={{ mb: 2 }}
        TabIndicatorProps={{ style: { display: "none" } }}
      >
        <Tab
          label="Buy"
          value="buy"
          sx={{
            color: side === "buy" ? "#4caf50" : "#888",
            fontWeight: 700,
            minWidth: 80,
          }}
        />
        <Tab
          label="Sell"
          value="sell"
          sx={{
            color: side === "sell" ? "#f44336" : "#888",
            fontWeight: 700,
            minWidth: 80,
          }}
        />
      </Tabs>

      {/* Order Type Tabs */}
      <ToggleButtonGroup
        value={orderType}
        exclusive
        onChange={(_, v) => v && setOrderType(v)}
        sx={{ mb: 2, width: "100%" }}
      >
        {ORDER_TYPES.map((type) => (
          <ToggleButton key={type} value={type} sx={{ flex: 1, fontWeight: 700 }}>
            {type}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Limit Order Fields */}
      {orderType === "Limit" && (
        <>
          <TextField
            label="Limit price"
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
          />
          <ToggleButtonGroup
            value={amountType}
            exclusive
            onChange={(_, v) => v && setAmountType(v)}
            sx={{ mb: 1, width: "100%" }}
          >
            <ToggleButton value="crypto" sx={{ flex: 1 }}>
              Amount ({coinData?.symbol?.toUpperCase()})
            </ToggleButton>
            <ToggleButton value="usd" sx={{ flex: 1 }}>
              USD
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label={amountType === "crypto" ? "Amount" : "USD"}
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {amountType === "crypto" ? coinData?.symbol?.toUpperCase() : "USD"}
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Time in force"
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {TIME_IN_FORCE.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {/* Subtotal, Fee, Total */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Subtotal:</Typography>
              <Typography>
                ${limitSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Fee (0.4%):</Typography>
              <Typography>
                ${limitFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, mt: 1 }}>
              <Typography>Total:</Typography>
              <Typography>
                ${limitTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Market Order Fields */}
      {orderType === "Market" && (
        <>
          <ToggleButtonGroup
            value={amountType}
            exclusive
            onChange={(_, v) => v && setAmountType(v)}
            sx={{ mb: 1, width: "100%" }}
          >
            <ToggleButton value="crypto" sx={{ flex: 1 }}>
              Amount ({coinData?.symbol?.toUpperCase()})
            </ToggleButton>
            <ToggleButton value="usd" sx={{ flex: 1 }}>
              USD
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label={amountType === "crypto" ? "Amount" : "USD"}
            type="number"
            value={marketAmount}
            onChange={(e) => setMarketAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {amountType === "crypto" ? coinData?.symbol?.toUpperCase() : "USD"}
                </InputAdornment>
              ),
            }}
          />
          {/* Subtotal, Fee, Total */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Market price:</Typography>
              <Typography>
                ${marketPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Subtotal:</Typography>
              <Typography>
                ${marketSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Fee (0.4%):</Typography>
              <Typography>
                ${marketFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, mt: 1 }}>
              <Typography>Total:</Typography>
              <Typography>
                ${marketTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Stop-Limit Order Fields */}
      {orderType === "Stop-Limit" && (
        <>
          <TextField
            label="Stop price"
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
          />
          <TextField
            label="Limit price"
            type="number"
            value={stopLimitPrice}
            onChange={(e) => setStopLimitPrice(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
          />
          <ToggleButtonGroup
            value={amountType}
            exclusive
            onChange={(_, v) => v && setAmountType(v)}
            sx={{ mb: 1, width: "100%" }}
          >
            <ToggleButton value="crypto" sx={{ flex: 1 }}>
              Amount ({coinData?.symbol?.toUpperCase()})
            </ToggleButton>
            <ToggleButton value="usd" sx={{ flex: 1 }}>
              USD
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label={amountType === "crypto" ? "Amount" : "USD"}
            type="number"
            value={stopAmount}
            onChange={(e) => setStopAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {amountType === "crypto" ? coinData?.symbol?.toUpperCase() : "USD"}
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Time in force"
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {TIME_IN_FORCE.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {/* Subtotal, Fee, Total */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Subtotal:</Typography>
              <Typography>
                ${stopSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Fee (0.4%):</Typography>
              <Typography>
                ${stopFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, mt: 1 }}>
              <Typography>Total:</Typography>
              <Typography>
                ${stopTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Submit Button */}
      <Button
        variant="contained"
        color={side === "buy" ? "success" : "error"}
        fullWidth
        size="large"
        sx={{
          borderRadius: 999,
          fontWeight: 700,
          fontSize: "1.1rem",
          py: 1.2,
          mt: 1,
        }}
        onClick={handleSubmit}
        disabled={
          (orderType === "Limit" && (!limitAmount || !limitPrice)) ||
          (orderType === "Market" && !marketAmount) ||
          (orderType === "Stop-Limit" && (!stopPrice || !stopLimitPrice || !stopAmount))
        }
      >
        {side === "buy"
          ? `Buy ${coinData?.symbol?.toUpperCase() || ""}`
          : `Sell ${coinData?.symbol?.toUpperCase() || ""}`}
      </Button>
      <Typography sx={{ mt: 2, color: "#888", fontSize: "0.85rem", textAlign: "center" }}>
        Crypto markets are unique. Order fills cannot be reversed.
      </Typography>
    </Paper>
  );
}
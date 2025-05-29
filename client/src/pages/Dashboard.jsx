// Dashboard.jsx
import React, { useEffect, useState } from "react";
import PortfolioValueChart from "../components/PortfolioValueChart";
import { Box, Typography, ButtonGroup, Button, IconButton } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Divider from "@mui/material/Divider";

const TIMEFRAMES = [
  { label: "1H", value: 60 },
  { label: "1D", value: 60 * 24 },
  { label: "1W", value: 60 * 24 * 7 },
  { label: "1M", value: 60 * 24 * 30 },
  { label: "1Y", value: 60 * 24 * 365 },
  { label: "ALL", value: "ALL" },
];

// Use the same blue as NavBar links/icons
const tableBlueLineStyle = { height: 2, background: "#065ed1", border: "none", margin: 0, padding: 0 };

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to load dashboard.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDashboardData(data);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!dashboardData) return <div>Error loading dashboard.</div>;

  // calculate change and color/arrow
  const change = dashboardData.change;
  const changeAmount = dashboardData.change_amount;
  const isPositive = change > 0;
  const isNegative = change < 0;

  // Theme-aware table/text color
  const tableHeaderStyle = { color: "#aaa", fontWeight: 600, fontSize: "1rem", textAlign: "left" };
  const tableCellStyle = { color: "#fff", fontWeight: 400, fontSize: "1rem", textAlign: "left" };

  return (
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", px: 2, py: 4 }}>
      {/* Portfolio Value Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          mt: 6, // <-- Add margin top here to move the row down
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mr: 2 }}>
            Total Portfolio Value:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 400, mr: 2 }}>
            ${Number(dashboardData.total_portfolio_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          {isPositive && (
            <Box sx={{ display: "flex", alignItems: "center", color: "#4caf50", fontWeight: 700, ml: 1 }}>
              <ArrowDropUpIcon sx={{ color: "#4caf50" }} />
              +${Math.abs(changeAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Box>
          )}
          {isNegative && (
            <Box sx={{ display: "flex", alignItems: "center", color: "#f44336", fontWeight: 700, ml: 1 }}>
              <ArrowDropDownIcon sx={{ color: "#f44336" }} />
              -${Math.abs(changeAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ButtonGroup
            variant="text"
            size="small"
            sx={{
              mr: 1,
              '& .MuiButtonGroup-grouped:not(:last-of-type)': {
                borderRight: 'none !important',
              },
              '& .MuiButtonGroup-grouped:not(:first-of-type)': {
                borderLeft: 'none !important',
              },
            }}
          >
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf.label}
                onClick={() => setTimeframe(tf.label)}
                sx={{
                  fontSize: "0.7rem !important",
                  color: timeframe === tf.label ? "#fff" : "#aaa",
                  fontWeight: timeframe === tf.label ? 700 : 400,
                  minWidth: 32,
                  px: 1.2,
                }}
              >
                {tf.label}
              </Button>
            ))}
          </ButtonGroup>
          <IconButton
            onClick={() => setExpanded((e) => !e)}
            color="primary"
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Portfolio Value Chart */}
      <PortfolioValueChart
        chartData={dashboardData.chart_data}
        expanded={expanded}
        timeframe={timeframe}
      />

      {/* Cash Balance */}
      <Box sx={{ mt: 4, width: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
          Cash Balance
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 500, color: "#fff" }}>
          ${dashboardData.cash_balance_formatted || "0.00"}
        </Typography>
      </Box>
      <Divider sx={{ my: 3, borderColor: "#404153" }} />

      {/* Holdings */}
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
          Holdings
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Symbol</th>
                <th style={tableHeaderStyle}>Quantity</th>
                <th style={tableHeaderStyle}>Price</th>
                <th style={tableHeaderStyle}>Market Value</th>
              </tr>
              <tr>
                <th colSpan={5} style={{ padding: 0 }}>
                  <div style={tableBlueLineStyle} />
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.holdings.map((h, idx) => (
                <tr key={idx}>
                  <td style={tableCellStyle}>{h.crypto_name}</td>
                  <td style={tableCellStyle}>{h.crypto_symbol}</td>
                  <td style={tableCellStyle}>{h.quantity}</td>
                  <td style={tableCellStyle}>
                    ${Number(h.live_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={tableCellStyle}>
                    ${Number(h.market_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
      <Divider sx={{ my: 3, borderColor: "#404153" }} />

      {/* Recent Trades */}
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
          Recent Trades
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Time</th>
                <th style={tableHeaderStyle}>Type</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Symbol</th>
                <th style={tableHeaderStyle}>Price</th>
                <th style={tableHeaderStyle}>Quantity</th>
              </tr>
              <tr>
                <th colSpan={6} style={{ padding: 0 }}>
                  <div style={tableBlueLineStyle} />
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.trades.map((t) => (
                <tr key={t.trade_id}>
                  <td style={tableCellStyle}>{new Date(t.timestamp).toLocaleString()}</td>
                  <td style={tableCellStyle}>{t.type}</td>
                  <td style={tableCellStyle}>{t.crypto_name}</td>
                  <td style={tableCellStyle}>{t.crypto_symbol}</td>
                  <td style={tableCellStyle}>${Number(t.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={tableCellStyle}>{t.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
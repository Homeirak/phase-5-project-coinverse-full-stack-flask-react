import React from "react";
import { Box, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MarketValueGraph({ chartData = [], expanded = false, timeframe = "1M" }) {
  // Format y-axis as currency
  const formatCurrency = (val) =>
    "$" + Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <Box
      sx={{
        height: expanded ? 400 : 220,
        p: 2,
        border: "1px solid #404153",
        borderRadius: 2,
        bgcolor: "background.paper",
        my: 2,
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
        Portfolio Value
      </Typography>
      {chartData.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
          No data to display.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={expanded ? 320 : 160}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              minTickGap={20}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              width={70}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ background: "#23272f", border: "none", color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4caf50"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, stroke: "#23272f", strokeWidth: 2, fill: "#4caf50" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
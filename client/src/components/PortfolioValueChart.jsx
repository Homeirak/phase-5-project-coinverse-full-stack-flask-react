// PortfolioValueChart.jsx
import React, { useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@mui/material";
import { UserContext } from "../context/UserContext";

const TIMEFRAMES = [
  { label: "1H", value: 60 },
  { label: "1D", value: 60 * 24 },
  { label: "1W", value: 60 * 24 * 7 },
  { label: "1M", value: 60 * 24 * 30 },
  { label: "1Y", value: 60 * 24 * 365 },
  { label: "ALL", value: "ALL" },
];

function formatXAxis(tickItem) {
  const date = new Date(tickItem);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PortfolioValueChart({ chartData = [], expanded = false, timeframe = "1D" }) {
  const { theme } = useContext(UserContext);

  // Normalize timestamps to milliseconds
  const normalizedData = chartData.map(d => ({
    ...d,
    timestamp: new Date(d.timestamp).getTime()
  }));

  // filter data based on selected timeframe
  const now = Date.now();
  let filteredData = normalizedData;
  if (timeframe !== "ALL") {
    const minutes = TIMEFRAMES.find((t) => t.label === timeframe)?.value || 60 * 24;
    const cutoff = now - minutes * 60 * 1000;
    filteredData = normalizedData.filter((d) => d.timestamp >= cutoff);
    if (filteredData.length === 0) filteredData = normalizedData;
  }

  return (
    <Box
      sx={{
        background: expanded ? "transparent" : "var(--background-color)",
        borderRadius: expanded ? 0 : 2,
        p: expanded ? 0 : 3,
        mb: 2,
        minHeight: expanded ? 400 : 140,
        width: "100%",
        transition: "min-height 0.3s, background 0.3s, padding 0.3s",
        position: "relative",
      }}
    >
      <ResponsiveContainer width="100%" height={expanded ? 320 : 100}>
        <LineChart data={filteredData}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#aaa"
            minTickGap={20}
          />
          <YAxis
            dataKey="portfolio_value"
            stroke="#aaa"
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : value
            }
            labelFormatter={(label) =>
              new Date(label).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            contentStyle={{
              background: theme === "dark" ? "#242424" : "#fff",
              border: "none",
              color: theme === "dark" ? "#fff" : "#000"
            }}
          />
          <Line
            type="monotone"
            dataKey="portfolio_value"
            stroke="#4fc3f7"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default PortfolioValueChart;
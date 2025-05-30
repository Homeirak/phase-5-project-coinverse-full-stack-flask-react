import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

const BLUE = "#1976d2";

function formatTimestamp(timestamp) {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("default", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function History() {
  const { user, theme } = useContext(UserContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.history || []);
      }
    }
    if (user) fetchOrders();
  }, [user]);

  return (
    <Box sx={{ bgcolor: theme === "dark" ? "#181a20" : "#fff", minHeight: "100vh", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ flex: 1, color: theme === "dark" ? "#fff" : "#222" }}>
          Order History
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ background: theme === "dark" ? "#23272f" : "#fafbfc" }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                borderBottom: `2px solid ${BLUE}`,
                "& th": { color: theme === "dark" ? "#fff" : "#222", fontWeight: 700 }
              }}
            >
              <TableCell>Time Placed</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Side</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, idx) => (
              <React.Fragment key={order.trade_id || idx}>
                <TableRow
                  sx={{
                    background: theme === "dark" ? "#23272f" : "#fff",
                    "& td": { py: 1.5 }
                  }}
                >
                  <TableCell>{formatTimestamp(order.timestamp)}</TableCell>
                  <TableCell>{order.crypto_symbol || "--"}</TableCell>
                  <TableCell>{order.order_type || "--"}</TableCell>
                  <TableCell>{order.action || "--"}</TableCell>
                  <TableCell>
                    {order.price !== undefined
                      ? Number(order.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      : "--"}
                  </TableCell>
                  <TableCell>
                    {order.quantity !== undefined
                      ? Number(order.quantity).toLocaleString(undefined, {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 8
                        })
                      : "--"}
                  </TableCell>
                  <TableCell>
                    {order.price !== undefined && order.quantity !== undefined
                      ? Number(order.price * order.quantity).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      : "--"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Box sx={{ borderBottom: "1px solid #404153", width: "100%" }} />
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default History;

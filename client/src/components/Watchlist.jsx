import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, IconButton, TextField, Button } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DataContext } from "../context/DataContext";

const formatPrice = (price) =>
  `$${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function WatchlistRow({
  coin,
  targetPrice,
  alertEnabled,
  onTargetPriceChange,
  onAlertToggle,
  onRemove,
  theme,
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(targetPrice || "");

  return (
    <Box sx={{ borderBottom: "1px solid #404153", py: 1.5, px: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {/* Top row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src={coin.image_url} alt={coin.symbol} style={{ width: 28, height: 28, borderRadius: "50%" }} />
          <Typography sx={{ fontWeight: 700 }}>{coin.symbol?.toUpperCase()}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 400 }}>
          {coin.current_price ? formatPrice(coin.current_price) : "--"}
        </Typography>
      </Box>
      {/* Target price and alert controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        {editing ? (
          <>
            <TextField
              size="small"
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              sx={{ width: 100 }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                onTargetPriceChange(coin.id, inputValue);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <IconButton size="small" onClick={() => setEditing(false)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <Typography sx={{ color: "#aaa", fontSize: 14 }}>
              Target: {targetPrice ? formatPrice(targetPrice) : "--"}
            </Typography>
            <IconButton size="small" onClick={() => setEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onRemove(coin.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
        <IconButton size="small" onClick={() => onAlertToggle(coin.id, !alertEnabled)}>
          {alertEnabled ? (
            <NotificationsNoneIcon sx={{ color: "#065ed1" }} />
          ) : (
            <NotificationsOffIcon sx={{ color: "#aaa" }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}

export default function Watchlist({ theme }) {
  const { coins } = useContext(DataContext);
  const [watchlist, setWatchlist] = useState([]);
  const [addSymbol, setAddSymbol] = useState("");

  // Fetch watchlist from backend
  useEffect(() => {
    fetch("/api/watchlist")
      .then(res => res.json())
      .then(data => setWatchlist(data.watchlist || []));
  }, []);

  // Add coin to watchlist
  const handleAdd = () => {
    const coin = coins.find(c => c.symbol?.toLowerCase() === addSymbol.toLowerCase());
    if (coin && !watchlist.some(w => w.crypto_id === coin.id)) {
      fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crypto_id: coin.id }),
      }).then(() => {
        setWatchlist(watchlist => [...watchlist, {
          crypto_id: coin.id,
          crypto_symbol: coin.symbol,
          target_price: "",
          alert_enabled: false
        }]);
        setAddSymbol("");
      });
    }
  };

  // Update target price
  const handleTargetPriceChange = (crypto_id, price) => {
    fetch(`/api/watchlist/${crypto_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_price: price }),
    }).then(() => {
      setWatchlist(watchlist =>
        watchlist.map(w =>
          w.crypto_id === crypto_id ? { ...w, target_price: price } : w
        )
      );
    });
  };

  // Toggle alert
  const handleAlertToggle = (crypto_id, enabled) => {
    fetch(`/api/watchlist/${crypto_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_enabled: enabled }),
    }).then(() => {
      setWatchlist(watchlist =>
        watchlist.map(w =>
          w.crypto_id === crypto_id ? { ...w, alert_enabled: enabled } : w
        )
      );
    });
  };

  // Remove from watchlist
  const handleRemove = (crypto_id) => {
    fetch(`/api/watchlist/${crypto_id}`, { method: "DELETE" }).then(() => {
      setWatchlist(watchlist => watchlist.filter(w => w.crypto_id !== crypto_id));
    });
  };

  return (
    <Box>
      {/* Add to watchlist form */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Symbol (e.g. BTC)"
          value={addSymbol}
          onChange={e => setAddSymbol(e.target.value)}
          sx={{ width: 120 }}
        />
        <IconButton onClick={handleAdd} color="primary">
          <AddIcon />
        </IconButton>
      </Box>
      {watchlist.map(watch => {
        const coin = coins.find(c => c.id === watch.crypto_id) || {};
        return (
          <WatchlistRow
            key={watch.crypto_id}
            coin={coin}
            targetPrice={watch.target_price}
            alertEnabled={watch.alert_enabled}
            onTargetPriceChange={handleTargetPriceChange}
            onAlertToggle={handleAlertToggle}
            onRemove={handleRemove}
            theme={theme}
          />
        );
      })}
    </Box>
  );
}
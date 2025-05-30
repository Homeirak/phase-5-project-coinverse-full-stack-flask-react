// Watchlist.jsx
import React, { useState, useContext, useMemo } from "react";
import { Box, Typography, IconButton, TextField, Button, InputAdornment } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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
  onSelectCoin,
  selected,
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(targetPrice || "");

  // Handler to clear the target price
  const handleClearTargetPrice = (e) => {
    e.stopPropagation();
    setInputValue("");
    onTargetPriceChange(coin.id, "");
    setEditing(false);
  };

  return (
    <Box
      sx={{
        borderBottom: "1px solid #404153",
        py: 1.5,
        px: 1,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        bgcolor: selected ? "rgba(64,65,83,0.25)" : "inherit",
        cursor: "pointer",
        "&:hover": { bgcolor: "rgba(64,65,83,0.15)" },
      }}
      onClick={() => onSelectCoin && onSelectCoin(coin)}
    >
      {/* Top row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src={coin.image_url} alt={coin.symbol} style={{ width: 28, height: 28, borderRadius: "50%" }} />
          <Typography sx={{ fontWeight: 700 }}>{coin.symbol?.toUpperCase()}</Typography>
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              onRemove(coin.id);
            }}
          >
            <StarIcon sx={{ color: "#fbc02d" }} />
          </IconButton>
        </Box>
        <Typography sx={{ fontWeight: 400 }}>
          {coin.current_price ? formatPrice(coin.current_price) : "--"}
        </Typography>
      </Box>
      {/* Bottom row: volume, arrow, percent change */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
        <Typography sx={{ color: "#888", fontSize: 13 }}>
          Vol: ${coin.total_volume ? Number(coin.total_volume).toLocaleString() : "--"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              color: coin.price_change_percentage_24h >= 0 ? "#4caf50" : "#f44336",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {coin.price_change_percentage_24h >= 0 ? "↗" : "↘"}{" "}
            {coin.price_change_percentage_24h
              ? `${coin.price_change_percentage_24h.toFixed(2)}%`
              : "--"}
          </Typography>
        </Box>
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
              onClick={e => e.stopPropagation()}
            />
            <Button
              size="small"
              variant="contained"
              onClick={e => {
                e.stopPropagation();
                onTargetPriceChange(coin.id, inputValue);
                setEditing(false);
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ color: "#aaa", fontSize: 14 }}>
              Target: {targetPrice ? formatPrice(targetPrice) : "--"}
            </Typography>
          </>
        )}
        <IconButton size="small" onClick={e => { e.stopPropagation(); setEditing(true); }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleClearTargetPrice}>
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={e => { e.stopPropagation(); onAlertToggle(coin.id, !alertEnabled); }}>
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

export default function Watchlist({
  theme,
  onSelectCoin,
  selectedCoin,
  coinsToWatch = [],
  onRemove,
  onTargetPriceChange,
  onAlertToggle,
  onAddToWatchlist,
}) {
  const { coins } = useContext(DataContext);
  const [search, setSearch] = useState("");
  const [addSymbol, setAddSymbol] = useState("");

  // Filtered coins in watchlist
  const filteredWatchlist = useMemo(() => {
    return coinsToWatch
      .map(watch => coins.find(c => c.id === watch.crypto_id) ? { ...watch, coin: coins.find(c => c.id === watch.crypto_id) } : null)
      .filter(Boolean)
      .filter(({ coin }) =>
        coin.symbol?.toLowerCase().includes(search.toLowerCase()) ||
        coin.name?.toLowerCase().includes(search.toLowerCase())
      );
  }, [coinsToWatch, coins, search]);

  // Add to watchlist by symbol
  const handleAdd = () => {
    const coin = coins.find(c => c.symbol?.toLowerCase() === addSymbol.toLowerCase());
    if (coin) {
      onAddToWatchlist(coin);
      setAddSymbol("");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <TextField
          placeholder="Symbol (e.g. BTC)"
          value={addSymbol}
          onChange={e => setAddSymbol(e.target.value)}
          size="small"
          sx={{
            borderRadius: 999,
            bgcolor: "#23272f",
            input: { color: "whitesmoke" },
            width: "70%",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#888" }} />
              </InputAdornment>
            ),
          }}
          onKeyDown={e => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <IconButton onClick={handleAdd} color="primary" sx={{ ml: 1 }}>
          <AddIcon />
        </IconButton>
        <TextField
          placeholder="Search coin symbol..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{
            borderRadius: 999,
            bgcolor: "#23272f",
            input: { color: "whitesmoke" },
            width: "30%",
            ml: 2,
          }}
        />
      </Box>
      {filteredWatchlist.map(({ coin, target_price, alert_enabled, crypto_id }) => (
        <WatchlistRow
          key={crypto_id}
          coin={coin}
          targetPrice={target_price}
          alertEnabled={alert_enabled}
          onTargetPriceChange={onTargetPriceChange}
          onAlertToggle={onAlertToggle}
          onRemove={onRemove}
          onSelectCoin={onSelectCoin}
          selected={selectedCoin && selectedCoin.id === coin.id}
        />
      ))}
    </Box>
  );
}

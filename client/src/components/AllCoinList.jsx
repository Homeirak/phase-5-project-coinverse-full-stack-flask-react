// AllCoinList.jsx
import React, { useState, useContext, useMemo } from "react";
import { Box, TextField, InputAdornment, Typography, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { DataContext } from "../context/DataContext";

console.log("Rendering AllCoinList");

export default function AllCoinList({ onSelectCoin, selectedCoin, watchlist, onToggleWatchlist }) {
  const { coins = [] } = useContext(DataContext) || {};
  const [search, setSearch] = useState("");

  const filteredCoins = useMemo(() => {
    return coins.filter(
      (coin) =>
        coin.symbol?.toLowerCase().includes(search.toLowerCase()) ||
        coin.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [coins, search]);

  return (
    <Box>
      <TextField
        placeholder="Search coin symbol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{
          borderRadius: 999,
          bgcolor: "#23272f",
          mb: 2,
          input: { color: "whitesmoke" },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#888" }} />
            </InputAdornment>
          ),
        }}
      />
      {filteredCoins.map((coin) => {
        const isWatched = watchlist.some(w => w.crypto_id === coin.id);
        return (
          <Box
            key={coin.id}
            sx={{
              borderBottom: "1px solid #404153",
              py: 1.5,
              px: 1,
              cursor: "pointer",
              bgcolor: selectedCoin && selectedCoin.id === coin.id ? "rgba(64,65,83,0.25)" : "inherit",
              "&:hover": { bgcolor: "rgba(64,65,83,0.15)" },
            }}
            onClick={() => onSelectCoin(coin)}
          >
            {/* Top row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img src={coin.image_url} alt={coin.symbol} style={{ width: 28, height: 28, borderRadius: "50%" }} />
                <Typography sx={{ fontWeight: 700 }}>{coin.symbol?.toUpperCase()}</Typography>
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleWatchlist(coin, isWatched);
                  }}
                >
                  {isWatched ? <StarIcon sx={{ color: "#fbc02d" }} /> : <StarBorderIcon sx={{ color: "#aaa" }} />}
                </IconButton>
              </Box>
              <Typography sx={{ fontWeight: 400 }}>
                {coin.current_price ? `$${Number(coin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "--"}
              </Typography>
            </Box>
            {/* Bottom row */}
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
          </Box>
        );
      })}
    </Box>
  );
}
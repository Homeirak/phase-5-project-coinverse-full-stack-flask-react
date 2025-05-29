import React, { useState, useContext, useMemo } from 'react';
import { Box, TextField, Tabs, Tab, IconButton, Typography, Paper, InputAdornment } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { DataContext } from '../context/DataContext';

const tabStyles = {
  minWidth: 100,
  fontWeight: 700,
  color: '#888',
  '&.Mui-selected': {
    color: '#fff',
    background: '#404153',
    borderRadius: 2,
  },
};

function CoinListItem({ coin, isWatchlisted, onToggleWatchlist, theme }) {
  const priceChange = coin.price_change_percentage_24h;
  const isPositive = priceChange > 0;
  const isNegative = priceChange < 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid #404153',
        py: 1.5,
        px: 2,
        bgcolor: 'transparent',
        transition: 'background 0.2s',
        '&:hover': { background: 'rgba(64,65,83,0.10)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Coin image, symbol */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={coin.image} alt={coin.symbol} style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <Typography
            sx={{
              fontWeight: 700,
              color: theme === 'dark' ? 'whitesmoke' : 'black',
              fontSize: '1.1rem',
              mr: 1,
            }}
          >
            {coin.symbol.toUpperCase()}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onToggleWatchlist(coin.id)}
            sx={{
              color: theme === 'dark' ? 'whitesmoke' : 'black',
              ml: 0.5,
            }}
          >
            {isWatchlisted ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Box>
        {/* Right: Current price */}
        <Typography
          sx={{
            fontWeight: 400,
            color: theme === 'dark' ? 'whitesmoke' : 'black',
            fontSize: '1.1rem',
          }}
        >
          ${Number(coin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
        {/* Left: Volume */}
        <Typography sx={{ color: '#404153', fontWeight: 400, fontSize: '0.95rem' }}>
          Vol: ${Number(coin.total_volume).toLocaleString()}
        </Typography>
        {/* Right: Change */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isNegative && (
            <>
              <FiArrowDownRight color="#f44336" size={20} />
              <Typography sx={{ color: '#f44336', fontWeight: 700 }}>
                {priceChange.toFixed(2)}%
              </Typography>
            </>
          )}
          {isPositive && (
            <>
              <FiArrowUpRight color="#4caf50" size={20} />
              <Typography sx={{ color: '#4caf50', fontWeight: 700 }}>
                +{priceChange.toFixed(2)}%
              </Typography>
            </>
          )}
          {!isPositive && !isNegative && (
            <Typography sx={{ color: '#888', fontWeight: 700 }}>
              0.00%
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function AllCoinList({ onSelectCoin, selectedCoin }) {
  const context = useContext(DataContext) || {};
  const coins = context.coins || [];
  const loading = context.loading;
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [watchlist, setWatchlist] = useState([]); // Replace with backend integration
  const theme = 'dark'; // Replace with context/theme provider if available

  // filter coins by search
  const filteredCoins = useMemo(() => {
    const s = search.trim().toLowerCase();
    return coins.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.symbol.toLowerCase().includes(s)
    );
  }, [coins, search]);

  // Watchlist coins
  const watchlistCoins = useMemo(
    () => coins.filter((c) => watchlist.includes(c.id)),
    [coins, watchlist]
  );

  // Toggle watchlist (stub, replace with backend)
  const handleToggleWatchlist = (coinId) => {
    setWatchlist((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  return (
    <Paper
      sx={{
        border: '1px solid #404153',
        borderRadius: 3,
        bgcolor: 'background.paper',
        mx: 2,
        mb: 2,
        minHeight: 400,
        boxShadow: 2,
        overflow: 'hidden',
      }}
    >
      {/* Search and Tabs */}
      <Box sx={{ p: 2, pb: 0 }}>
        <TextField
          placeholder="Search coin symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          sx={{
            borderRadius: 999,
            bgcolor: theme === 'dark' ? '#23272f' : '#f5f6fa',
            mb: 2,
            input: { color: theme === 'dark' ? 'whitesmoke' : 'black' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#888' }} />
              </InputAdornment>
            ),
          }}
        />
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 1 }}
          TabIndicatorProps={{ style: { display: 'none' } }}
        >
          <Tab label="Spot" sx={tabStyles} />
          <Tab label="Watchlist" sx={tabStyles} />
        </Tabs>
      </Box>
      {/* Coin List */}
      <Box sx={{ maxHeight: 520, overflowY: 'auto' }}>
        {loading ? (
          <Typography sx={{ p: 3, textAlign: 'center' }}>Loading...</Typography>
        ) : tab === 0 ? (
          filteredCoins.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center' }}>No coins found.</Typography>
          ) : (
            filteredCoins.map((coin) => (
              <Box
                key={coin.id}
                onClick={() => onSelectCoin && onSelectCoin(coin)}
                sx={{
                  cursor: 'pointer',
                  background:
                    selectedCoin && selectedCoin.id === coin.id
                      ? 'rgba(64,65,83,0.15)'
                      : 'transparent',
                }}
              >
                <CoinListItem
                  coin={coin}
                  isWatchlisted={watchlist.includes(coin.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                  theme={theme}
                />
              </Box>
            ))
          )
        ) : watchlistCoins.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: 'center' }}>No coins in watchlist.</Typography>
        ) : (
          watchlistCoins.map((coin) => (
            <Box key={coin.id}>
              <CoinListItem
                coin={coin}
                isWatchlisted={true}
                onToggleWatchlist={handleToggleWatchlist}
                theme={theme}
              />
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}

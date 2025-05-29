import React, { useState, useContext } from "react";
import { Box, Typography, IconButton, Paper, Fade, Tabs, Tab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AllCoinList from "../components/AllCoinList";
import Watchlist from "../components/Watchlist";
import LiveChart from "../components/LiveChart";
import TradeForm from "../components/TradeForm";
import { UserContext } from "../context/UserContext";

const DEFAULT_COIN = {
  symbol: "BTC",
  name: "Bitcoin",
  image_url: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
};

function Market() {
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_COIN);
  const [showCoinList, setShowCoinList] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Spot, 1 = Watchlist
  const { user } = useContext(UserContext);
  const theme = "dark";

  const handlePillClick = () => setShowCoinList(true);
  const handleCloseCoinList = () => setShowCoinList(false);

  return (
    <Box sx={{ px: 0, py: 0, width: "100%", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: 64,
          px: 3,
          borderBottom: "1px solid #404153",
          background: "var(--background-color)",
        }}
      >
        {/* pill-shaped selected coin button */}
        <Box
          onClick={handlePillClick}
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            px: 2,
            py: 1,
            background: "rgba(64,65,83,0.15)",
            boxShadow: 1,
            cursor: "pointer",
            gap: 1.5,
            minWidth: 100,
            border: "1px solid #404153",
            transition: "background 0.2s",
            "&:hover": { background: "rgba(64,65,83,0.25)" },
          }}
        >
          <img
            src={selectedCoin.image_url}
            alt={selectedCoin.symbol}
            style={{ width: 28, height: 28, marginRight: 8, borderRadius: "50%" }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {selectedCoin.symbol}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", flexDirection: "row", width: "100%", minHeight: "calc(100vh - 64px)" }}>
        {/* Pop-out coin List/Watchlist */}
        <Fade in={showCoinList}>
          <Paper
            elevation={4}
            sx={{
              position: "fixed",
              left: "220px",
              top: 64,
              height: "calc(100vh - 64px)",
              width: { xs: "100vw", md: 400 },
              minWidth: 320,
              maxWidth: 480,
              zIndex: 1400,
              borderLeft: "1px solid #404153",
              background: "var(--background-color)",
              overflow: "auto",
              display: showCoinList ? "block" : "none",
              '&::-webkit-scrollbar': {
                width: 8,
                background: theme === "dark" ? "#23242a" : "#f0f0f0",
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme === "dark" ? "#444" : "#bbb",
                borderRadius: 4,
              },
            }}
          >
            {/* Close button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
              <IconButton onClick={handleCloseCoinList}>
                <CloseIcon />
              </IconButton>
            </Box>
            {/* Tabs for Spot/Watchlist (Spot left, Watchlist right) */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
              <Tab label="Spot" />
              <Tab label="Watchlist" />
            </Tabs>
            <Box sx={{ p: 2 }}>
              {tab === 0 ? (
                <AllCoinList
                  onSelectCoin={(coin) => setSelectedCoin(coin)}
                  selectedCoin={selectedCoin}
                />
              ) : (
                <Watchlist theme={theme} />
              )}
            </Box>
          </Paper>
        </Fade>

        {/* main chart and trade form */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, transition: "margin-left 0.3s" }}>
          {/* Live Chart */}
          <Box sx={{ flex: 2, minWidth: 0, borderRight: "1px solid #404153", p: 3 }}>
            <LiveChart coin={selectedCoin} />
          </Box>
          {/* Trade Form */}
          <Box sx={{ flex: 1, minWidth: 320, p: 3 }}>
            <TradeForm coin={selectedCoin} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Market;
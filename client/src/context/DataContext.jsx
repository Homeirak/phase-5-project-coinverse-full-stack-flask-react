// context/DataContext.js
import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch cryptos from your backend to get internal DB IDs + coingecko IDs
    fetch("/api/cryptos")
      .then(res => res.json())
      .then(cryptoList => {
        // Create a mapping of coingecko_id → full DB crypto info (including numeric id)
        const idMap = Object.fromEntries(
          cryptoList.map(c => [c.coingecko_id, { id: c.id, symbol: c.symbol, name: c.name, image_url: c.image_url }])
        );

        const coingeckoIds = Object.keys(idMap);
        const idsString = coingeckoIds.join(",");

        // 2. Fetch live data from CoinGecko
        return fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsString}`)
          .then(res => res.json())
          .then(marketData => {
            // 3. Merge internal ID into each coin object
            const merged = marketData.map(coin => {
              const local = idMap[coin.id]; // CoinGecko returns coingecko_id as `coin.id`
              return {
                ...coin,
                id: local.id,                  // ✅ your DB ID (used in PATCH/DELETE)
                coingecko_id: coin.id,         // ✅ keep CoinGecko ID separately
                symbol: local.symbol,          // Optional override
                name: local.name,
                image_url: local.image_url || coin.image,
              };
            });

            setCoins(merged);
          });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DataContext.Provider value={{ coins, loading }}>
      {children}
    </DataContext.Provider>
  );
}

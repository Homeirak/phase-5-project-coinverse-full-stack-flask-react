// context/DataContext.js
import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the coin list from your backend (not the seed file)
    fetch("/api/cryptos") // <-- You need to implement this endpoint if not present
      .then(res => res.json())
      .then(cryptoList => {
        // 2. Get coingecko_ids
        const ids = cryptoList.map(c => c.coingecko_id).filter(Boolean);
        // 3. Join them into a string
        const idsString = ids.join(",");
        // 4. Fetch live data from CoinGecko
        return fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsString}`);
      })
      .then(res => res.json())
      .then(setCoins)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DataContext.Provider value={{ coins, loading }}>
      {children}
    </DataContext.Provider>
  );
}

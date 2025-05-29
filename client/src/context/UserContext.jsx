import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [usdBalance, setUsdBalance] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await fetch("/api/check_current_user");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data); // adjust based on your backend response
          setUsdBalance(data.usd_balance || 0);
          setHoldings(data.holdings || []);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrentUser();
  }, []);

  // Login function
  async function login(credentials) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user || data);
      setUsdBalance(data.usd_balance || 0);
      setHoldings(data.holdings || []);
      return { success: true };
    } else {
      const error = await res.json();
      return { success: false, error: error.error || "Login failed" };
    }
  }

  // Logout function
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setUsdBalance(0);
    setHoldings([]);
  }

  // Toggle theme
  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        usdBalance,
        setUsdBalance,
        holdings,
        setHoldings,
        theme,
        toggleTheme,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
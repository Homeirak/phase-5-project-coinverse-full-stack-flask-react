// 1. Create the context
const DataContext = React.createContext();

// 2. Create a provider component
function DataProvider({ children }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://api.example.com/data")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

// 3. Use in child components
function MyComponent() {
  const data = useContext(DataContext);
  if (!data) return <p>Loading...</p>;
  return <div>{JSON.stringify(data)}</div>;
}

// 4. Wrap your app
function App() {
  return (
    <DataProvider>
      <MyComponent />
    </DataProvider>
  );
}

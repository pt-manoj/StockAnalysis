import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import io from 'socket.io-client';
import StockContext from './context/StockContext';
import NiftyBanner from './components/NiftyBanner';

export default function App() {
  const [data, setData] = useState({
    nifty: null,
    sectors: {},
    sectorDetails: {}
  });
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:5000' : undefined));

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('data-update', (broadcastData) => {
      setData(broadcastData);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <StockContext.Provider value={{ data, socket, isConnected }}>
      <div className="min-h-screen bg-gray-50">
        <NiftyBanner nifty={data.nifty} isConnected={isConnected} />
        <main className="p-6">
          <Outlet context={{ data }} />
        </main>
      </div>
    </StockContext.Provider>
  );
}

import { createContext } from 'react';

const StockContext = createContext({
  data: {
    nifty: null,
    sectors: {},
    sectorDetails: {}
  },
  socket: null,
  isConnected: false
});

export default StockContext;

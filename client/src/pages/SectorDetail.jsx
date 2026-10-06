import { useContext, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import StockContext from '../context/StockContext';

export default function SectorDetail() {
  const { sectorName } = useParams();
  const { data, socket, isConnected } = useContext(StockContext);

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit('watch-sector', sectorName);
    return () => socket.emit('unwatch-sector');
  }, [socket, isConnected, sectorName]);

  const sectorStocks = useMemo(() => {
    const stocks = data.sectorDetails?.[sectorName] || [];
    return stocks.sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
  }, [data.sectorDetails, sectorName]);

  const sectorInfo = data.sectors?.[sectorName];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{sectorName} Sector</h2>
        <p className="text-gray-600">
          Stocks sorted from highest to lowest trend
        </p>
      </div>

      {sectorInfo && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Sector Average Trend</p>
              <p className="text-3xl font-bold text-blue-900">{sectorInfo.trend}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700 font-semibold">Total Stocks</p>
              <p className="text-3xl font-bold text-blue-900">{sectorInfo.stockCount}</p>
            </div>
            <div>
              <p className={`text-sm font-semibold ${
                parseFloat(sectorInfo.trend) >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {parseFloat(sectorInfo.trend) >= 0 ? '📈 Uptrend' : '📉 Downtrend'}
              </p>
            </div>
          </div>
        </div>
      )}

      {sectorStocks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading stocks...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="stock-table">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Symbol</th>
                <th className="px-6 py-4 text-right font-semibold">Price</th>
                <th className="px-6 py-4 text-right font-semibold">Change (Points)</th>
                <th className="px-6 py-4 text-right font-semibold">Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {sectorStocks.map((stock) => {
                const isUp = parseFloat(stock.changePercent) >= 0;
                return (
                  <tr key={stock.symbol} className="stock-row border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">{stock.symbol}</td>
                    <td className="px-6 py-4 text-right text-gray-700">₹{stock.price}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                      {isUp ? '+' : ''}{stock.change}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center justify-end gap-2">
                        <span>{isUp ? '▲' : '▼'}</span>
                        <span>{stock.changePercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-900 mb-2">⚡ Real-Time Updates:</h3>
        <p className="text-sm text-amber-800">
          This page updates automatically every 2 seconds. Prices and trends shown are the latest available from the market data provider.
        </p>
      </div>
    </div>
  );
}

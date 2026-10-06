import { useContext, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import StockContext from '../context/StockContext';
import SectorCard from '../components/SectorCard';

export default function Dashboard() {
  const { data } = useContext(StockContext);

  const sortedSectors = useMemo(() => {
    if (!data.sectors || Object.keys(data.sectors).length === 0) {
      return [];
    }

    return Object.entries(data.sectors)
      .map(([name, info]) => ({
        name,
        trend: info.trend,
        stockCount: info.stockCount
      }))
      .sort((a, b) => parseFloat(b.trend) - parseFloat(a.trend));
  }, [data.sectors]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sector Performance</h2>
        <p className="text-gray-600">Real-time sector trends sorted from best to worst performers</p>
      </div>

      {sortedSectors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading sector data...</p>
          <p className="text-gray-400 text-sm mt-2">Make sure your API key is configured in .env</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sortedSectors.map((sector) => (
            <SectorCard
              key={sector.name}
              name={sector.name}
              trend={sector.trend}
              stockCount={sector.stockCount}
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📊 How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sectors are sorted by performance (highest trending first)</li>
          <li>• Green indicates uptrend, Red indicates downtrend</li>
          <li>• Click any sector to view all stocks sorted by trend</li>
          <li>• Data updates in real-time every 2 seconds</li>
        </ul>
      </div>
    </div>
  );
}

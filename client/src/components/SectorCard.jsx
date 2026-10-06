import { Link } from 'react-router-dom';

export default function SectorCard({ name, trend, stockCount }) {
  const isUptrend = parseFloat(trend) >= 0;
  const bgColor = isUptrend ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const trendColor = isUptrend ? 'text-green-600' : 'text-red-600';
  const trendIcon = isUptrend ? '▲' : '▼';

  return (
    <Link to={`/sector/${name}`}>
      <div className={`sector-card border-2 ${bgColor}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">{name}</h3>
          <span className={`text-sm ${trendColor}`}>{trendIcon}</span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className={`text-xl font-bold ${trendColor}`}>{trend}%</span>
          <span className="text-xs text-gray-500">{stockCount} stocks</span>
        </div>
      </div>
    </Link>
  );
}

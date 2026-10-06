export default function NiftyBanner({ nifty, isConnected }) {
  return (
    <div className="nifty-banner py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📈 NIFTY 50</h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-blue-100 text-sm">Current Index</p>
            <p className="text-4xl font-bold">
              {nifty?.points || 'Loading...'}
            </p>
          </div>

          <div className="text-right">
            <p className={`text-lg font-semibold ${
              parseFloat(nifty?.changePercent || 0) >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {parseFloat(nifty?.changePercent || 0) >= 0 ? '▲' : '▼'} {nifty?.changePercent || 0}%
            </p>
            <p className="text-blue-100 text-sm">
              Change: {nifty?.change || 0} pts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-sm text-blue-100">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import axios from 'axios';

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

const NIFTY_SYMBOL = '^NSEI';

const SECTORS = {
  'Bank': { index: '^NSEBANK', stocks: ['HDFCBANK', 'ICICIBANK', 'AXISBANK', 'KOTAKBANK', 'SBIN', 'INDUSINDBK', 'BANKBARODA', 'PNB', 'FEDERALBNK', 'IDFCFIRSTB', 'AUBANK', 'BANDHANBNK'] },
  'Private Bank': { index: 'NIFTY_PVT_BANK.NS', stocks: ['HDFCBANK', 'ICICIBANK', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK', 'FEDERALBNK', 'IDFCFIRSTB', 'AUBANK', 'BANDHANBNK', 'RBLBANK'] },
  'PSU Bank': { index: '^CNXPSUBANK', stocks: ['SBIN', 'BANKBARODA', 'PNB', 'CANBK', 'UNIONBANK', 'INDIANB', 'BANKINDIA', 'MAHABANK', 'IOB', 'UCOBANK'] },
  'Financial Services': { index: 'NIFTY_FIN_SERVICE.NS', stocks: ['HDFCBANK', 'ICICIBANK', 'BAJFINANCE', 'BAJAJFINSV', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'SHRIRAMFIN', 'HDFCLIFE', 'SBILIFE', 'CHOLAFIN', 'JIOFIN', 'MUTHOOTFIN', 'PFC', 'RECLTD'] },
  'IT': { index: '^CNXIT', stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'LTIM', 'MPHASIS', 'TECHM', 'COFORGE', 'PERSISTENT', 'OFSS'] },
  'Auto': { index: '^CNXAUTO', stocks: ['MARUTI', 'M&M', 'BAJAJ-AUTO', 'EICHERMOT', 'HEROMOTOCO', 'TVSMOTOR', 'ASHOKLEY', 'BOSCHLTD', 'MOTHERSON', 'BALKRISIND'] },
  'FMCG': { index: '^CNXFMCG', stocks: ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'TATACONSUM', 'DABUR', 'GODREJCP', 'MARICO', 'COLPAL', 'VBL', 'UNITDSPR'] },
  'Pharma': { index: '^CNXPHARMA', stocks: ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'DIVISLAB', 'LUPIN', 'AUROPHARMA', 'TORNTPHARM', 'ZYDUSLIFE', 'ALKEM', 'MANKIND'] },
  'Healthcare': { index: 'NIFTY_HEALTHCARE.NS', stocks: ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'DIVISLAB', 'APOLLOHOSP', 'MAXHEALTH', 'LUPIN', 'FORTIS', 'TORNTPHARM', 'SYNGENE'] },
  'Metal': { index: '^CNXMETAL', stocks: ['TATASTEEL', 'HINDALCO', 'JSWSTEEL', 'VEDL', 'JINDALSTEL', 'NMDC', 'SAIL', 'NATIONALUM', 'APLAPOLLO', 'HINDZINC'] },
  'Realty': { index: '^CNXREALTY', stocks: ['DLF', 'GODREJPROP', 'LODHA', 'OBEROIRLTY', 'PRESTIGE', 'PHOENIXLTD', 'BRIGADE'] },
  'Energy': { index: '^CNXENERGY', stocks: ['RELIANCE', 'NTPC', 'ONGC', 'POWERGRID', 'COALINDIA', 'BPCL', 'IOC', 'TATAPOWER', 'ADANIGREEN', 'GAIL'] },
  'Oil & Gas': { index: 'NIFTY_OIL_AND_GAS.NS', stocks: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'GAIL', 'HINDPETRO', 'PETRONET', 'OIL', 'IGL', 'MGL'] },
  'Media': { index: '^CNXMEDIA', stocks: ['SUNTV', 'ZEEL', 'PVRINOX', 'NETWORK18', 'TV18BRDCST', 'SAREGAMA', 'NAZARA'] },
  'Consumer Durables': { index: 'NIFTY_CONSR_DURBL.NS', stocks: ['TITAN', 'HAVELLS', 'DIXON', 'VOLTAS', 'BLUESTARCO', 'CROMPTON', 'WHIRLPOOL', 'KALYANKJIL', 'PGEL', 'AMBER'] }
};

const watchers = new Map();
const stockCache = new Map();
let latest = null;

export function getLatest() {
  return latest;
}

export function isSector(name) {
  return Object.hasOwn(SECTORS, name);
}

export function watchSector(name) {
  watchers.set(name, (watchers.get(name) || 0) + 1);
}

export function unwatchSector(name) {
  const n = (watchers.get(name) || 0) - 1;
  if (n > 0) watchers.set(name, n);
  else watchers.delete(name);
}

async function fetchQuote(yahooSymbol, label) {
  try {
    const { data } = await axios.get(`${YAHOO_URL}/${encodeURIComponent(yahooSymbol)}`, {
      params: { interval: '1m', range: '1d' },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    const change = price - prev;
    return {
      symbol: label,
      price: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: ((change / prev) * 100).toFixed(2)
    };
  } catch (error) {
    console.error(`Error fetching ${label}: ${error.message}`);
    return null;
  }
}

export async function fetchAndBroadcastData(io) {
  const sectorNames = Object.keys(SECTORS);
  const watchedStocks = new Set();
  for (const name of watchers.keys()) SECTORS[name].stocks.forEach((s) => watchedStocks.add(s));

  const [nifty, indexQuotes] = await Promise.all([
    fetchQuote(NIFTY_SYMBOL, 'NIFTY 50').then((q) =>
      q && { points: q.price, change: q.change, changePercent: q.changePercent }
    ),
    Promise.all(sectorNames.map((name) => fetchQuote(SECTORS[name].index, name))),
    Promise.all(
      [...watchedStocks].map(async (s) => {
        const q = await fetchQuote(`${s}.NS`, s);
        if (q) stockCache.set(s, q);
      })
    )
  ]);

  const sectors = {};
  sectorNames.forEach((name, i) => {
    const q = indexQuotes[i];
    if (!q) return;
    sectors[name] = {
      trend: q.changePercent,
      stockCount: SECTORS[name].stocks.length,
      color: parseFloat(q.changePercent) >= 0 ? 'green' : 'red'
    };
  });

  const sectorDetails = {};
  for (const name of watchers.keys()) {
    sectorDetails[name] = SECTORS[name].stocks
      .map((s) => stockCache.get(s))
      .filter(Boolean)
      .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
  }

  latest = { timestamp: new Date().toISOString(), nifty, sectors, sectorDetails };
  io.emit('data-update', latest);
}

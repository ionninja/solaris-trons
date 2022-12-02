export const SOLARIS_PROJECTS_PATH = '/share/app/projects';

export const getBtcUsdPrice = async () => {
  const response = await fetch('http://63.250.36.215:8888/prices?coin=btc');
  const data = await response.json();
  return data.btc.usd;
}

export const roundToFixed2 = (val) => Math.round(val * 1e2) / 1e2;

export const floorToFixed3 = (val) => Math.floor(val * 1e3) / 1e3;

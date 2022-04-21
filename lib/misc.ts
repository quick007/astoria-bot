function msToHMS(ms: number) {
  const h = ms / 3.6e6 | 0;
  const m = (ms % 3.6e6) / 6e4 | 0;
  const s = (ms % 6e4) / 1e3 | 0;
  const ss = (ms % 1e3);
  return `${h}:${('' + m).padStart(2, '0')}:${('' + s).padStart(2, '0')}.${(''+ss).padStart(3, '0')}`;
}

// Return time to UTC midnight as H:mm:ss.sss
export function timeToUTCMidnight(d = new Date()) {
	//@ts-ignore works
  return msToHMS(new Date(d).setUTCHours(24,0,0,0) - d);
}

// Return time to local midngith as H:mm:ss.sss
export function timeTolocalMidnight(d = new Date()) {
	//@ts-ignore works
  return msToHMS(new Date(d).setHours(24,0,0,0) - d);
}
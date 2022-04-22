function msToHMS(ms: number) {
  const h = (ms / 3.6e6) | 0;
  const m = ((ms % 3.6e6) / 6e4) | 0;
  const s = ((ms % 6e4) / 1e3) | 0;
  const ss = ms % 1e3;
  return `${h}:${("" + m).padStart(2, "0")}:${("" + s).padStart(2, "0")}.${(
    "" + ss
  ).padStart(3, "0")}`;
}

// Return time to UTC midnight as H:mm:ss.sss
export function timeToUTCMidnight(d = new Date()) {
  //@ts-ignore works
  return msToHMS(new Date(d).setUTCHours(24, 0, 0, 0) - d);
}

// Return time to local midngith as H:mm:ss.sss
export function timeTolocalMidnight(d = new Date()) {
  //@ts-ignore works
  return msToHMS(new Date(d).setHours(24, 0, 0, 0) - d);
}

export function cardsToWords(id: number): string {
  switch (id) {
    case 0:
      return "Common Card";
    case 1:
      return "Rare Card";
    case 2:
      return "Legendary Card";
    case 3:
      return "Fabled Card";
    case 4:
      return "Mythic Card";
    case 5:
      return "Common Card Pack";
    case 6:
      return "Rare Card Pack";
    case 7:
      return "Legendary Card Pack";
    case 8:
      return "Fabled Card Pack";
    case 9:
      return "Mythic Card Pack";
  }
  return "Unknown Item";
}

export function cardArrayToWords(ids: number[]): string[] {
  let r: string[] = [];
  ids.forEach((v) => {
    r.push(cardsToWords(v));
  });
  return r;
}

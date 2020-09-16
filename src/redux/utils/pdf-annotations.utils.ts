export interface IRect {
  startX: number;
  startY: number;
  width: number;
  height: number;
  page: number;
}

export const rectRegex = /([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+):([0-9]+)/;

export function rectFromStr(r: string, docHeight: number): IRect {
  const pre_match = rectRegex.exec(r);
  let match = ['0', '0', '0', '0', '0', '0'];
  if (pre_match && pre_match.length === 6) {
    match = Array.from(pre_match);
  }

  return {
    startX: parseFloat(match[1]) || 0,
    startY: parseFloat(match[2]) || 0,
    width: parseFloat(match[3]) || 0,
    height: parseFloat(match[4]) || 0,
    page: parseInt(match[5], 10) || 0,
  };
}

export function rectToStr(rect: IRect) {
  return `${rect.startX},${rect.startY},${rect.width},${rect.height}:${rect.page}`;
}

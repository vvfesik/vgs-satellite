export const cutLine = (source, lineString = 'name: ') =>
  source
    .split('\n')
    .filter(line => !line.includes(lineString))
    .join('\n');

export const cssCustomProperties = (obj: object) => {
  let cssString = '';

  Object.entries(obj).forEach(([key, value]) => {
    cssString += `--${key}: ${value};\n`;
  });

  return cssString;
};

export const searchTermOptimization = (term: string) => {
  return term.toLowerCase().replace(/\s/g, '');
};

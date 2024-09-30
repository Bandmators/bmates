/* eslint-disable @typescript-eslint/no-explicit-any */
export const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }

  Object.assign(target || {}, source);
  return target;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const deepMerge = (target: any, source: any) => {
  if (!source || typeof source !== 'object') return target;

  for (const [key, value] of Object.entries(source)) {
    const targetValue = target?.[key];
    const isPlainObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const hasPlainTarget = targetValue !== null && typeof targetValue === 'object' && !Array.isArray(targetValue);

    target[key] = isPlainObject && hasPlainTarget ? deepMerge(targetValue, value) : value;
  }

  return target;
};

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

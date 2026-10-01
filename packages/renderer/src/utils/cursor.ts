export const setCursor = (cursorStyle: CSSStyleDeclaration['cursor'], canvas?: HTMLCanvasElement) => {
  const target = canvas ?? document.querySelector('canvas');
  if (target) target.style.cursor = cursorStyle;
};
export const getCursor = (canvas?: HTMLCanvasElement): CSSStyleDeclaration['cursor'] => {
  return (canvas ?? document.querySelector('canvas'))?.style.cursor ?? 'default';
};

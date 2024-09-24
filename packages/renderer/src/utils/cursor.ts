export const setCursor = (cursorStyle: CSSStyleDeclaration['cursor']) => {
  document.querySelector('canvas').style.cursor = cursorStyle;
};
export const getCursor = (): CSSStyleDeclaration['cursor'] => {
  return document.querySelector('canvas').style.cursor;
};

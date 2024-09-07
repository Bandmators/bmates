export const setCursor = (cursorStyle: CSSStyleDeclaration['cursor']) => {
  document.body.style.cursor = cursorStyle;
};
export const getCursor = (): CSSStyleDeclaration['cursor'] => {
  return document.body.style.cursor;
};

export const getRelativeMousePosition = (
  event: MouseEvent,
  element: HTMLCanvasElement,
  scroll: { x: number; y: number },
) => {
  const rect = element.getBoundingClientRect();

  return {
    x: event.clientX - rect.left + scroll.x,
    y: event.clientY - rect.top + scroll.y,
  };
};

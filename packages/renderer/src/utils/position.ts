export const getRelativeMousePosition = (
  event: Event,
  element: HTMLCanvasElement,
  scroll: { x: number; y: number },
) => {
  const rect = element.getBoundingClientRect();
  const client = getClientPosition(event);
  return {
    x: client.x - rect.left + scroll.x,
    y: client.y - rect.top + scroll.y,
  };
};

export const getClientPosition = (event: Event) => {
  const clientX =
    event instanceof MouseEvent
      ? event.clientX
      : event instanceof TouchEvent
        ? event.touches.length > 0
          ? event.touches[0].clientX
          : 0
        : 0;

  const clientY =
    event instanceof MouseEvent
      ? event.clientY
      : event instanceof TouchEvent
        ? event.touches.length > 0
          ? event.touches[0].clientY
          : 0
        : 0;

  return {
    x: clientX,
    y: clientY,
  };
};

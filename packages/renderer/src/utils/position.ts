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
  const pointerEvent = event as Partial<MouseEvent>;
  if (typeof pointerEvent.clientX === 'number' && typeof pointerEvent.clientY === 'number') {
    return { x: pointerEvent.clientX, y: pointerEvent.clientY };
  }

  const touch = (event as Partial<TouchEvent>).touches?.[0];
  const clientX = touch?.clientX ?? 0;
  const clientY = touch?.clientY ?? 0;

  return {
    x: clientX,
    y: clientY,
  };
};

export const getRelativeMousePosition = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

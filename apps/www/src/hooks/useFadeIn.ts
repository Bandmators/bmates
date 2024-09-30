import { MutableRefObject, useEffect, useRef, useState } from 'react';

export default function useFadeIn(threshold = 0.4): [MutableRefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(({ isIntersecting }) => {
          if (isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold },
    );
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, visible];
}

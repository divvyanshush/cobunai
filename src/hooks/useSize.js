import { useState, useLayoutEffect } from "react";

// Live width and height of the element behind ref
export function useSize(ref) {
  const [size, setSize] = useState({ w:0, h:0 });
  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setSize(s => s.w === w && s.h === h ? s : { w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

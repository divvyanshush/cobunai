import { useMemo, useRef } from "react";
import { useSize } from "../hooks/useSize.js";

// Many sources converging into one brief: a hairline per source, brighter the more it carried today.
// Lines draw in once, then a few accent pulses keep travelling toward the focal point.
export function Signal({ weights }) {
  const ref = useRef(null);
  const { w, h } = useSize(ref);

  const lines = useMemo(() => {
    if(!w || !h) return null;
    const fx = w * 0.8, fy = h / 2, n = weights.length;
    return {
      fx, fy,
      paths: weights.map((wt, i) => {
        const y = n === 1 ? fy : 4 + (h - 8) * i / (n - 1);
        return { d:`M0,${y} C${fx * 0.45},${y} ${fx * 0.6},${fy} ${fx},${fy}`, wt };
      }),
    };
  }, [weights, w, h]);

  return (
    <div ref={ref} className="signal" aria-hidden="true">
      {lines && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {lines.paths.map((p, i) => (
            <path key={i} className="ln" d={p.d} pathLength="1" style={{ "--i":i, strokeOpacity: 0.1 + 0.55 * p.wt }}/>
          ))}
          {lines.paths.map((p, i) => i % 3 === 1 && (
            <path key={`p${i}`} className="pulse" d={p.d} pathLength="1" style={{ "--d": (i * 0.53) % 5 }}/>
          ))}
          <path className="out" d={`M${lines.fx},${lines.fy} H${w}`} pathLength="1"/>
          <circle className="halo" cx={lines.fx} cy={lines.fy} r="7"/>
          <circle className="focus" cx={lines.fx} cy={lines.fy} r="2.5"/>
        </svg>
      )}
    </div>
  );
}

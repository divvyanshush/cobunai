import { useMemo, useRef } from "react";
import { useSize } from "../hooks/useSize.js";

const RING = 11, RING_LEN = 2 * Math.PI * RING;

// Many sources converging into one brief: a hairline per source, brighter the more it carried today.
// Lines draw in once, then a few accent pulses keep travelling toward the focal point.
// On phones it also answers pull-to-refresh: a ring closes around the point as the list is pulled,
// and while the brief reloads, pulses rush in along the lines and one runs out along the brief's line.
export function Signal({ weights, pull }) {
  const ref = useRef(null);
  const { w, h } = useSize(ref);
  const phase = pull?.phase || "idle";
  const refreshing = phase === "refreshing";
  const ring = refreshing ? 1 : pull?.progress || 0;

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
    <div ref={ref} className="signal" data-phase={phase} data-ready={ring >= 1} aria-hidden="true">
      {lines && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {lines.paths.map((p, i) => (
            <path key={i} className="ln" d={p.d} pathLength="1" style={{ "--i":i, strokeOpacity: 0.1 + 0.55 * p.wt }}/>
          ))}
          {lines.paths.map((p, i) => i % 3 === 1 && (
            <path key={`p${i}`} className="pulse" d={p.d} pathLength="1" style={{ "--d": (i * 0.53) % 5 }}/>
          ))}
          {refreshing && lines.paths.map((p, i) => i % 2 === 0 && (
            <path key={`r${i}`} className="rush" d={p.d} pathLength="1" style={{ "--d": (i * 0.618) % 1 }}/>
          ))}
          <path className="out" d={`M${lines.fx},${lines.fy} H${w}`} pathLength="1"/>
          {refreshing && <path className="emit" d={`M${lines.fx},${lines.fy} H${w}`} pathLength="1"/>}
          <circle className="ring" cx={lines.fx} cy={lines.fy} r={RING} transform={`rotate(-90 ${lines.fx} ${lines.fy})`}
            style={{ strokeDasharray:RING_LEN, strokeDashoffset:RING_LEN * (1 - ring) }}/>
          <circle className="halo" cx={lines.fx} cy={lines.fy} r="7"/>
          <circle className="focus" cx={lines.fx} cy={lines.fy} r="2.5"/>
        </svg>
      )}
    </div>
  );
}

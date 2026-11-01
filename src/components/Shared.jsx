import { useRef } from "react";
import { useSize } from "../hooks/useSize.js";

const H = 56;

// The Today graphic in miniature: one hairline per source, half from each edge, drawing in as the list
// is pulled and meeting at a point that turns blue once a release will refresh. While the brief reloads,
// pulses run along the lines into that point.
export function PullIndicator({ dist, progress, phase, weights }) {
  const ref = useRef(null);
  const { w } = useSize(ref);
  const refreshing = phase === "refreshing";
  const p = refreshing ? 1 : progress;
  const cx = w / 2, cy = H / 2, ex = cx - 9;   // lines stop just short of the point

  const lines = weights.map((wt, i) => {
    const left = i % 2 === 0, k = Math.floor(i / 2);
    const count = left ? Math.ceil(weights.length / 2) : Math.floor(weights.length / 2);
    const mid = (count - 1) / 2;
    const y = count === 1 ? cy : 4 + (H - 8) * k / (count - 1);
    const x = v => left ? v : w - v;
    // middle lines draw first, outer ones just behind, all complete at the threshold
    const draw = Math.min(Math.max((p - Math.abs(k - mid) * 0.05) / (1 - mid * 0.05), 0), 1);
    return { d:`M${x(0)},${y} C${x(ex * 0.45)},${y} ${x(ex * 0.6)},${cy} ${x(ex)},${cy}`, wt, draw };
  });

  return (
    <div ref={ref} className="pull" data-phase={phase} data-ready={p >= 1} style={{ height:dist }} role="status">
      <span className="sr-only">{refreshing ? "Refreshing the brief" : ""}</span>
      {w > 0 && (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
          {lines.map((l, i) => (
            <path key={i} className="ln" d={l.d} pathLength="1" style={{ strokeDashoffset:1 - l.draw, strokeOpacity:0.1 + 0.55 * l.wt }}/>
          ))}
          {refreshing && lines.map((l, i) => i % 3 === 1 && (
            <path key={`p${i}`} className="pulse" d={l.d} pathLength="1" style={{ "--d":(i * 0.618) % 1 }}/>
          ))}
          <circle className="halo" cx={cx} cy={cy} r="7"/>
          <circle className="focus" cx={cx} cy={cy} r="2.5" style={{ opacity:Math.max(p, 0.2) }}/>
        </svg>
      )}
    </div>
  );
}

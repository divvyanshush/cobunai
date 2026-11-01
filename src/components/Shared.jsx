// The space a pull opens above the brief. The feedback itself is on the Today graphic (Signal),
// so this only follows the finger, eases back, and tells screen readers when a refresh starts.
export function PullGap({ dist, phase }) {
  return (
    <div className="pull" data-phase={phase} style={{ height:dist }} role="status">
      <span className="sr-only">{phase === "refreshing" ? "Refreshing the brief" : ""}</span>
    </div>
  );
}

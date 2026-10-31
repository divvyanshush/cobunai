export function PullIndicator({ progress, pulling }) {
  if(!pulling && progress === 0) return null;
  return (
    <div className="meta" style={{ display:"flex", alignItems:"center", justifyContent:"center", height:40, opacity:progress }}>
      {progress >= 1 ? "release to refresh" : "pull to refresh"}
    </div>
  );
}

import { Story } from "./Story.jsx";

export function SavedPage({ bookmarks, onBookmark }) {
  const saved = Object.values(bookmarks).filter(Boolean).sort((a,b)=>(b.bookmarkedAt||0)-(a.bookmarkedAt||0));

  return (
    <div className="page">
      <div className="scroll">
        <div className="saved">
          <div className="meta" style={{ marginBottom:20 }}>Saved · {saved.length} {saved.length===1?"item":"items"}</div>
          {!saved.length
            ? <div className="empty meta">Nothing saved yet. Use the bookmark on any headline.</div>
            : saved.map(item => <Story key={item.id} item={item} isBookmarked onBookmark={onBookmark}/>)}
        </div>
      </div>
    </div>
  );
}

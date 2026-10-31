import { timeAgo, storyText } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

// One headline: source and age, the title (straight to the article), and a single supporting line
export function Story({ item, isBookmarked, onBookmark }) {
  const { title, desc } = storyText(item);
  return (
    <article className="story">
      <a className="story-link" href={item.link} target="_blank" rel="noreferrer">
        <div className="meta">{item.srcLabel || item.src}{item.time > 0 && ` · ${timeAgo(item.time)}`}</div>
        <h3 className="story-title">{title}<span className="story-arrow" aria-hidden="true">↗</span></h3>
        {desc && <p className="story-why">{desc}</p>}
      </a>
      <button className="save" onClick={e => onBookmark(item, e)}
        aria-pressed={isBookmarked} aria-label={isBookmarked ? "Remove from saved" : "Save"}>
        <BmSvg filled={isBookmarked} size={12}/>
      </button>
    </article>
  );
}

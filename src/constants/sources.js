// Curated source → category mapping for the Sources mind map.
// `src` matches item.src from /feed. `label` is only a fallback: an item's srcLabel wins when present.
// `site` is the page a source page links out to; `noun` names what it publishes (a source's own noun beats its category's).
export const SOURCE_MAP = [
  { id:"labs", label:"Labs & Companies", noun:"post", sources:[
    { src:"OpenAI",         label:"OpenAI Blog",          site:"https://openai.com/news/" },
    { src:"DeepMind",       label:"DeepMind Blog",        site:"https://deepmind.google/blog/" },
    { src:"GoogleResearch", label:"Google Research",      site:"https://research.google/blog/" },
    { src:"HuggingFace",    label:"HuggingFace Blog",     site:"https://huggingface.co/blog" },
    { src:"TogetherAI",     label:"Together AI",          site:"https://www.together.ai/blog" },
    { src:"LangChain",      label:"LangChain Blog",       site:"https://www.langchain.com/blog" },
  ]},
  { id:"research", label:"Research", noun:"post", sources:[
    { src:"arXiv",          label:"arXiv",                site:"https://arxiv.org/list/cs.AI/recent", noun:"paper" },
    { src:"LilianWeng",     label:"Lilian Weng",          site:"https://lilianweng.github.io/" },
    { src:"Raschka",        label:"Sebastian Raschka",    site:"https://magazine.sebastianraschka.com/" },
    { src:"AlignmentForum", label:"Alignment Forum",      site:"https://www.alignmentforum.org/" },
    { src:"LessWrong",      label:"LessWrong",            site:"https://www.lesswrong.com/" },
  ]},
  { id:"builders", label:"Builders & Newsletters", noun:"post", sources:[
    { src:"Karpathy",       label:"Andrej Karpathy",      site:"https://karpathy.bearblog.dev/" },
    { src:"SimonW",         label:"Simon Willison",       site:"https://simonwillison.net/" },
    { src:"Interconnects",  label:"Interconnects",        site:"https://www.interconnects.ai/" },
    { src:"LastWeekInAI",   label:"Last Week in AI",      site:"https://lastweekin.ai/" },
  ]},
  { id:"community", label:"Community", noun:"story", sources:[
    { src:"HN",             label:"Hacker News",          site:"https://news.ycombinator.com/" },
    { src:"Lobste.rs",      label:"Lobste.rs",            site:"https://lobste.rs/t/ai" },
    { src:"Dev.to",         label:"Dev.to",               site:"https://dev.to/t/ai", noun:"post" },
  ]},
  { id:"repos", label:"Repos", noun:"repo", sources:[
    { src:"GitHub",         label:"GitHub",               site:"https://github.com/topics/ai" },
  ]},
  { id:"media", label:"Media", noun:"article", sources:[
    { src:"TechCrunch",     label:"TechCrunch AI",        site:"https://techcrunch.com/category/artificial-intelligence/" },
    { src:"TheVerge",       label:"The Verge AI",         site:"https://www.theverge.com/ai-artificial-intelligence" },
    { src:"Wired",          label:"Wired AI",             site:"https://www.wired.com/tag/ai/" },
    { src:"MITReview",      label:"MIT Tech Review",      site:"https://www.technologyreview.com/" },
    { src:"TDS",            label:"Towards Data Science", site:"https://towardsdatascience.com/" },
    { src:"MarkTechPost",   label:"MarkTechPost",         site:"https://www.marktechpost.com/" },
    { src:"TechTalks",      label:"BD Tech Talks",        site:"https://bdtechtalks.com/" },
  ]},
];

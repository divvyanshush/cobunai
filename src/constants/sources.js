// Curated source → category mapping for the Sources mind map.
// `src` matches item.src from /feed. `label` is only a fallback: an item's srcLabel wins when present.
export const SOURCE_MAP = [
  { id:"labs", label:"Labs & Companies", sources:[
    { src:"OpenAI",         label:"OpenAI Blog" },
    { src:"DeepMind",       label:"DeepMind Blog" },
    { src:"GoogleResearch", label:"Google Research" },
    { src:"HuggingFace",    label:"HuggingFace Blog" },
    { src:"TogetherAI",     label:"Together AI" },
    { src:"LangChain",      label:"LangChain Blog" },
  ]},
  { id:"research", label:"Research", sources:[
    { src:"arXiv",          label:"arXiv" },
    { src:"LilianWeng",     label:"Lilian Weng" },
    { src:"Raschka",        label:"Sebastian Raschka" },
    { src:"AlignmentForum", label:"Alignment Forum" },
    { src:"LessWrong",      label:"LessWrong" },
  ]},
  { id:"builders", label:"Builders & Newsletters", sources:[
    { src:"Karpathy",       label:"Andrej Karpathy" },
    { src:"SimonW",         label:"Simon Willison" },
    { src:"Interconnects",  label:"Interconnects" },
    { src:"LastWeekInAI",   label:"Last Week in AI" },
  ]},
  { id:"community", label:"Community", sources:[
    { src:"HN",             label:"Hacker News" },
    { src:"Lobste.rs",      label:"Lobste.rs" },
    { src:"Dev.to",         label:"Dev.to" },
  ]},
  { id:"repos", label:"Repos", sources:[
    { src:"GitHub",         label:"GitHub" },
  ]},
  { id:"media", label:"Media", sources:[
    { src:"TechCrunch",     label:"TechCrunch AI" },
    { src:"TheVerge",       label:"The Verge AI" },
    { src:"Wired",          label:"Wired AI" },
    { src:"MITReview",      label:"MIT Tech Review" },
    { src:"TDS",            label:"Towards Data Science" },
    { src:"MarkTechPost",   label:"MarkTechPost" },
    { src:"TechTalks",      label:"BD Tech Talks" },
  ]},
];

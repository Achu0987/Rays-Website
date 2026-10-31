import { VERIFICATION_STATUS } from "./schemas";

/**
 * Homepage copy. Drafted from docs/CONTENT_WRITING.md and docs/MESSAGING.md; every line needs
 * Ray's approval before launch. `status` carries the factual-control label.
 */
export const hero = {
  name: "Rayansh Singh",
  title: "Welcome to Ray's Mind.",
  intro: [
    "I'm Rayansh. Most people call me Ray.",
    "I build businesses, write about experiences, travel to understand the world, and train because some lessons are learned outside an office.",
    "The story is still being written.",
  ],
  status: VERIFICATION_STATUS.EDITORIAL_DRAFT,
};

/** One floating screen per chapter, in the order the camera passes them. */
export const chapters = [
  {
    id: "building",
    label: "Building",
    title: "Building what didn't exist yesterday.",
    body: "Founder of Socialsect: growth and digital systems for healthcare practices, across the US and the UAE.",
    link: { label: "Visit Socialsect", href: "https://gosocialsect.com/about" },
    status: VERIFICATION_STATUS.NEEDS_CONFIRMATION,
  },
  {
    id: "discipline",
    label: "Discipline",
    title: "Some lessons don't come from business.",
    body: "Boxing. You show up, you get hit, you learn to stay calm anyway.",
    status: VERIFICATION_STATUS.EDITORIAL_DRAFT,
  },
  {
    id: "stories",
    label: "Stories",
    title: "I started collecting stories.",
    body: "Backpacking across Asia, and a book: The Suitcase of Memories.",
    status: VERIFICATION_STATUS.NEEDS_CONFIRMATION,
  },
  {
    id: "ideas",
    label: "Ideas",
    title: "Things I can't stop thinking about.",
    body: "Healthcare, technology, AI, and why people do what they do.",
    status: VERIFICATION_STATUS.EDITORIAL_DRAFT,
  },
  {
    id: "future",
    label: "The future",
    title: "The best part hasn't happened yet.",
    body: "Exploring healthcare products, maybe hospitals one day. None of it exists yet.",
    status: VERIFICATION_STATUS.FUTURE_POSSIBILITY,
  },
];

export const connect = {
  title: "Good conversations change things.",
  body: "Building something interesting, have a thoughtful question, or want to collaborate? Say hello.",
  // Inbox not yet verified (docs/ASSET_AND_FACT_CHECKLIST.md). Replace before launch.
  email: "hello@raymindset.com",
  status: VERIFICATION_STATUS.NEEDS_CONFIRMATION,
};

/**
 * The compass section: Ray's direction, then the six content pillars (docs/CONTENT_WRITING.md).
 * `tone` colours each card; `bg` is the light room the section turns to while that card faces you.
 */
export const compass = {
  title: "Built from curiosity.",
  footnote: "Driven by possibility.",
  label: "RAYANSH SINGH",
  open: "Ideas. Experiences. What's next.",
  status: VERIFICATION_STATUS.EDITORIAL_DRAFT,
};

export const pillars = [
  { id: "building", title: "Building", line: "Companies, experiments, failures, leadership, operations.", tone: "#3a2a12", bg: "#e8dac1" },
  { id: "discipline", title: "Discipline", line: "Boxing, training, consistency, discomfort.", tone: "#2c1414", bg: "#ecd4cc" },
  { id: "exploration", title: "Exploration", line: "Backpacking Asia, travelling the world, meeting people.", tone: "#14262a", bg: "#d2e4e2" },
  { id: "ideas", title: "Ideas", line: "Healthcare, technology, AI, human behaviour, the future of business.", tone: "#1e1830", bg: "#dedaee" },
  { id: "writing", title: "Writing", line: "The Suitcase of Memories, essays, stories, reflections.", tone: "#2e2416", bg: "#f2dfcb" },
  { id: "next", title: "The next chapter", line: "Ambitions and questions, always labelled as exploration.", tone: "#162418", bg: "#d8e4d2" },
];

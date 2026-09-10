export type Category = {
  id: string;
  /** Arabic display name (UI is Arabic-first, RTL). */
  arabic: string;
  /** English display name. */
  english: string;
  description?: string;
};

export type Term = {
  id: string;
  english: string;
  arabic: string;
  /** References a `Category.id` from term-categories.json. */
  category: string;
  example?: string;
  pronunciation?: string;
};

export type GrammarExample = {
  english: string;
  arabic: string;
};

export type GrammarTopic = {
  id: string;
  title: string;
  arabicTitle: string;
  /** References a `Category.id` from grammar-categories.json. */
  category: string;
  description: string;
  formula?: string;
  examples: GrammarExample[];
};

export type Sentence = {
  id: string;
  english: string;
  arabic: string;
  /** References a `Category.id` from sentence-categories.json. */
  category: string;
};

export type LearningResource = {
  id: string;
  title: string;
  type: "youtube_channel" | "book";
  language: "ar" | "en";
  description: string;
  levels: string[];
  categories: string[];
  url?: string;
  author?: string;
  source: string;
};

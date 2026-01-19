export interface MarkdownSpedUpPluginSettings {
  headingSnippetPattern: string;
  codeblockSnippetPattern: string;
  calloutSnippetPattern: string;
  boldListItemSnippetPattern: string;
}

export const DEFAULT_SETTINGS: Partial<MarkdownSpedUpPluginSettings> = {
  headingSnippetPattern: "DEFAULT",
  codeblockSnippetPattern: "DEFAULT",
  calloutSnippetPattern: "DEFAULT",
  boldListItemSnippetPattern: "DEFAULT",
};

export const HEADINGS_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
  DEFAULT: /^#(\d+)\s(\w+)/g, // Standard format '#<NUMBER>'
};

export const CODEBLOCK_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
  DEFAULT: /^\.(\w+)\s/g,  // Standard format '.<LANG/FILE>'
  LONG: /^`{.(\w+)}`/g,     // Long format '`{<LANG/FILE>}`
};

export const CALLOUT_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
  DEFAULT: /^!(\w+)([+\-]?)(?:"([^"]*)")?\s/g
};

export const BOLD_LIST_ITEM_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
  DEFAULT: /^(\s*)([*\-+]|\d+\.)\s+(?!\*\*)([^:]*):(?:\s|$)?/g // Standard format '-/1. text`. Avoids already bolded text.
}

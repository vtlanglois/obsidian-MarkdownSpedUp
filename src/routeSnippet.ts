import { HEADINGS_SNIPPET_PATTERN_MAP, CODEBLOCK_SNIPPET_PATTERN_MAP, CALLOUT_SNIPPET_PATTERN_MAP } from "./settings";
import type { MarkdownSpedUpPluginSettings } from "./settings"
import handleCalloutSnippet from "./snippets/calloutSnippet";
import handleHeadingSnippet from "./snippets/headingSnippet";
import handleCodeblockSnippet from "./snippets/codeblockSnippet";

/**
 * Snippet router - detects snippet type and routes to appropriate handler
 */
export default function routeSnippet(
  line: string,
  lineNumber: number,
  settings: MarkdownSpedUpPluginSettings
): { modified: boolean; newLine: string; cursorPos?: number } {
  // Check for heading snippet
  const headingPattern =
    HEADINGS_SNIPPET_PATTERN_MAP[settings.headingSnippetPattern];
  headingPattern.lastIndex = 0; // Reset regex state
  const headingMatch = headingPattern.exec(line);
  if (headingMatch) {
    const result = handleHeadingSnippet(line, headingMatch);
    return {
      modified: true,
      newLine: result.newLine,
      cursorPos: result.cursorPos,
    };
  }

  // Check for codeblock snippet
  const codeblockPattern =
    CODEBLOCK_SNIPPET_PATTERN_MAP[settings.codeblockSnippetPattern];
  codeblockPattern.lastIndex = 0; // Reset regex state
  const codeblockMatch = codeblockPattern.exec(line);
  if (codeblockMatch) {
    const result = handleCodeblockSnippet(line, codeblockMatch);
    return {
      modified: true,
      newLine: result.newLine,
      cursorPos: result.cursorPos,
    };
  }

  // Check for callout snippet
  const calloutPattern =
    CALLOUT_SNIPPET_PATTERN_MAP[settings.calloutSnippetPattern];
  calloutPattern.lastIndex = 0; // Reset regex state
  const calloutMatch = calloutPattern.exec(line);
  if (calloutMatch) {
    const result = handleCalloutSnippet(line, calloutMatch);
    return {
      modified: true,
      newLine: result.newLine,
      cursorPos: result.cursorPos,
    };
  }

  return { modified: false, newLine: line };
}
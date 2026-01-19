import type { SnippetHandlerResponse } from "src/types";

/**
 * Bold list item snippet handler - converts [-/\d.]STRING: to a bold format.
 */
export default function handleBoldListItemSnippet(
  line: string,
  match: RegExpMatchArray
): SnippetHandlerResponse {
  console.log(match)

  const point = match[2];
  const text = match[3];

  const newContent = point + " " + "**" + text + "**:"
  const newLine = line.replace(match[0], newContent);
  const cursorPos = (match.index ?? 0) +(point + " " + "**" + text + "**:").length;

  return { newLine, cursorPos};
}
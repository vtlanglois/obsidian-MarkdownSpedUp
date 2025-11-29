import type { SnippetHandlerResponse } from "src/types";

/**
 * Callout snippet handler - converts !<TYPE>[+/-]{text} to Obsidian callouts
 */
export default function handleCalloutSnippet(
  line: string,
  match: RegExpMatchArray
): SnippetHandlerResponse {
  const typeStr = match[1];
  const modifier = match[2]; // + or - or empty
  const text = match[3]; // text inside brackets

  const newContext = ">[!" + typeStr + "]" + modifier + " " + (text ? text : "") + "\n>";
  const newLine = line.replace(match[0], newContext);

  const cursorPos = (match.index ?? 0) + (">[!" + typeStr + "]" + modifier + " " + (text ? text : "") + "\n>").length;
  return { newLine, cursorPos };
}
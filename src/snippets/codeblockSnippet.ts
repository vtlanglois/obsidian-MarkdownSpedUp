import type { SnippetHandlerResponse } from "src/types";

/**
 * Codeblock snippet handler - converts `{<LANG/FILE>}` to markdown codeblock
 */
export default function handleCodeblockSnippet(
  line: string,
  match: RegExpMatchArray
): SnippetHandlerResponse {
  const fileStr = match[1];
  const newContent = "```" + fileStr + "\n\n```";
  const newLine = line.replace(match[0], newContent);
  // Position cursor after the opening ``` and language (on the empty line)
  const cursorPos = (match.index ?? 0) + ("```" + fileStr).length + 1;
  return { newLine, cursorPos };
}
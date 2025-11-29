import type { SnippetHandlerResponse } from "src/types";


export default function handleHeadingSnippet(
	line: string,
	match: RegExpMatchArray
): SnippetHandlerResponse {
	const numberStr = match[1];
	const number = parseInt(numberStr, 10);
	const level = Math.max(1, Math.min(number, 6));
	const newLine = line.replace(match[0], "#".repeat(level) + " ");
	return { newLine };
}
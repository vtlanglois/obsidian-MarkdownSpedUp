export type SnippetHandlerResponse = {
  /** New line to replace the snipper with, following format conversion. */
  newLine: string,
  /** Optional number to allow for the cursor to move to a new position, such as for codeblock snippets  */
  cursorPos?: number
}

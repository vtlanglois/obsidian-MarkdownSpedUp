import { Editor, Plugin } from "obsidian";
import { App, PluginSettingTab, Setting } from "obsidian";

interface MarkdownSpedUpPluginSettings {
	headingSnippetPattern: string;
	codeblockSnippetPattern: string;
	calloutSnippetPattern: string;
}

const DEFAULT_SETTINGS: Partial<MarkdownSpedUpPluginSettings> = {
	headingSnippetPattern: "DEFAULT",
	codeblockSnippetPattern: "DEFAULT",
	calloutSnippetPattern: "DEFAULT",
};

const HEADINGS_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
	DEFAULT: /^#(\d+)\s(\w+)/g, // Standard format '#<NUMBER>'
};

const CODEBLOCK_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
	DEFAULT: /^\.(\w+)\s/g,  // Standard format '.<LANG/FILE>'
	LONG: /^`{.(\w+)}`/g,     // Long format '`{<LANG/FILE>}`
};

const CALLOUT_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
	DEFAULT: /^!(\w+)([+\-]?)(?:"([^"]*)")?\s/g
};

type SnippetHandlerResponse = {
	/** New line to replace the snipper with, following format conversion. */
	newLine: string,
	/** Optional number to allow for the cursor to move to a new position, such as for codeblock snippets  */
	cursorPos?: number
}

/**
 * Heading snippet handler - converts #<NUMBER> to markdown heading levels
 */
function handleHeadingSnippet(
	line: string,
	match: RegExpMatchArray
): SnippetHandlerResponse {
	const numberStr = match[1];
	const number = parseInt(numberStr, 10);
	const level = Math.max(1, Math.min(number, 6));
	const newLine = line.replace(match[0], "#".repeat(level) + " ");
	return { newLine };
}

/**
 * Codeblock snippet handler - converts `{<LANG/FILE>}` to markdown codeblock
 */
function handleCodeblockSnippet(
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

/**
 * Callout snippet handler - converts !<TYPE>[+/-]{text} to Obsidian callouts
 */
function handleCalloutSnippet(
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

/**
 * Snippet router - detects snippet type and routes to appropriate handler
 */
function routeSnippet(
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

export default class MarkdownSpedUpPlugin extends Plugin {
	settings: MarkdownSpedUpPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor) => {
				this.processCursorLine(editor);
			})
		);

		this.addSettingTab(new MarkdownSpedUpSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Process only the current line where the cursor is
	 */
	processCursorLine(editor: Editor): void {
		const cursor = editor.getCursor();
		const lineNumber = cursor.line;
		const line = editor.getLine(lineNumber);

		if (!line) return;

		const { modified, newLine, cursorPos } = routeSnippet(
			line,
			lineNumber,
			this.settings
		);

		if (modified) {
			editor.setLine(lineNumber, newLine);
			// Set cursor to the calculated position
			if (cursorPos !== undefined) {
				editor.setCursor({ line: lineNumber, ch: cursorPos });
			}
		}
	}
}

class MarkdownSpedUpSettingTab extends PluginSettingTab {
	plugin: MarkdownSpedUpPlugin;

	constructor(app: App, plugin: MarkdownSpedUpPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		const codeblockFormatDesc = document.createDocumentFragment();
		codeblockFormatDesc.appendText("Change codeblock snippet format:");
		const codeBlocklist = codeblockFormatDesc.createEl("ol");

		// Add list items
		codeBlocklist.createEl("li", { text: "DEFAULT: Use .<LANG/FILE> format" });
		codeBlocklist.createEl("li", { text: "LONG: Use`{.<LANG/FILE>}` format" });

		new Setting(containerEl)
			.setName("Snippet format for codeblocks")
			.setDesc(codeblockFormatDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("DEFAULT", "Default")
					.addOption("LONG", "Long")
					.setValue(this.plugin.settings.codeblockSnippetPattern)
					.onChange(async (value) => {
						this.plugin.settings.codeblockSnippetPattern = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);
	}
}

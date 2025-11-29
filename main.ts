import { Editor, Plugin } from "obsidian";
import { App, PluginSettingTab, Setting } from "obsidian";
import routeSnippet from "src/routeSnippet";
import type { MarkdownSpedUpPluginSettings } from "src/settings";
import { DEFAULT_SETTINGS } from "src/settings";

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

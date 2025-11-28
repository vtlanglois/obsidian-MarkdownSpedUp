import { Editor, Plugin } from "obsidian";
import { App, PluginSettingTab, Setting } from "obsidian";

interface MarkdownSpedUpPluginSettings {
	headingSnippetPattern: string;
	codeblockSnippetPattern: string;
}

const DEFAULT_SETTINGS: Partial<MarkdownSpedUpPluginSettings> = {
	headingSnippetPattern: "DEFAULT",
	codeblockSnippetPattern: "DEFAULT",
};

const HEADINGS_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
	DEFAULT: /^#(\d+)\s(\w+)/gm, // Standard format '#<NUMBER>'
	EMMET: /^#\*(\d+)\s(\w+)/gm, // Emmet format '#*<NUMBER>'
};

const CODEBLOCK_SNIPPET_PATTERN_MAP: Record<string, RegExp> = {
	DEFAULT: /`{.(\w+)}`/gm, // Standard format '`{<LANG/FILE>}`'
};

export default class MarkdownSpedUpPlugin extends Plugin {
	settings: MarkdownSpedUpPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor) => {
				this.detectSnippets(editor);
			})
		);

		this.addSettingTab(new MarkdownSpedUpSettingTab(this.app, this));
	}

	onunload() {}

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

	detectSnippets(editor: Editor): void {
		const content = editor.getValue();
		// Pattern to match #<NUMBER> at the start of a line
		const headingSnippetPattern =
			HEADINGS_SNIPPET_PATTERN_MAP[this.settings.headingSnippetPattern];

		const codeblockSnippetPattern =
			CODEBLOCK_SNIPPET_PATTERN_MAP[
				this.settings.codeblockSnippetPattern
			];

		let modified = false;
		let shouldMoveCursor = false;
		let previousCursor = undefined;
		let newContent = content.replace(
			headingSnippetPattern,
			(match, numberStr) => {
				modified = true;
				const number = parseInt(numberStr, 10);
				const level = Math.max(1, Math.min(number, 6));
				return "#".repeat(level) + " ";
			}
		);

		newContent = content.replace(
			codeblockSnippetPattern,
			(match, fileStr) => {
				modified = true;
				shouldMoveCursor = true;
				previousCursor = editor.getCursor();
				return "```{FILE}\n\n```".replace("{FILE}", fileStr);
			}
		);

		if (modified) {
			editor.setValue(newContent);
			if (shouldMoveCursor && previousCursor) {
				editor.setCursor(previousCursor);
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

		new Setting(containerEl).setName("Snippet Configurations").setHeading();

		const headingFormatDesc = document.createDocumentFragment();
		headingFormatDesc.appendText("Change heading snippet format: ");
		const list = headingFormatDesc.createEl("ol");

		// Add list items
		list.createEl("li", { text: "DEFAULT: Use #<NUMBER> format" });
		list.createEl("li", { text: "EMMET: Use #*<NUMBER> format" });

		new Setting(containerEl)
			.setName("Format for Headings")
			.setDesc(headingFormatDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("DEFAULT", "Default")
					.addOption("EMMET", "Emmet")
					.setValue(this.plugin.settings.headingSnippetPattern)
					.onChange(async (value) => {
						this.plugin.settings.headingSnippetPattern = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);
	}
}

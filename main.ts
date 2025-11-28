import {Editor, Plugin } from 'obsidian';

export default class MarkdownSpedUpPlugin extends Plugin {

	async onload() {
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor: Editor) => {
				this.detectSnippets(editor);
			})
		);
	}

	onunload() {

	}

	detectSnippets(editor: Editor): void {
		const content = editor.getValue();
		// Pattern to match #<NUMBER> at the start of a line
		const pattern = /^#(\d+)\s(\w+)/gm;

		let modified = false;
		const newContent = content.replace(pattern, (match, numberStr) => {
			modified = true;
			const number = parseInt(numberStr, 10);
			const level = Math.max(1, Math.min(number, 6));
			return '#'.repeat(level) + ' ';
		});

		if (modified) {
			editor.setValue(newContent);
		}
	}
}
